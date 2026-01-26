import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { User } from 'lucide-react';

const ProfileCard = ({ user }) => {
  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Body className="text-center p-4">
        <div className="bg-light rounded-circle p-3 mx-auto mb-3" style={{ width: 'fit-content' }}>
          <User size={60} className="text-secondary" />
        </div>
        <h5 className="fw-bold">{user?.name || '여행자'}</h5>
        <p className="text-muted small">{user?.email || 'traveler@example.com'}</p>
        <Button variant="outline-primary" size="sm" className="w-100 rounded-pill">
          프로필 수정
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProfileCard; 