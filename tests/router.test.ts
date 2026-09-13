import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProviderRouter } from '../lib/weather/router';
import { PROVIDER_REGISTRY } from '../config/weather-providers';

describe('ProviderRouter & Regional Priority', () => {
  let router: ProviderRouter;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    // Ensure standard test environment
    delete process.env.WEATHERAPI_API_KEY;
    delete process.env.VISUALCROSSING_API_KEY;
    delete process.env.METOFFICE_API_KEY;
    router = new ProviderRouter();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('Test 1: USA weather location routes to NOAA as Priority 1', () => {
    const candidates = router.selectCandidateProviders({
      latitude: 40.7128,
      longitude: -74.0060,
      countryCode: 'US',
    });

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].providerId).toBe('noaa');
    expect(candidates[0].priority).toBe(1);
  });

  it('Test 2: India weather location routes to MET Norway as Priority 1', () => {
    const candidates = router.selectCandidateProviders({
      latitude: 22.5726,
      longitude: 88.3639,
      countryCode: 'IN',
    });

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].providerId).toBe('metno');
    expect(candidates[0].priority).toBe(1);
  });

  it('Test 3: Norway weather location routes to MET Norway as Priority 1', () => {
    const candidates = router.selectCandidateProviders({
      latitude: 59.9139,
      longitude: 10.7522,
      countryCode: 'NO',
    });

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].providerId).toBe('metno');
    expect(candidates[0].priority).toBe(1);
  });

  it('Test 4: Finland weather location routes to FMI as Priority 1', () => {
    const candidates = router.selectCandidateProviders({
      latitude: 60.1699,
      longitude: 24.9384,
      countryCode: 'FI',
    });

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].providerId).toBe('fmi');
    expect(candidates[0].priority).toBe(1);
  });

  it('Test 5: Canada weather location routes to MSC GeoMet as Priority 1', () => {
    const candidates = router.selectCandidateProviders({
      latitude: 43.6532,
      longitude: -79.3832,
      countryCode: 'CA',
    });

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].providerId).toBe('msc_geomet');
    expect(candidates[0].priority).toBe(1);
  });

  it('Test 6: UK weather location routes to Met Office as Priority 1 when API key configured', () => {
    process.env.METOFFICE_API_KEY = 'test_met_office_key';

    const candidates = router.selectCandidateProviders({
      latitude: 51.5074,
      longitude: -0.1278,
      countryCode: 'GB',
    });

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].providerId).toBe('metoffice');
    expect(candidates[0].priority).toBe(1);
  });

  it('Test 7: Provider requiring API key without key is skipped automatically', () => {
    delete process.env.WEATHERAPI_API_KEY;

    const candidates = router.selectCandidateProviders({
      latitude: 22.5726,
      longitude: 88.3639,
      countryCode: 'IN',
    });

    const hasWeatherApi = candidates.some((c) => c.providerId === 'weatherapi');
    expect(hasWeatherApi).toBe(false); // Skipped because no API key is set
  });

  it('Test 8: Commercial Mode (SITE_COMMERCIAL=true) skips providers with non-commercial free endpoints', () => {
    process.env.OPENMETEO_ENABLED = 'true';
    process.env.OPENMETEO_MODE = 'public'; // free public non-commercial endpoint

    const candidates = router.selectCandidateProviders({
      latitude: 22.5726,
      longitude: 88.3639,
      countryCode: 'IN',
      siteCommercial: true,
    });

    const hasOpenMeteo = candidates.some((c) => c.providerId === 'openmeteo');
    expect(hasOpenMeteo).toBe(false); // Skipped under strict commercial mode
  });

  it('Test 9: Cross-region: User in India searching USA uses USA provider (NOAA)', () => {
    // When a user searches for New York, the target countryCode is 'US'
    const candidates = router.selectCandidateProviders({
      latitude: 40.7128,
      longitude: -74.0060,
      countryCode: 'US', // target weather location
    });

    expect(candidates[0].providerId).toBe('noaa');
  });

  it('Test 10: Cross-region: User in USA searching India uses India/Global provider (MET Norway)', () => {
    // When a user in USA searches for Kolkata, the target countryCode is 'IN'
    const candidates = router.selectCandidateProviders({
      latitude: 22.5726,
      longitude: 88.3639,
      countryCode: 'IN',
    });

    expect(candidates[0].providerId).toBe('metno');
  });
});
