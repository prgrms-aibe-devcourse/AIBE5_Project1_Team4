import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

// 우리가 만든 3가지 부품 가져오기
import TripSummaryBar from '../components/trip-detail/TripSummaryBar';
import TripMapSection from '../components/trip-detail/TripMapSection';
import TripItineraryList from '../components/trip-detail/TripItineraryList';

const TripDetailPage = () => {
  return (
    <div className="trip-detail-page bg-light min-vh-100 pb-5">
      {/* 1. 상단 정보 바 (화면 꽉 차게) */}
      <TripSummaryBar />
      
      {/* 2. 메인 컨텐츠 영역 (가운데 정렬) */}
      <Container className="mt-4">
        <Row>
          {/* 왼쪽: 지도 섹션 (넓게) */}
          <Col lg={8} className="mb-4">
            <TripMapSection />
          </Col>
          
          {/* 오른쪽: 일정 리스트 (좁게) */}
          <Col lg={4}>
            <TripItineraryList />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TripDetailPage;