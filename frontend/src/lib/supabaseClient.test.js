// src/lib/supabaseClient.test.js
import { describe, it, expect } from 'vitest';
import { supabase } from './supabaseClient';

describe('supabaseClient', () => {
  it('should create supabase client instance', () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
    expect(typeof supabase.auth).toBe('object');
    expect(typeof supabase.storage).toBe('object');
  });

  it('should have correct supabase url', () => {
    expect(supabase.supabaseUrl).toBe(import.meta.env.VITE_SUPABASE_URL);
  });
});
