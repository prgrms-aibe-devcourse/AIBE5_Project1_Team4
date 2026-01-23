import React from 'react';
import { KakaoLoginButton } from '../../components/KakoLoginButton';
import { Button } from 'react-bootstrap';
import { supabase } from '../../lib/supabaseClient';

const KakoLoginButtonPreview = () => {
  return (
    <div className="d-flex justify-content-between">
      <KakaoLoginButton />
      <Button
        variant="warning"
        className="text-white"
        onClick={() => supabase.auth.signOut()}
      >
        로그아웃
      </Button>
    </div>
  );
};

export default KakoLoginButtonPreview;
