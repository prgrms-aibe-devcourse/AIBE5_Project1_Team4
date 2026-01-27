// src/components/common/FloatingActionGroup.jsx

import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUp, ArrowDown, Map } from 'lucide-react';

// ✅ 보여주신 파일명(trips.service)에 맞춰 import
import { createTripDraft } from '@/services/trips.service'; 
import './FloatingActionGroup.css';

export default function FloatingActionGroup() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    setIsOpen(false);
  };

  const handleCreateTrip = async () => {
    if (isCreating) return;
    try {
      setIsCreating(true);
      // 서비스의 createTripDraft 호출 (이미 tripId를 반환하도록 구현되어 있음)
      const tripId = await createTripDraft(); 
      if (tripId) {
        navigate(`/trips/${tripId}/edit`);
      }
    } catch (error) {
      console.error('여행 생성 실패:', error);
      alert('여행을 생성하는 중 문제가 발생했습니다.');
    } finally {
      setIsCreating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="floating-action-group">
      {/* 메뉴 버튼들 */}
      <div className={`action-buttons ${isOpen ? 'open' : ''}`}>
        <Button 
          variant="light" 
          className="action-btn shadow-sm" 
          onClick={scrollToTop}
          title="맨 위로"
        >
          <ArrowUp size={20} />
        </Button>

        <Button 
          variant="primary" 
          className="action-btn shadow-sm" 
          onClick={handleCreateTrip}
          disabled={isCreating}
          title="새 여행 만들기"
        >
          {isCreating ? <Spinner animation="border" size="sm" /> : <Map size={20} />}
        </Button>

        <Button 
          variant="light" 
          className="action-btn shadow-sm" 
          onClick={scrollToBottom}
          title="맨 아래로"
        >
          <ArrowDown size={20} />
        </Button>
      </div>

      {/* 메인 토글 버튼 */}
      <Button 
        variant="dark" 
        className={`main-fab shadow ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus size={24} />
      </Button>
    </div>
  );
}