import { describe, it, expect } from 'vitest';
import { normalizeSlug, resolveLocationFromSlug, getLocationCanonicalUrl } from '../lib/location/slugs';

describe('Location Slugs & URL Normalization', () => {
  it('should clean and normalize slug strings', () => {
    expect(normalizeSlug('Kolkata')).toBe('kolkata');
    expect(normalizeSlug('New York')).toBe('new-york');
    expect(normalizeSlug('São Paulo')).toBe('sao-paulo');
    expect(normalizeSlug('London---UK')).toBe('london-uk');
  });

  it('should resolve predefined major cities from curated DB', async () => {
    const kolkata = await resolveLocationFromSlug('kolkata');
    expect(kolkata).not.toBeNull();
    expect(kolkata?.name).toBe('Kolkata');
    expect(kolkata?.countryCode).toBe('IN');
    expect(kolkata?.lat).toBeCloseTo(22.5726, 2);

    const london = await resolveLocationFromSlug('london');
    expect(london).not.toBeNull();
    expect(london?.name).toBe('London');
  });

  it('should generate canonical URLs correctly', () => {
    const url = getLocationCanonicalUrl('kolkata', 'https://weatherhub.example.com');
    expect(url).toBe('https://weatherhub.example.com/weather/kolkata');
  });

  it('should parse coordinate slugs gracefully', async () => {
    const coords = await resolveLocationFromSlug('22.57,88.36');
    expect(coords).not.toBeNull();
    expect(coords?.lat).toBeCloseTo(22.57, 1);
    expect(coords?.lon).toBeCloseTo(88.36, 1);
  });
});
