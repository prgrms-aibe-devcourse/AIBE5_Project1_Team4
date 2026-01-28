import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Card, Badge, Button, Spinner } from 'react-bootstrap';
import { Map, ChevronRight, Calendar, Plus } from 'lucide-react';
import { listMyTrips, listLikedTrips, listBookmarkedTrips } from '@/services/trips.service';

const ProfileTripList = ({ type }) => {
  const navigate = useNavigate(); 
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🏷️ 타입에 따른 제목 매핑 함수
  const getTitle = () => {
    switch (type) {
      case 'trips': return '최근 나의 여행';
      case 'likes': return '내가 찜한 여행';
      case 'bookmarks': return '북마크 리스트';
      default: return '';
    }
  };

  // 🗓️ 날짜 포맷팅 함수
  const formatDateRange = (start, end) => {
    if (!start || !end) return '날짜 정보 없음';
    return `${start} ~ ${end}`;
  };

  const loadData = async (isMore = false) => {
    setLoading(true);
    try {
      const params = { limit: 5, cursor: isMore ? cursor : null };

      let result;
      // ✅ 서비스 함수 호출 분기 처리
      if (type === 'trips') {
        result = await listMyTrips(params);
      } else if (type === 'likes') {
        result = await listLikedTrips(params);
      } else if (type === 'bookmarks') {
        result = await listBookmarkedTrips(params); 
      }

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
   * ✅ '더보기' 클릭 시 이동할 경로 설정
   */
  const handleMoreClick = () => {
    if (type === 'trips') {
      navigate('/trips/myTrips');
    } else if (type === 'likes') {
      navigate('/trips/likedList');
    } else if (type === 'bookmarks') {
      navigate('/trips/bookmarks');
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
      {/* ✅ [개선] 제목과 더보기 버튼을 한 줄(Flexbox)로 정렬 */}
      <div className="d-flex justify-content-between align-items-center mb-3 px-1">
        <h5 className="fw-bold mb-0">{getTitle()}</h5>
        
        {(type === 'trips' || type === 'likes' || type === 'bookmarks') && (
          <Button 
            variant="link" 
            className="text-decoration-none text-muted p-0 small d-flex align-items-center"
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
                  {/* description에 저장된 요약 정보나 날짜 범위를 표시 */}
                  {formatDateRange(item.start_date, item.end_date)}
                  {/* ✅ 지역 배지 표시 로직 */}
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

      {/* ✅ 커서 기반 추가 로드 버튼 */}
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