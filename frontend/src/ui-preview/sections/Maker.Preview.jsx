// frontend/src/AppTest.jsx
import MarkerMap from './components/kakaoMap/MarkerMap';

function AppTest1() {
    // 출발지와 도착지 설정 (성남 지역 테스트)
    const buskingPoints = [
        { content: "정자역 광장", lat: 37.3652, lng: 127.1082 },
        { content: "판교역 테크노밸리", lat: 37.3947, lng: 127.1112 },
        { content: "야탑역 광장", lat: 37.4112, lng: 127.1287 },
        { content: "서현역 로데오거리", lat: 37.3845, lng: 127.1235 }
    ];

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <h2 style={{ textAlign: 'center', padding: '10px' }}>🎸 버스킹 루트 테스트</h2>
            
            <MarkerMap 
                markers={buskingPoints} 
                center={{ lat: 37.39, lng: 127.11 }} // 분당 중심부
                level={7} 
                width="100%"
                height="100%"
            />
        </div>
    );
}

export default AppTest1;