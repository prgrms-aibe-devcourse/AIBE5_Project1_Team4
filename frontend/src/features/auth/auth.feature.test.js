import { describe, it, expect } from 'vitest';
import { sanitizeReturnTo } from '@/features/auth/auth.feature';

describe('sanitizeReturnTo', () => {
  it('정상 경로 허용', () => {
    expect(sanitizeReturnTo('/trips/1?tab=day1')).toBe('/trips/1?tab=day1');
  });

  it('외부 URL 차단', () => {
    expect(sanitizeReturnTo('https://evil.com')).toBe('/');
  });

  it('프로토콜 상대 URL 차단', () => {
    expect(sanitizeReturnTo('//evil.com')).toBe('/');
  });

  it('javascript 스킴 차단', () => {
    expect(sanitizeReturnTo('javascript:alert(1)')).toBe('/');
  });

  it('절대경로 아니면 차단', () => {
    expect(sanitizeReturnTo('trips/1')).toBe('/');
  });

  it('callback/login 루프 방지', () => {
    expect(sanitizeReturnTo('/auth/callback?code=123')).toBe('/');
    expect(sanitizeReturnTo('/login')).toBe('/');
  });
});
