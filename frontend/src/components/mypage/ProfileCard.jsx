import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { User } from 'lucide-react'; // 기본 아이콘

const ProfileCard = ({ user }) => {
  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Body className="text-center p-4">
        {/* 📸 프로필 이미지 영역 */}
        <div 
          className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light overflow-hidden" 
          style={{ width: '100px', height: '100px' }}
        >
          {/* 피드백 반영: avatar_url이 있으면 이미지를 띄우고, 없으면 기본 아이콘 노출 */}
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt="프로필" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <User size={60} className="text-secondary" />
          )}
        </div>

        {/* 👤 유저 정보 (이름, 이메일) */}
        <h5 className="fw-bold">{user?.name || '여행자'}</h5>
        <p className="text-muted small mb-3">{user?.email || '이메일 정보 없음'}</p>
        
        {/* 프로필 수정 버튼 (UI 유지) */}
        <Button variant="outline-primary" size="sm" className="w-100 rounded-pill">
          프로필 수정
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProfileCard;