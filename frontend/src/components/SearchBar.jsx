import { Form, InputGroup, Button, Spinner, ListGroup } from 'react-bootstrap';
import { Search, Sparkles } from 'lucide-react';
import './SearchBar.css';

/**
 * 검색바 컴포넌트
 * - AI 제안 기능 지원 (optional)
 * - 드롭다운 제안 목록
 */
const SearchBar = ({
  value,
  onChange,
  onSubmit,
  onFocus,
  placeholder = '여행지를 검색하세요...',
  size = 'lg',
  // AI 제안 관련 props
  showSuggestions = false,
  isLoading = false,
  error = null,
  normalizedQuery = null,
  suggestions = [],
  onSuggestionClick,
  onNormalizedClick,
  onCloseSuggestions,
}) => {
  const hasSuggestionContent =
    showSuggestions &&
    value.length >= 2 &&
    (isLoading || error || normalizedQuery || suggestions.length > 0);

  return (
    <div className="search-bar">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
        }}
      >
        <InputGroup size={size} className="search-bar__input-group">
          <Form.Control
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onFocus={onFocus}
            placeholder={placeholder}
            aria-label="검색"
            className="search-bar__input"
          />
          <Button variant="primary" type="submit" className="search-bar__btn">
            <Search size={20} />
          </Button>
        </InputGroup>
      </form>

      {/* AI 제안 드롭다운 */}
      {hasSuggestionContent && (
        <div className="search-bar__dropdown">
          {isLoading ? (
            <div className="search-bar__dropdown-loading">
              <Spinner size="sm" className="me-2" />
              AI가 검색어를 분석 중...
            </div>
          ) : error ? (
            <div className="search-bar__dropdown-error">
              AI 제안을 불러올 수 없습니다.
              <div className="text-muted mt-1">Enter를 눌러 검색하세요</div>
            </div>
          ) : (
            <>
              {/* 정규화된 쿼리 */}
              {normalizedQuery && normalizedQuery !== value && (
                <div
                  className="search-bar__normalized"
                  onClick={onNormalizedClick}
                >
                  <div className="d-flex align-items-center gap-2 text-primary">
                    <Sparkles size={16} />
                    <span className="small">이 검색어를 의미하셨나요?</span>
                  </div>
                  <div className="fw-bold mt-1">{normalizedQuery}</div>
                </div>
              )}

              {/* 추천 검색어 */}
              {suggestions.length > 0 && (
                <ListGroup variant="flush" className="search-bar__suggestions">
                  <ListGroup.Item className="search-bar__suggestions-header">
                    <Sparkles size={14} className="me-1" />
                    추천 검색어
                  </ListGroup.Item>
                  {suggestions.map((suggestion, idx) => (
                    <ListGroup.Item
                      key={idx}
                      action
                      onClick={() => onSuggestionClick?.(suggestion)}
                      className="search-bar__suggestion-item"
                    >
                      <Search size={14} className="me-2 text-muted" />
                      {suggestion}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}

              {/* 결과 없음 */}
              {!normalizedQuery && suggestions.length === 0 && (
                <div className="search-bar__dropdown-empty">
                  검색어를 입력해보세요
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 드롭다운 외부 클릭 시 닫기 */}
      {hasSuggestionContent && (
        <div className="search-bar__backdrop" onClick={onCloseSuggestions} />
      )}
    </div>
  );
};

export default SearchBar;
