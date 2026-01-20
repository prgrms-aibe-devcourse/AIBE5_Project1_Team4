import React, { Suspense, useMemo, useState } from 'react';

/**
 * 1) eager: true  -> 빌드 시점에 전부 import (간단, 빠름)
 * 2) eager: false -> lazy import (섹션이 많아지면 추천)
 *
 * 처음엔 eager: true 추천.
 */
const modules = import.meta.glob('../ui-preview/sections/*.preview.jsx', {
  eager: true,
});

export default function UiPreview() {
  const sections = useMemo(() => {
    return Object.entries(modules)
      .map(([path, mod]) => {
        // 모듈 타입 방어
        const Comp = mod?.default;
        const meta = mod?.meta ?? {};
        const title =
          meta.title ?? path.split('/').pop().replace('.preview.jsx', '');
        const order = meta.order ?? 999;

        return { path, title, order, Comp };
      })
      .filter((s) => typeof s.Comp === 'function')
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  }, []);

  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter((s) => s.title.toLowerCase().includes(q));
  }, [sections, query]);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>UI Preview</h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components..."
          style={{ flex: 1, padding: '8px 10px' }}
        />
        <span style={{ opacity: 0.7 }}>{filtered.length} sections</span>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {filtered.map(({ path, title, Comp }) => (
          <section
            key={path}
            style={{
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                {title}
              </h2>
              <code style={{ opacity: 0.6, fontSize: 12 }}>{path}</code>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
              <Comp />
            </Suspense>
          </section>
        ))}
      </div>
    </div>
  );
}
