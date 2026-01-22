// src/ui-preview/sections/TripCard.preview.jsx
import TripCard from '../../components/trips/TripCard';
import { Container, Row, Col } from 'react-bootstrap';

const TripCardPreview = () => {
  return (
    <Container className="p-4 border rounded">
      <h3>여행 카드 (TripCard)</h3>
      <p>홈 화면 리스트에 사용될 카드입니다.</p>
      
      <Row>
        {/* 카드 1: 기본 형태 */}
        <Col xs={12} md={4}>
          <TripCard />
        </Col>
        
        {/* 카드 2: 데이터 넣었을 때 */}
        <Col xs={12} md={4}>
          <TripCard 
            title="부산 2박 3일 먹방 여행" 
            author="파이썬" 
            likes={99} 
            period="2박 3일" 
          />
        </Col>
      </Row>
    </Container>
  );
};

export default TripCardPreview;