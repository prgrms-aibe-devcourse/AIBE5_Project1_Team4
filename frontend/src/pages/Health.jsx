import React, { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { unwrap } from '@/services/_core/errors';

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

  // 체크 정의(데이터화)
  const CHECK_DEFS = useMemo(() => {
    return [
      {
        key: 'dbThemes',
        title: 'DB: select themes (public table)',
        ctx: 'health.dbThemes',
        run: async () => supabase.from('themes').select('id, slug').limit(1),
        okMessage: (data) => `themes select OK (rows: ${data?.length ?? 0})`,
      },
      {
        key: 'authSession',
        title: 'Auth: getSession()',
        ctx: 'health.authSession',
        run: async () => supabase.auth.getSession(),
        okMessage: (data) =>
          data?.session
            ? 'session exists (logged in)'
            : 'no session (logged out)',
      },
      {
        key: 'edgeSuggest',
        title: 'Edge: ai-suggest-query (optional)',
        ctx: 'health.edgeSuggest',
        run: async () =>
          supabase.functions.invoke('ai-suggest-query', {
            body: { q: 'coffee shop gangnam' },
          }),
        okMessage: () => 'edge invoke OK (ai-suggest-query)',
        optional: true,
      },
      {
        key: 'storageList',
        title: 'Storage: list images/trips (optional)',
        ctx: 'health.storageList',
        run: async () =>
          supabase.storage.from('images').list('trips', { limit: 1 }),
        okMessage: (data) => `storage list OK (items: ${data?.length ?? 0})`,
        optional: true,
      },
    ];
  }, []);

  const initialChecks = useMemo(() => {
    const map = {
      env: {
        status: env.url === 'OK' && env.key === 'OK' ? 'ok' : 'fail',
        message: '',
      },
    };

    for (const c of CHECK_DEFS) {
      map[c.key] = { status: 'idle', message: '' };
    }
    return map;
  }, [env.url, env.key, CHECK_DEFS]);

  const [checks, setChecks] = useState(initialChecks);
  const [running, setRunning] = useState(false);

  const setCheck = (key, patch) => {
    setChecks((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  // 공통 실행 래퍼 + unwrap 규칙 적용
  async function runCheck(def) {
    setCheck(def.key, { status: 'running', message: '' });

    try {
      const res = await def.run();

      // unwrap은 에러면 throw, 성공이면 data 반환
      const data = unwrap(res, def.ctx);

      setCheck(def.key, {
        status: 'ok',
        message: def.okMessage?.(data) ?? 'OK',
      });
      return true;
    } catch (e) {
      // unwrap이 던진 AppError(또는 기타 에러)
      const msg =
        e?.name === 'AppError'
          ? `[${e.kind}] ${e.message}`
          : (e?.message ?? String(e));

      setCheck(def.key, { status: 'fail', message: msg });
      return false;
    }
  }

  async function runAll() {
    setRunning(true);
    try {
      for (const def of CHECK_DEFS) {
        // env 미설정이면 굳이 나머지 다 돌릴 이유가 없으니, 여기서 끊고 싶으면 아래 if 추가 가능
        // if (checks.env.status !== 'ok') break;
        await runCheck(def);
      }
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
        {/* ENV */}
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

        {/* Checks */}
        {CHECK_DEFS.map((def) => (
          <CheckRow
            key={def.key}
            title={def.title}
            status={checks[def.key]?.status ?? 'idle'}
            message={checks[def.key]?.message ?? ''}
            onRun={() => runCheck(def)}
            disabled={running}
          />
        ))}
      </div>

      <p style={{ marginTop: 18, opacity: 0.65, fontSize: 12 }}>
        * optional 체크(Edge/Storage)는 프로젝트 정책(RLS/버킷 정책/함수 인증)에
        따라 FAIL이 날 수 있음.
      </p>
    </div>
  );
}
