import { useState } from "react";
import { useLocation } from "react-router-dom";
import { KakaoLoginButton } from "../components/KakoLoginButton";

/**
 * NOTE:
 * - 이 페이지는 로그인 "UI 레이아웃"만 담당합니다.
 * - 인증/세션 로직은 팀의 useAuth() 또는 상위 AuthProvider에서 처리합니다.
 * - Supabase 직접 호출(signInWithPassword)은 팀 합의에 따라 제거했습니다.
 */
const LoginPage = () => {
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI 상태(연동 후에는 useAuth() 상태로 대체될 수 있음)
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const returnTo = new URLSearchParams(location.search).get("returnTo");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    // 레이아웃-only 버전: 실제 로그인 호출은 하지 않음
    // 추후 팀장님이 useAuth() 흐름에 연결할 예정
    setLoading(true);
    try {
      setErrorMsg("로그인 기능은 추후 연동됩니다. (현재: 레이아웃 전용)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          background: "white",
        }}
      >
        <h1 style={{ margin: 0, marginBottom: "16px" }}>로그인</h1>

        {returnTo && (
          <p style={{ marginTop: 0, marginBottom: "12px", fontSize: "14px" }}>
            로그인 후 이전 페이지로 이동합니다.
          </p>
        )}

        {errorMsg && (
          <div
            style={{
              marginBottom: "12px",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(220, 53, 69, 0.35)",
              background: "rgba(220, 53, 69, 0.08)",
              fontSize: "14px",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: "12px" }}>
          <label style={{ display: "grid", gap: "6px" }}>
            <span style={{ fontSize: "14px" }}>이메일</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              style={{
                height: "44px",
                padding: "0 12px",
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.15)",
                outline: "none",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "6px" }}>
            <span style={{ fontSize: "14px" }}>비밀번호</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              style={{
                height: "44px",
                padding: "0 12px",
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.15)",
                outline: "none",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: "44px",
              borderRadius: "10px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              fontWeight: 600,
            }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

<div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "12px", opacity: 0.6 }}>
    <div style={{ height: "1px", flex: 1, background: "rgba(0,0,0,0.12)" }} />
    <span style={{ fontSize: "12px" }}>또는</span>
    <div style={{ height: "1px", flex: 1, background: "rgba(0,0,0,0.12)" }} />
  </div>

  <KakaoLoginButton />
</div>


        {/* 레이아웃-only 안내 (삭제 가능) */}
        <p style={{ marginTop: "12px", marginBottom: 0, fontSize: "12px", opacity: 0.7 }}>
          현재 화면은 레이아웃 전용입니다. 로그인 연동은 추후 적용됩니다.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
