import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner } from 'react-bootstrap';
import { Map, ChevronRight, Calendar } from 'lucide-react';
import { listMyTrips, listLikedTrips } from '@/services/trips.service';

const ProfileTripList = ({ type }) => {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🗓️ 날짜 포맷팅 함수 (RecentTrips 스타일 재현)
  const formatDateRange = (start, end) => {
    if (!start || !end) return '날짜 정보 없음';
    // DB의 '2026-01-27' 형식을 '1월 27일' 등으로 바꾸거나 그대로 출력
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

  if (loading && items.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      {items.length > 0 ? (
        items.map((item) => (
          <Card key={item.id} className="border-0 shadow-sm mb-3" style={{ cursor: 'pointer' }}>
            <Card.Body className="d-flex align-items-center py-3">
              {/* 🗺️ 지도 아이콘 (RecentTrips 동일 스타일) */}
              <div className="rounded-3 p-3 me-3" style={{ backgroundColor: '#e7f1ff' }}>
                <Map size={24} className="text-primary" />
              </div>
              
              <div className="flex-grow-1">
                <div className="fw-bold fs-6 text-dark">{item.title}</div>
                <div className="text-muted small d-flex align-items-center mt-1">
                  <Calendar size={14} className="me-1" />
                  {/* ✅ 날짜 필드 수정: item.date가 없을 경우 start_date와 end_date를 조합합니다. */}
                  {item.date || formatDateRange(item.start_date, item.end_date)}
                  
                  {/* 📍 지역 배지 */}
                  {item.regions && item.regions.length > 0 && (
                    <Badge bg="light" text="dark" className="ms-2 fw-normal border">
                      {item.regions[0]}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* 상세 보기 화살표 */}
              <ChevronRight size={18} className="text-muted" />
            </Card.Body>
          </Card>
        ))
      ) : (
        <div className="text-center py-5 text-muted small bg-white rounded shadow-sm">
          등록된 항목이 없습니다.
        </div>
      )}

      {/* 📑 전체보기 버튼 (페이지네이션) */}
      {cursor && (
        <div className="text-center mt-2">
          <Button 
            variant="link" 
            className="text-decoration-none text-muted small" 
            onClick={() => loadData(true)} 
            disabled={loading}
          >
            {loading ? '불러오는 중...' : '전체보기'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileTripList;