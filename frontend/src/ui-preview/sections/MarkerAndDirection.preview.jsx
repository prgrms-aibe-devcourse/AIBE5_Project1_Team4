// frontend/src/AppTest.jsx
import MarkerAndDirectionMap from '../../components/kakaoMap/MarkerAndDirectionMap';

function AppTest1() {
    // 1. 출발지와 도착지 설정 (성남 지역 테스트)
    const tourPoints = [
        { content: "정자역", lat: 37.3652, lng: 127.1082 },
        { content: "판교역", lat: 37.3947, lng: 127.1112 },
        { content: "야탑역", lat: 37.4112, lng: 127.1287 }
    ];
    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <h2 style={{ textAlign: 'center', padding: '10px' }}>🎸 버스킹 루트 테스트</h2>
            
            <MarkerAndDirectionMap 
                markers={tourPoints} 
                center={{ lat: 37.39, lng: 127.11 }} 
                level={7} 
            />
        </div>
    );
}

export default AppTest1;