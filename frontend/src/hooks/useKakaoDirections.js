//좌표(마커)들을 넣으면 실제 도로 좌표 배열 반환 훅
import { useState, useCallback } from 'react';

export const useKakaoDirections = () => {
  const [path, setPath] = useState([]);             //api에서 받아온 도로 죄표 저장할 배열
  const [loading, setLoading] = useState(false);    //데이터 가져오는 중인지 확인
  const [error, setError] = useState(null);         //통신 중 에러

  const getDirections = useCallback(async (markers) => {
    
    if (!markers || markers.length < 2) return;           //출발지나 도착지 없으면 실행 x

    setLoading(true);   // 로딩 상태를 true로 바꿔 화면에 로딩 중임을 알릴 준비를 합니다.
    setError(null);     // 이전의 에러 기록을 깨끗이 지웁니다.

    const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY; // .env 파일에서 rest api 호출
    const origin = markers[0];
    const destination = markers[markers.length - 1];

    // 시작과 끝을 제외한 중간 지점들을 경유지(waypoints)로 설정
    const waypoints = markers.slice(1, -1)
      .map(m => `${m.lng},${m.lat}`)
      .join('|');

    // 경유지가 있으면 파라미터 추가, 없으면 빈 문자열
    const waypointParam = waypoints ? `&waypoints=${waypoints}` : '';
    const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin.lng},${origin.lat}&destination=${destination.lng},${destination.lat}${waypointParam}&priority=RECOMMEND`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `KakaoAK ${REST_API_KEY}`,
          'Content-Type': 'application/json'
        }
    });

    if (!response.ok) throw new Error('경로 데이터를 가져오는데 실패했습니다.');

    //서버에서 준 JSON 데이터 자바스크립트 객체로 변환
    const data = await response.json();
      
    //도로 좌표 데이터 가공
    const linePath = [];
        data.routes[0].sections.forEach(section => {
            section.roads.forEach(road => {
                road.vertexes.forEach((vertex, index) => {
                    if (index % 2 === 0) {
                        linePath.push({ 
                            lat: road.vertexes[index + 1], 
                            lng: road.vertexes[index] 
                        });
                    }
                });
            });
        });

      setPath(linePath);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { path, getDirections, loading, error };
};