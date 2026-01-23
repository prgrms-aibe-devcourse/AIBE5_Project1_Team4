import { describe, it, expect } from 'vitest';
import { toProfileUpsertPayload } from './profile.mapper';

describe('toProfileUpsertPayload', () => {
  it('maps id/email and metadata fields', () => {
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
      email: 'a@b.com',
      display_name: 'Full Name',
      avatar_url: 'http://img',
    });
  });

  it('falls back to metadata. name when full_name is missing', () => {
    const user = {
      id: 'u-2',
      email: 'x@y.com',
      user_metadata: { name: 'Nick' },
    };

    expect(toProfileUpsertPayload(user)).toEqual({
      id: 'u-2',
      email: 'x@y.com',
      display_name: 'Nick',
      avatar_url: null,
    });
  });

  it('uses nulls when optional fields are missing', () => {
    const user = { id: 'u-3', user_metadata: {} };

    expect(toProfileUpsertPayload(user)).toEqual({
      id: 'u-3',
      email: null,
      display_name: null,
      avatar_url: null,
    });
  });
});
