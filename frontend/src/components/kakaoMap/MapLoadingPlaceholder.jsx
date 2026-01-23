/**
 * 지도 로딩/에러 상태를 표시하는 플레이스홀더 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.width - 컨테이너 너비 (기본값: "100%")
 * @param {string} props.height - 컨테이너 높이 (기본값: "100vh")
 * @param {string} props.message - 표시할 메시지
 * @param {'loading' | 'error'} props.variant - 상태 종류
 */
export default function MapLoadingPlaceholder({
  width = '100%',
  height = '100vh',
  message = '지도를 불러오는 중...',
  variant = 'loading',
}) {
  const isError = variant === 'error';

  return (
    <div
      style={{
        width,
        height,
        background: isError ? '#fff5f5' : '#f9f9f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isError ? '#c53030' : '#666',
        fontSize: '14px',
      }}
    >
      {!isError && (
        <span
          style={{
            marginRight: '8px',
            animation: 'spin 1s linear infinite',
          }}
        >
          ⏳
        </span>
      )}
      {message}
    </div>
  );
}
