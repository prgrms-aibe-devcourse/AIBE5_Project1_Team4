import React, { useState, useEffect } from 'react';
import MapContainer from '../../components/kakaoMap/MapContainer';    // 경로 확인

const MapTestPreview = () => {

  // 1. 훅에서 반환될 데이터 형식을 시뮬레이션 (숫자 좌표 필수)
  const [testCurrentDayPos, setTestCurrentDayPos] = useState([]);
  const [testSearchPlacePos, setTestSearchPlacePos] = useState([]);

  // 2. 가상의 성남시 주변 좌표 데이터
  const dummyPoints = [
    { id: 'p1', name: '판교역', lat: 37.3947, lng: 127.1111 },
    { id: 'p2', name: '성남시청', lat: 37.4200, lng: 127.1265 },
    { id: 'p3', name: '모란역', lat: 37.4321, lng: 127.1290 },
    { id: 'p4', name: '야탑역', lat: 37.4113, lng: 127.1286 },
  ];

  // [시나리오 1] 여행 경로 테스트 (1, 2, 3번 마커 + 파란 선)
  const runRouteTest = () => {
    setTestSearchPlacePos([]); // 검색 마커 제거
    setTestCurrentDayPos([dummyPoints[0], dummyPoints[1], dummyPoints[2]]);
  };

  // [시나리오 2] 검색 결과 마킹 테스트 (별표 마커)
  const runSearchTest = () => {
    setTestSearchPlacePos([dummyPoints[3]]); // 야탑역을 별표로 표시
  };

  const resetAll = () => {
    setTestCurrentDayPos([]);
    setTestSearchPlacePos([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#333' }}>🗺️ MapContainer 기능 통합 테스트</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={runRouteTest} style={btnStyle}>1. 경로 계산 테스트</button>
        <button onClick={runSearchTest} style={btnStyle}>2. 검색 마킹 테스트</button>
        <button onClick={resetAll} style={{ ...btnStyle, background: '#666' }}>초기화</button>
      </div>

      {/* 지도가 표시될 컨테이너 */}
      <div style={{ 
        width: '100%', 
        height: '500px', 
        border: '3px solid #4A90E2', 
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <MapContainer 
          mapCurrentDayPos={testCurrentDayPos}
          mapSearchPlacePos={testSearchPlacePos}
        />
      </div>
    </div>
  );
};

// 버튼 스타일
const btnStyle = {
  padding: '12px 20px',
  background: '#4A90E2',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'transform 0.1s active'
  
};

export default MapTestPreview;