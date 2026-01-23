import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const toKoreanAuthError = (message) => {
  if (!message) return "로그인에 실패했습니다.";
  if (message.includes("Invalid login credentials"))
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (message.includes("Email not confirmed"))
    return "이메일 인증이 필요합니다.";
  if (message.includes("Too many requests"))
    return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
  return message;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(toKoreanAuthError(error.message));
        return;
      }

      navigate(returnTo || "/", { replace: true });
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
      </div>
    </div>
  );
};

export default LoginPage;
