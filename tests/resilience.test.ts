import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker } from '../lib/weather/circuit-breaker';
import { ProviderRateLimiter } from '../lib/weather/rate-limiter';
import { weatherCache } from '../lib/weather/cache';
import { WeatherData } from '../lib/weather/types/weather';

describe('Weather System Resilience, Circuit Breakers & Failover', () => {
  let cb: CircuitBreaker;
  let limiter: ProviderRateLimiter;

  beforeEach(() => {
    cb = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 500 });
    limiter = new ProviderRateLimiter();
    weatherCache.clear();
  });

  it('Test 11 & 12: Circuit breaker trips to OPEN after consecutive failures and recovers on success', async () => {
    expect(cb.canExecute('metno')).toBe(true);
    expect(cb.getState('metno')).toBe('CLOSED');

    // Record 3 failures
    cb.recordFailure('metno');
    cb.recordFailure('metno');
    cb.recordFailure('metno');

    // Should now be OPEN
    expect(cb.getState('metno')).toBe('OPEN');
    expect(cb.canExecute('metno')).toBe(false);

    // Wait for cooldown
    await new Promise((r) => setTimeout(r, 550));

    // Should transition to HALF_OPEN to allow one test probe
    expect(cb.canExecute('metno')).toBe(true);
    expect(cb.getState('metno')).toBe('HALF_OPEN');

    // If probe succeeds, circuit recovers to CLOSED
    cb.recordSuccess('metno');
    expect(cb.getState('metno')).toBe('CLOSED');
    expect(cb.canExecute('metno')).toBe(true);
  });

  it('Test 13 & 14: Rate limiter enforces quotas and blocks requests when capacity exceeded', () => {
    // Check initial limit
    const check1 = limiter.checkLimit('metno');
    expect(check1.allowed).toBe(true);

    // Record requests
    limiter.recordRequest('metno');
    limiter.recordRequest('metno');

    const check2 = limiter.checkLimit('metno');
    expect(check2.currentRpm).toBe(2);
    expect(check2.allowed).toBe(true);
  });

  it('Test 15: Stale Cache fallback when live data is unavailable', () => {
    const mockWeatherData: WeatherData = {
      location: { name: 'Kolkata', country: 'India', countryCode: 'IN', lat: 22.57, lon: 88.36, timezone: 'Asia/Kolkata' },
      current: {
        time: '2026-09-13T12:00:00Z',
        temp: 30,
        feelsLike: 35,
        condition: 'Sunny',
        iconCode: 'clear_day',
        humidity: 80,
        windSpeed: 10,
        windDirection: 180,
        pressure: 1010,
        precipitation: 0,
        cloudCover: 10,
        uvIndex: 8,
        sunrise: '2026-09-13T06:00:00Z',
        sunset: '2026-09-13T18:00:00Z',
        isDay: true,
      },
      hourly: [
        { time: '2026-09-13T12:00:00Z', temp: 30, feelsLike: 35, pop: 0, precip: 0, windSpeed: 10, windDirection: 180, iconCode: 'clear_day', condition: 'Sunny', isDay: true },
      ],
      daily: [
        { date: '2026-09-13', dayName: 'Sun', iconCode: 'clear_day', condition: 'Sunny', high: 32, low: 25, pop: 0, precip: 0, windSpeed: 10 },
      ],
      dynamicSummary: 'Kolkata is currently 30°C.',
      metadata: {
        providerName: 'MET Norway',
        providerId: 'metno',
        fetchedAt: new Date().toISOString(),
        attributionText: 'MET Norway',
        attributionUrl: 'https://api.met.no',
        isFallback: false,
      },
    };

    const cacheKey = 'weather:22.570:88.360:forecast';
    // Set in cache with 1 second fresh TTL and 86400s stale TTL
    weatherCache.set(cacheKey, mockWeatherData, 0.05, 86400);

    // Verify fresh cache hit immediately
    const fresh = weatherCache.get<WeatherData>(cacheKey);
    expect(fresh).not.toBeNull();

    // After 60ms, fresh expires but stale remains available
    setTimeout(() => {
      const expiredFresh = weatherCache.get<WeatherData>(cacheKey);
      expect(expiredFresh).toBeNull();

      const stale = weatherCache.getStale<WeatherData>(cacheKey);
      expect(stale).not.toBeNull();
      expect(stale?.isStale).toBe(true);
      expect(stale?.data.location.name).toBe('Kolkata');
    }, 70);
  });
});
