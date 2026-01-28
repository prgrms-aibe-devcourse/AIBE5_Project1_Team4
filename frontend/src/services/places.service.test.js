// src/services/places.service.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ✅ hoist-safe: factory 내부에서 vi.fn() 생성
vi.mock('@/services/_core/functions', () => {
  return {
    invokeFunction: vi.fn(),
  };
});

vi.mock('./auth.service', () => {
  return {
    getSession: vi.fn(),
  };
});

import { invokeFunction } from '@/services/_core/functions';
import { getSession } from './auth.service';
import { searchPlaces } from './places.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('places.service', () => {
  it('기본 파라미터로 search-place를 호출한다 (page=1, size=15)', async () => {
    invokeFunction.mockResolvedValueOnce({
      data: {
        places: [{ id: 'p1' }],
        meta: { total: 1, page: 1, size: 1, is_end: true },
      },
    });

    const res = await searchPlaces({ query: '테스트' });

    expect(invokeFunction).toHaveBeenCalledWith('search-place', {
      body: {
        query: '테스트',
        page: 1,
        size: 15,
        latitude: undefined,
        longitude: undefined,
        radius: undefined,
      },
    });

    expect(res).toEqual({
      places: [{ id: 'p1' }],
      meta: { total: 1, page: 1, size: 1, is_end: true },
    });
  });

  it('옵션 파라미터(latitude/longitude/radius/page/size)를 전달한다', async () => {
    invokeFunction.mockResolvedValueOnce({
      data: { places: [], meta: { total: 0, page: 2, size: 15, is_end: true } },
    });

    await searchPlaces({
      query: '카페',
      page: 2,
      size: 10,
      latitude: 37.5,
      longitude: 127.0,
      radius: 1500,
    });

    expect(invokeFunction).toHaveBeenCalledWith('search-place', {
      body: {
        query: '카페',
        page: 2,
        size: 10,
        latitude: 37.5,
        longitude: 127.0,
        radius: 1500,
      },
    });
  });

  it('invokeFunction 결과가 null/undefined면 fallback을 반환한다', async () => {
    invokeFunction.mockResolvedValueOnce(null);

    const res = await searchPlaces({ query: '테스트', page: 3, size: 7 });

    expect(res).toEqual({
      places: [],
      meta: { total: 0, page: 3, size: 7, is_end: true },
    });
  });

  it('invokeFunction 결과에 data가 없으면 fallback을 반환한다', async () => {
    invokeFunction.mockResolvedValueOnce({});

    const res = await searchPlaces({ query: '테스트' });

    expect(res).toEqual({
      places: [],
      meta: { total: 0, page: 1, size: 15, is_end: true },
    });
  });

  it('invokeFunction이 throw하면 그대로 전파된다', async () => {
    const err = new Error('network');
    invokeFunction.mockRejectedValueOnce(err);

    await expect(searchPlaces({ query: '테스트' })).rejects.toBe(err);
  });

  it('auth.service.getSession은 현재 searchPlaces에서 사용되지 않는다(호출되지 않음)', async () => {
    invokeFunction.mockResolvedValueOnce({
      data: { places: [], meta: { total: 0, page: 1, size: 0, is_end: true } },
    });

    await searchPlaces({ query: '테스트' });

    expect(getSession).not.toHaveBeenCalled();
  });
});
