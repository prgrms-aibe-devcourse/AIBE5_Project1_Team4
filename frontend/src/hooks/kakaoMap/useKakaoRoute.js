//좌표들 입력 -> 좌표들 끼리의 이동 경로, 이동 시간, 이동 거리 계산 훅

import { useState, useCallback } from "react";

export const useKakaoRoute = () => {

  const [routeData, setRouteData] = useState({
    path: [],      // 지도에 그릴 전체 경로 좌표
    sections: [],  // 각 마커 사이 구간 정보 (시간, 거리, 중간좌표 포함)
    totalDuration: null, // 전체 소요 시간 (분)
    totalDistance: null, // 전체 이동 거리 (km)
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateRoute = useCallback(async (markers) => {
    // 최소 2개 이상의 좌표가 있어야 계산 가능
    if (!markers || markers.length < 2) return;

    setLoading(true);
    setError(null);

    const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
    
    // 출발지, 목적지, 경유지 설정
    const origin = markers[0];
    const destination = markers[markers.length - 1];
    const waypoints = markers.slice(1, -1)
      .map(m => `${m.lng},${m.lat}`)
      .join('|');
    
    const waypointParam = waypoints ? `&waypoints=${waypoints}` : '';
    const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin.lng},${origin.lat}&destination=${destination.lng},${destination.lat}${waypointParam}&priority=RECOMMEND`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `KakaoAK ${REST_API_KEY}` }
      });

      if (!response.ok) throw new Error('경로 데이터를 가져오는 데 실패했습니다.');
      const data = await response.json();

      // API 응답 데이터 가공
      const { summary, sections } = data.routes[0];
      const fullPath = [];
      
      // 구간별(sections) 데이터 추출
      const sectionsInfo = sections.map((section) => {
        const sectionPath = [];
        section.roads.forEach(road => {
          road.vertexes.forEach((vertex, index) => {
            if (index % 2 === 0) {
              const point = { lat: road.vertexes[index + 1], lng: road.vertexes[index] };
              fullPath.push(point); // 전체 경로에 추가
              sectionPath.push(point); // 이 구간만의 경로에 추가
            }
          });
        });

        // 구간의 정중앙 좌표 계산 (말풍선 표시용)
        const midIndex = Math.floor(sectionPath.length / 2);
        
        return {
          midPoint: sectionPath[midIndex],
          duration: Math.floor(section.duration / 60), // 초 -> 분
          distance: (section.distance / 1000).toFixed(1), // m -> km
        };
      });

      setRouteData({
        path: fullPath,
        sections: sectionsInfo,
        totalDuration: Math.floor(summary.duration / 60),
        totalDistance: (summary.distance / 1000).toFixed(1),
      });

    } catch (err) {
      setError(err.message);
      console.error("Route calculation error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { routeData, calculateRoute, loading, error };
};



