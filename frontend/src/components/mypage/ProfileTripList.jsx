import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Card, Badge, Button, Spinner } from 'react-bootstrap';
import { Map, ChevronRight, Calendar, Plus } from 'lucide-react';
import { listMyTrips, listLikedTrips } from '@/services/trips.service';

const ProfileTripList = ({ type }) => {
  const navigate = useNavigate(); 
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🗓️ 날짜 포맷팅 함수
  const formatDateRange = (start, end) => {
    if (!start || !end) return '날짜 정보 없음';
    return `${start} ~ ${end}`;
  };

  const loadData = async (isMore = false) => {
    setLoading(true);
    try {
      const params = { limit: 5, cursor: isMore ? cursor : null };
      const result = type === 'trips' ? await listMyTrips(params) : await listLikedTrips(params);
      
      if (result) {
        setItems(prev => (isMore ? [...prev, ...result.items] : result.items));
        setCursor(result.nextCursor);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [type]);

  /**
   * ✅ '더보기' 클릭 시 이동할 경로 설정 (trips 케이스 포함)
   */
  const handleMoreClick = () => {
    if (type === 'trips') {
      navigate('/trips/myList'); // 🚀 내 여행 전체 목록 페이지 (제작 예정)
    } else if (type === 'likes') {
      navigate('/trips/likedList'); // 찜한 목록 페이지
    } else if (type === 'bookmarks') {
      navigate('/trips/bookmarks'); // 북마크 목록 페이지
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      {/* ✅ 상단 더보기 버튼 노출 조건에 type === 'trips' 추가 */}
      <div className="d-flex justify-content-end mb-2">
        {(type === 'trips' || type === 'likes' || type === 'bookmarks') && (
          <Button 
            variant="link" 
            className="text-decoration-none text-muted p-0 me-1 small d-flex align-items-center"
            onClick={handleMoreClick}
          >
            더보기 <Plus size={14} className="ms-1" />
          </Button>
        )}
      </div>

      {items.length > 0 ? (
        items.map((item) => (
          <Card 
            key={item.id} 
            className="border-0 shadow-sm mb-3" 
            style={{ cursor: 'pointer' }}
            // ✅ 각 여행 클릭 시 상세 페이지로 이동
            onClick={() => navigate(`/trips/${item.id}`)} 
          >
            <Card.Body className="d-flex align-items-center py-3">
              <div className="rounded-3 p-3 me-3" style={{ backgroundColor: '#e7f1ff' }}>
                <Map size={24} className="text-primary" />
              </div>
              
              <div className="flex-grow-1">
                <div className="fw-bold fs-6 text-dark">{item.title}</div>
                <div className="text-muted small d-flex align-items-center mt-1">
                  <Calendar size={14} className="me-1" />
                  {item.date || formatDateRange(item.start_date, item.end_date)}
                  {item.regions && item.regions.length > 0 && (
                    <Badge bg="light" text="dark" className="ms-2 fw-normal border">
                      {item.regions[0]}
                    </Badge>
                  )}
                </div>
              </div>
              
              <ChevronRight size={18} className="text-muted" />
            </Card.Body>
          </Card>
        ))
      ) : (
        <div className="text-center py-5 text-muted small bg-white rounded shadow-sm">
          등록된 항목이 없습니다.
        </div>
      )}

      {cursor && (
        <div className="text-center mt-2">
          <Button 
            variant="link" 
            className="text-decoration-none text-muted small" 
            onClick={() => loadData(true)} 
            disabled={loading}
          >
            {loading ? '불러오는 중...' : '목록 더 불러오기'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileTripList;