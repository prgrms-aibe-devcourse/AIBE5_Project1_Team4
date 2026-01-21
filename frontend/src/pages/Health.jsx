import React, { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

function badgeStyle(status) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    border: '1px solid rgba(0,0,0,0.12)',
  };

  if (status === 'ok') return { ...base, background: 'rgba(0,128,0,0.08)' };
  if (status === 'fail') return { ...base, background: 'rgba(255,0,0,0.08)' };
  if (status === 'running') return { ...base, background: 'rgba(0,0,0,0.05)' };
  return { ...base, background: 'transparent' };
}

function StatusBadge({ status }) {
  const label =
    status === 'ok'
      ? 'OK'
      : status === 'fail'
        ? 'FAIL'
        : status === 'running'
          ? 'RUNNING'
          : 'IDLE';
  return <span style={badgeStyle(status)}>{label}</span>;
}

export default function Health() {
  const env = useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return {
      url: url ? 'OK' : 'MISSING',
      key: key ? 'OK' : 'MISSING',
      urlValue: url ?? '',
    };
  }, []);

  const [checks, setChecks] = useState({
    env: {
      status: env.url === 'OK' && env.key === 'OK' ? 'ok' : 'fail',
      message: '',
    },
    dbThemes: { status: 'idle', message: '' },
    authSession: { status: 'idle', message: '' },
    edgeSuggest: { status: 'idle', message: '' }, // 선택
    storageList: { status: 'idle', message: '' }, // 선택
  });

  const [running, setRunning] = useState(false);

  const setCheck = (key, patch) => {
    setChecks((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  async function runDbThemes() {
    setCheck('dbThemes', { status: 'running', message: '' });
    const res = await supabase.from('themes').select('id, slug').limit(1);
    if (res.error) {
      setCheck('dbThemes', { status: 'fail', message: `${res.error.message}` });
      return false;
    }
    setCheck('dbThemes', {
      status: 'ok',
      message: `themes select OK (rows: ${res.data?.length ?? 0})`,
    });
    return true;
  }

  async function runAuthSession() {
    setCheck('authSession', { status: 'running', message: '' });
    const res = await supabase.auth.getSession();
    if (res.error) {
      setCheck('authSession', {
        status: 'fail',
        message: `${res.error.message}`,
      });
      return false;
    }
    const hasSession = !!res.data?.session;
    setCheck('authSession', {
      status: 'ok',
      message: hasSession
        ? 'session exists (logged in)'
        : 'no session (logged out)',
    });
    return true;
  }

  // Edge Function: ai-suggest-query (너희 문서 기준 인증 없이 사용 가능 "선택적")
  // 실제 배포/설정에 따라 인증이 필요할 수 있어 "선택" 체크로 둠
  async function runEdgeSuggest() {
    setCheck('edgeSuggest', { status: 'running', message: '' });
    const res = await supabase.functions.invoke('ai-suggest-query', {
      body: { q: 'coffee shop gangnam' },
    });
    if (res.error) {
      setCheck('edgeSuggest', {
        status: 'fail',
        message: `${res.error.message}`,
      });
      return false;
    }
    setCheck('edgeSuggest', {
      status: 'ok',
      message: 'edge invoke OK (ai-suggest-query)',
    });
    return true;
  }

  // Storage: list는 버킷/정책에 따라 막힐 수 있음. (Public URL과 별개)
  // 그래서 이것도 "선택"으로 둠
  async function runStorageList() {
    setCheck('storageList', { status: 'running', message: '' });
    const res = await supabase.storage
      .from('images')
      .list('trips', { limit: 1 });
    if (res.error) {
      setCheck('storageList', {
        status: 'fail',
        message: `${res.error.message}`,
      });
      return false;
    }
    setCheck('storageList', {
      status: 'ok',
      message: `storage list OK (items: ${res.data?.length ?? 0})`,
    });
    return true;
  }

  async function runAll() {
    setRunning(true);
    try {
      await runDbThemes();
      await runAuthSession();
      await runEdgeSuggest(); // 필요 없으면 주석 처리 가능
      await runStorageList(); // 필요 없으면 주석 처리 가능
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 920, margin: '0 auto' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>
            Health Check
          </h1>
          <p style={{ marginTop: 8, opacity: 0.7 }}>
            DEV 전용 연결 점검 페이지 (env / DB / Auth / Edge / Storage)
          </p>
        </div>
        <button
          onClick={runAll}
          disabled={running}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.15)',
            cursor: running ? 'not-allowed' : 'pointer',
            fontWeight: 800,
          }}
        >
          {running ? 'Running...' : 'Run All'}
        </button>
      </header>

      <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
        <div
          style={{
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 12,
            padding: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontWeight: 900 }}>ENV</div>
            <StatusBadge status={checks.env.status} />
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              opacity: 0.8,
              lineHeight: 1.6,
            }}
          >
            <div>
              VITE_SUPABASE_URL: <b>{env.url}</b>
            </div>
            <div>
              VITE_SUPABASE_ANON_KEY: <b>{env.key}</b>
            </div>
            {env.urlValue ? (
              <div style={{ opacity: 0.6 }}>URL: {env.urlValue}</div>
            ) : null}
          </div>
        </div>

        <CheckRow
          title="DB: select themes (public table)"
          status={checks.dbThemes.status}
          message={checks.dbThemes.message}
          onRun={runDbThemes}
          disabled={running}
        />

        <CheckRow
          title="Auth: getSession()"
          status={checks.authSession.status}
          message={checks.authSession.message}
          onRun={runAuthSession}
          disabled={running}
        />

        <CheckRow
          title="Edge: ai-suggest-query (optional)"
          status={checks.edgeSuggest.status}
          message={checks.edgeSuggest.message}
          onRun={runEdgeSuggest}
          disabled={running}
        />

        <CheckRow
          title="Storage: list images/trips (optional)"
          status={checks.storageList.status}
          message={checks.storageList.message}
          onRun={runStorageList}
          disabled={running}
        />
      </div>

      <p style={{ marginTop: 18, opacity: 0.65, fontSize: 12 }}>
        * Edge/Storage는 프로젝트 정책(RLS/버킷 정책/함수 인증)에 따라 FAIL이 날
        수 있어서 optional로 둠.
      </p>
    </div>
  );
}

function CheckRow({ title, status, message, onRun, disabled }) {
  return (
    <div
      style={{
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusBadge status={status} />
          <button
            onClick={onRun}
            disabled={disabled}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.15)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            Run
          </button>
        </div>
      </div>
      {message ? (
        <div
          style={{
            marginTop: 10,
            fontSize: 13,
            opacity: 0.8,
            whiteSpace: 'pre-wrap',
          }}
        >
          {message}
        </div>
      ) : (
        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.45 }}>—</div>
      )}
    </div>
  );
}
