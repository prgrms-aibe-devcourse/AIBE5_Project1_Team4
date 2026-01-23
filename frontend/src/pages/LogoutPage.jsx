import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
    };
    run();
  }, [navigate]);

  return <p>로그아웃 중...</p>;
};

export default LogoutPage;
