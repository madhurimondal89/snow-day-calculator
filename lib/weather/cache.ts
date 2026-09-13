import { WeatherData } from './types/weather';

interface CacheEntry<T> {
  data: T;
  freshExpiresAt: number; // Unix epoch ms
  staleExpiresAt: number; // Stale fallback expiration
  createdAt: number;
}

class InMemoryTTLCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxEntries: number;

  constructor(maxEntries = 1000) {
    this.maxEntries = maxEntries;
  }

  /**
   * Get fresh cached data if still within fresh TTL
   */
  public get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.freshExpiresAt) {
      // Past fresh TTL, but keep for stale fallback unless expired past staleExpiresAt
      if (now > entry.staleExpiresAt) {
        this.store.delete(key);
      }
      return null;
    }

    return entry.data as T;
  }

  /**
   * Get stale cached data for emergency fallback when all providers are failing
   */
  public getStale<T>(key: string): { data: T; cachedAt: string; isStale: boolean } | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.staleExpiresAt) {
      this.store.delete(key);
      return null;
    }

    const isStale = now > entry.freshExpiresAt;

    return {
      data: entry.data as T,
      cachedAt: new Date(entry.createdAt).toISOString(),
      isStale,
    };
  }

  /**
   * Store data with fresh TTL and extended stale fallback retention (24 hours)
   */
  public set<T>(key: string, data: T, freshTtlSeconds: number, staleTtlSeconds = 86400): void {
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }

    const now = Date.now();
    this.store.set(key, {
      data,
      freshExpiresAt: now + freshTtlSeconds * 1000,
      staleExpiresAt: now + staleTtlSeconds * 1000,
      createdAt: now,
    });
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public delete(key: string): boolean {
    return this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }

  public size(): number {
    return this.store.size;
  }
}

// Global cache instance singleton
const globalForCache = globalThis as unknown as { weatherCache?: InMemoryTTLCache };
export const weatherCache = globalForCache.weatherCache ?? new InMemoryTTLCache(1000);
if (process.env.NODE_ENV !== 'production') globalForCache.weatherCache = weatherCache;
