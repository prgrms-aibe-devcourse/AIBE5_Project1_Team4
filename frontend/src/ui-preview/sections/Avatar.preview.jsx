import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import UserAvatar from '../../components/common/UserAvatar';


const AvatarPreview = () => {
  return (
    <Container className="p-4 border rounded bg-white">
      <h3 className="mb-3">사용자 프로필 (UserAvatar)</h3>
      <p className="text-muted">접속자 표시, 작성자 프로필 등에 사용됩니다.</p>
      
      <Row className="g-4 align-items-center">
        {/* 1. 이미지가 있는 경우 */}
        <Col xs="auto" className="text-center">
          <UserAvatar
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100" 
            name="김철수" 
            size={60} 
          />
          <div className="mt-2 small">이미지 있음 (60px)</div>
        </Col>

        {/* 2. 이미지가 없는 경우 (이름 첫 글자) */}
        <Col xs="auto" className="text-center">
          <UserAvatar name="마스터" size={60} />
          <div className="mt-2 small">이미지 없음 (기본)</div>
        </Col>

        {/* 3. 작은 사이즈 (헤더용) */}
        <Col xs="auto" className="text-center">
          <UserAvatar name="Admin" size={32} />
          <div className="mt-2 small">작은 크기 (32px)</div>
        </Col>

        {/* 4. 접속자 목록 (겹쳐 보이기 예시) */}
        <Col xs="auto">
          <div className="d-flex">
            <div style={{ marginRight: -10 }}><UserAvatar name="A" size={40} /></div>
            <div style={{ marginRight: -10 }}><UserAvatar name="B" size={40} /></div>
            <div style={{ marginRight: -10 }}><UserAvatar name="C" size={40} /></div>
          </div>
          <div className="mt-2 small text-center">접속자 목록 예시</div>
        </Col>
      </Row>
    </Container>
  );
};

export default AvatarPreview;