import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Mail, Lock, PlaneTakeoff } from "lucide-react"; 
import { KakaoLoginButton } from "../components/KakaoLoginButton";

const LoginPage = () => {
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
    setLoading(true);
    try {
      setErrorMsg("로그인 기능은 추후 연동됩니다. (현재: 레이아웃 전용)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      backgroundColor: "#f8f9fa" 
    }}>
      <Container>
        <Card className="mx-auto border-0 shadow-lg" style={{ maxWidth: "400px", borderRadius: "20px" }}>
          <Card.Body className="p-5 d-flex flex-column align-items-center">
            {/* 상단 로고 및 텍스트 수정: Travel Planner -> Trip */}
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <PlaneTakeoff size={32} className="text-primary" />
              </div>
              <h3 className="fw-bold text-dark">Trip Planner</h3> {/* 이름 수정 완료! */}
              <p className="text-muted small">당신의 여행을 계획해보세요</p>
            </div>

            {returnTo && (
              <Alert variant="info" className="py-2 small border-0 text-center w-100" style={{ maxWidth: "300px" }}>
                로그인 후 이전 페이지로 이동합니다.
              </Alert>
            )}

            {errorMsg && (
              <Alert variant="danger" className="py-2 small border-0 w-100" style={{ maxWidth: "300px" }}>
                {errorMsg}
              </Alert>
            )}

            <Form onSubmit={onSubmit} className="w-100 d-flex flex-column align-items-center">
              {/* 이메일 입력창: 카카오 버튼 크기(300px)에 맞춤 */}
              <Form.Group className="mb-3 position-relative w-100" style={{ maxWidth: "300px" }}>
                <Form.Label className="small fw-semibold text-muted">이메일</Form.Label>
                <div className="position-relative">
                  <Mail size={18} className="position-absolute text-muted" style={{ left: '12px', top: '13px' }} />
                  <Form.Control
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '40px', height: '48px', borderRadius: '12px' }}
                    className="border-light-subtle shadow-sm"
                  />
                </div>
              </Form.Group>

              {/* 비밀번호 입력창: 카카오 버튼 크기(300px)에 맞춤 */}
              <Form.Group className="mb-4 position-relative w-100" style={{ maxWidth: "300px" }}>
                <Form.Label className="small fw-semibold text-muted">비밀번호</Form.Label>
                <div className="position-relative">
                  <Lock size={18} className="position-absolute text-muted" style={{ left: '12px', top: '13px' }} />
                  <Form.Control
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '40px', height: '48px', borderRadius: '12px' }}
                    className="border-light-subtle shadow-sm"
                  />
                </div>
              </Form.Group>

              {/* 일반 로그인 버튼: 카카오 버튼 크기(300px)에 맞춤 */}
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="fw-bold shadow-sm"
                style={{ 
                  width: '100%', 
                  maxWidth: '300px', 
                  height: '48px', 
                  borderRadius: '12px' 
                }}
              >
                {loading ? "로그인 중..." : "로그인"}
              </Button>
            </Form>

            {/* 구분선: 카카오 버튼 크기에 맞춤 */}
            <div className="d-flex align-items-center gap-2 my-4 opacity-50 w-100" style={{ maxWidth: "300px" }}>
              <hr className="flex-grow-1" />
              <span className="small text-muted fw-bold">OR</span>
              <hr className="flex-grow-1" />
            </div>

            {/* 카카오 버튼 영역: 중앙 정렬 */}
            <div className="d-flex justify-content-center w-100">
              <KakaoLoginButton />
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LoginPage;