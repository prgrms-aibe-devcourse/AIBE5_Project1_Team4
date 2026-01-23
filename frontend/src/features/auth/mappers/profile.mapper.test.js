import { describe, it, expect } from 'vitest';
import { toProfileUpsertPayload } from './profile.mapper';

describe('toProfileUpsertPayload', () => {
  it('maps id, username from email, and metadata fields', () => {
    const user = {
      id: 'u-1',
      email: 'a@b.com',
      user_metadata: {
        full_name: 'Full Name',
        avatar_url: 'http://img',
      },
    };

    expect(toProfileUpsertPayload(user)).toEqual({
      id: 'u-1',
      username: 'a',
      full_name: 'Full Name',
      avatar_url: 'http://img',
    });
  });

  it('falls back to metadata.name when full_name is missing', () => {
    const user = {
      id: 'u-2',
      email: 'x@y.com',
      user_metadata: { name: 'Nick' },
    };

    expect(toProfileUpsertPayload(user)).toEqual({
      id: 'u-2',
      username: 'x',
      full_name: 'Nick',
      avatar_url: null,
    });
  });

  it('generates username from user id when email is missing', () => {
    const user = { id: 'abcd1234-5678-90ab', user_metadata: {} };

    expect(toProfileUpsertPayload(user)).toEqual({
      id: 'abcd1234-5678-90ab',
      username: 'user_abcd1234',
      full_name: null,
      avatar_url: null,
    });
  });
});
