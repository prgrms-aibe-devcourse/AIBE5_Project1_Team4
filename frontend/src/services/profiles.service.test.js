import { describe, it, expect, vi, beforeEach } from 'vitest';

const { fromMock, upsertMock } = vi.hoisted(() => {
  const upsertMock = vi.fn();
  const fromMock = vi.fn(() => ({ upsert: upsertMock }));
  return { fromMock, upsertMock };
});

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: fromMock },
}));

import { upsertProfile } from './profiles.service';

describe('upsertProfile (service)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls supabase.from("profiles").upsert with onConflict=id and fills updated_at', async () => {
    upsertMock.mockResolvedValueOnce({ error: null });

    const payload = {
      id: 'u-1',
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: null,
    };

    await upsertProfile(payload);

    expect(fromMock).toHaveBeenCalledWith('profiles');
    expect(upsertMock).toHaveBeenCalledTimes(1);

    const [rowArg, optionsArg] = upsertMock.mock.calls[0];
    expect(optionsArg).toEqual({ onConflict: 'id' });

    // updated_at는 채워져 있어야 함(값 자체는 시간이라 형태만 체크)
    expect(rowArg).toMatchObject({
      id: 'u-1',
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: null,
    });
    expect(typeof rowArg.updated_at).toBe('string');
    expect(rowArg.updated_at.length).toBeGreaterThan(0);
  });

  it('throws AppError when supabase returns error', async () => {
    upsertMock.mockResolvedValueOnce({ error: new Error('boom') });

    await expect(
      upsertProfile({
        id: 'u-1',
        username: 'testuser',
        full_name: null,
        avatar_url: null,
      }),
    ).rejects.toMatchObject({
      name: 'AppError',
      context: 'profilesService.upsertProfile',
    });
  });

  it('does not override updated_at if provided', async () => {
    upsertMock.mockResolvedValueOnce({ error: null });

    await upsertProfile({
      id: 'u-1',
      username: 'testuser',
      full_name: null,
      avatar_url: null,
      updated_at: '2026-01-01T00:00:00.000Z',
    });

    const [rowArg] = upsertMock.mock.calls[0];
    expect(rowArg.updated_at).toBe('2026-01-01T00:00:00.000Z');
  });
});
