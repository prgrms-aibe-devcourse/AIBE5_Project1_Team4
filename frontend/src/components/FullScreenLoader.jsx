export default function FullScreenLoader({ message = '처리 중...' }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        zIndex: 9999,
      }}
    >
      <div className="spinner-border" role="status" />
      <p style={{ marginTop: 12 }}>{message}</p>
    </div>
  );
}
