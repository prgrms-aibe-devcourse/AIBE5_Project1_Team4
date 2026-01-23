/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 상대적 시간 포맷팅 (예: "3분 전", "2시간 전", "2일 전")
 * @param {string|Date} date - 날짜 문자열 또는 Date 객체
 * @returns {string} 상대적 시간 문자열
 */
export function getTimeAgo(date) {
  if (!date) return '';

  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now - targetDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  // 7일 이상이면 정확한 날짜 표시
  return targetDate.toLocaleDateString('ko-KR');
}

/**
 * 날짜를 "YYYY.MM.DD" 형식으로 포맷팅
 * @param {string} dateString - "YYYY-MM-DD" 형식의 날짜 문자열
 * @returns {string} "YYYY.MM.DD" 형식의 문자열
 */
export function formatDateDot(dateString) {
  if (!dateString) return '';
  return dateString.replace(/-/g, '.');
}

/**
 * 날짜 범위를 포맷팅 (예: "2024.01.01 ~ 2024.01.05")
 * @param {string} startDate - 시작 날짜
 * @param {string} endDate - 종료 날짜
 * @returns {string} 포맷된 날짜 범위 문자열
 */
export function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return '날짜 미정';
  if (!endDate) return formatDateDot(startDate);
  if (!startDate) return formatDateDot(endDate);
  return `${formatDateDot(startDate)} ~ ${formatDateDot(endDate)}`;
}

/**
 * 날짜 범위를 포맷팅 (예: "1월 25일 - 1월 26일")
 * @param {string} startDate - 시작 날짜
 * @param {string} endDate - 종료 날짜
 * @returns {string} 포맷된 날짜 범위 문자열
 */
export function formatDateRangeWithLocale(start_date, end_date) {
  return start_date && end_date
    ? `${new Date(start_date).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      })} - ${new Date(end_date).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      })}`
    : '날짜 미정';
}

/**
 * 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환
 * @returns {string} "YYYY-MM-DD" 형식의 오늘 날짜
 */
export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Date 객체를 "YYYY-MM-DD" 형식 문자열로 변환
 * @param {Date} date - Date 객체
 * @returns {string} "YYYY-MM-DD" 형식의 문자열
 */
export function formatLocalDate(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
