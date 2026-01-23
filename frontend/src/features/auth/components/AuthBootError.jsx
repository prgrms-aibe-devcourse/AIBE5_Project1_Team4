export default function AuthBootError({ onRetry }) {
  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{ margin: 0 }}>세션 확인 실패</h2>
        <p style={{ opacity: 0.8, marginTop: 8 }}>
          네트워크 상태를 확인한 뒤 다시 시도해주세요.
        </p>

        <button style={btn} onClick={onRetry}>
          재시도
        </button>
      </div>
    </div>
  );
}

const wrap = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  padding: 16,
};

const card = {
  width: 'min(420px, 100%)',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 12,
  padding: 16,
};

const btn = {
  width: '100%',
  height: 44,
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
};
