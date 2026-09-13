import { describe, it, expect } from 'vitest';
import { weatherCache } from '../lib/weather/cache';

describe('In-Memory TTL Cache', () => {
  it('should store and retrieve data within TTL', () => {
    weatherCache.set('test_key', { temp: 25 }, 60);
    const cached = weatherCache.get<{ temp: number }>('test_key');
    expect(cached).not.toBeNull();
    expect(cached?.temp).toBe(25);
  });

  it('should return null for non-existent keys', () => {
    const cached = weatherCache.get('non_existent_key_123');
    expect(cached).toBeNull();
  });

  it('should respect deletion and clearing', () => {
    weatherCache.set('delete_me', 'val', 60);
    expect(weatherCache.has('delete_me')).toBe(true);
    weatherCache.delete('delete_me');
    expect(weatherCache.has('delete_me')).toBe(false);
  });
});
