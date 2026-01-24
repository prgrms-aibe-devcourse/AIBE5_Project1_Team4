import { getTimeAgo } from '@/utils/date';
import { Bookmark, Heart } from 'lucide-react'; // 하트와 책갈피 아이콘 임포트
import { Badge, Button, Card } from 'react-bootstrap'; // 부트스트랩 컴포넌트 임포트
import { formatDateRangeWithLocale } from '../../utils/date';
import './TripCard.css';

/**
 * 여행 카드 컴포넌트
 * 기획서 기반: 공개된 여행 일정을 카드로 표시.
 * - 커버 이미지
 * - 제목, 설명
 * - 지역, 기간, 멤버 수 (메타 정보)
 * - 작성자 정보
 * - 좋아요, 북마크 통계
 */
const TripCard = ({
  trip, // 여행 정보 데이터 (ID, 제목, 설명, 이미지 등)
  onCardClick, // 카드 클릭 시 호출되는 콜백 함수
  onLikeClick, // 좋아요 버튼 클릭 시 호출되는 콜백 함수
  onBookmarkClick, // 북마크 버튼 클릭 시 호출되는 콜백 함수
  isLiked = false, // 현재 여행이 좋아요 상태인지 표시
  isBookmarked = false, // 현재 여행이 북마크 상태인지 표시
}) => {
  // 필수 데이터가 없으면 아무것도 렌더링하지 않음
  if (!trip) return null;

  const {
    id, // 여행 고유 ID (클릭, 좋아요 등에서 사용)
    title, // 여행 제목
    description, // 여행 설명
    cover_image_url, // 여행 커버 이미지 URL
    start_date, // 여행 시작 날짜
    end_date, // 여행 종료 날짜
    region, // 여행 지역
    author, // 작성자 정보 (이름, 아바타 등)
    like_count = 0, // 좋아요 개수
    bookmark_count = 0, // 북마크 개수
    member_count = 1, // 여행 참가자 수
    created_at, // 여행 생성 시간
  } = trip;

  // 여행 기간 계산 및 포맷팅
  // 예: "2월 15 - 2월 18"
  const tripDuration = formatDateRangeWithLocale(start_date, end_date);

  return (
    // Bootstrap Card: 섀도우 효과와 함께 카드 레이아웃
    <Card
      className="trip-card h-100 shadow-sm"
      onClick={() => onCardClick?.(id)} // 카드 전체 클릭 이벤트
      style={{ cursor: 'pointer' }}
    >
      {/* 이미지 영역 */}
      <div className="trip-card__image-container position-relative">
        {/* 이미지가 있으면 표시, 없으면 기본 이모지 표시 */}
        {cover_image_url ? (
          <Card.Img
            variant="top"
            src={cover_image_url}
            alt={title}
            className="trip-card__image"
          />
        ) : (
          // 이미지 없을 때의 플레이스홀더
          <div className="trip-card__image-placeholder bg-primary d-flex align-items-center justify-content-center">
            <span className="text-white fs-3">🗺️</span>
          </div>
        )}

        {/* 좋아요, 찜 버튼 그룹 (세로 배치) */}
        <div className="trip-card__button-group position-absolute top-0 end-0 m-2 d-flex flex-column gap-2">
          {/* 좋아요 버튼: 클릭 시 하트가 빨간색으로 채워짐 */}
          <Button
            variant="light"
            className="trip-card__like-btn rounded-circle"
            onClick={(e) => {
              e.stopPropagation(); // 부모 카드 클릭 이벤트 전파 방지
              onLikeClick?.(id);
            }}
            size="sm"
          >
            <Heart
              size={18}
              fill={isLiked ? '#e74c3c' : 'none'} // 좋아요 상태에 따라 채움 여부
              color={isLiked ? '#e74c3c' : '#999'} // 색상 변경
              strokeWidth={2}
            />
          </Button>

          {/* 찜 버튼: 클릭 시 북마크가 보라색으로 채워짐 */}
          <Button
            variant="light"
            className="trip-card__bookmark-btn rounded-circle"
            onClick={(e) => {
              e.stopPropagation(); // 부모 카드 클릭 이벤트 전파 방지
              onBookmarkClick?.(id);
            }}
            size="sm"
          >
            <Bookmark
              size={18}
              fill={isBookmarked ? '#667eea' : 'none'} // 북마크 상태에 따라 채움 여부
              color={isBookmarked ? '#667eea' : '#999'} // 색상 변경
              strokeWidth={2}
            />
          </Button>
        </div>
      </div>

      {/* 카드 본문 */}
      <Card.Body className="d-flex flex-column gap-2">
        {/* 여행 제목 */}
        <Card.Title className="trip-card__title mb-2 fw-bold">
          {title}
        </Card.Title>

        {/* 여행 설명 (있을 경우만 표시) */}
        {description && (
          <Card.Text className="trip-card__description text-muted small mb-2">
            {/* 60자 이상이면 말줄임표 추가 */}
            {description.length > 60
              ? `${description.substring(0, 60)}...`
              : description}
          </Card.Text>
        )}

        {/* 메타 정보 뱃지 (지역, 기간, 인원) */}
        <div className="d-flex gap-2 flex-wrap mb-2">
          {/* 여행 지역 */}
          {region && (
            <Badge bg="light" text="dark" className="border border-secondary">
              📍 {region}
            </Badge>
          )}
          {/* 여행 기간 */}
          {tripDuration && (
            <Badge bg="light" text="dark" className="border border-secondary">
              📅 {tripDuration}
            </Badge>
          )}
          {/* 참가자 수 */}
          {member_count > 0 && (
            <Badge bg="light" text="dark" className="border border-secondary">
              👥 {member_count}명
            </Badge>
          )}
        </div>

        {/* 시각적 구분선 */}
        <hr className="my-2" />

        {/* 작성자 정보 (프로필 사진, 이름, 작성 시간) */}
        {author && (
          <div className="d-flex align-items-center gap-2 mb-2">
            {/* 작성자 프로필 사진 또는 초성 표시 */}
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.name}
                className="rounded-circle"
                width="32"
                height="32"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              // 프로필 사진이 없으면 이름의 첫 글자 표시
              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: '32px', height: '32px', fontSize: '14px' }}
              >
                {author.name?.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-grow-1 min-w-0">
              {/* 작성자 이름 */}
              <div className="trip-card__author-name fw-500 text-dark small">
                {author.name || '익명'}
              </div>
              {/* 작성 시간 (상대적 시간) */}
              <div
                className="trip-card__author-time text-muted"
                style={{ fontSize: '0.75rem' }}
              >
                {getTimeAgo(created_at)}
              </div>
            </div>
          </div>
        )}

        {/* 통계 섹션 (좋아요, 북마크 개수) */}
        <div className="d-flex gap-3 pt-2 border-top">
          {/* 좋아요 개수 */}
          <small className="text-muted">
            <Heart size={14} className="me-1" style={{ display: 'inline' }} />
            {like_count}
          </small>
          {/* 북마크 개수 */}
          <small className="text-muted">🔖 {bookmark_count}</small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TripCard;
