import { LocationInfo } from '../weather/types/weather';
import { weatherCache } from '../weather/cache';

export interface GeocodingResult {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code: string;
  country: string;
  admin1?: string; // State / Region
  admin2?: string;
  admin3?: string;
  admin4?: string;
  timezone: string;
  population?: number;
  postcodes?: string[];
}

export interface OpenMeteoGeocodingResponse {
  results?: GeocodingResult[];
  generationtime_ms?: number;
}

export function generateLocationSlug(name: string, region?: string, countryCode?: string): string {
  const cleanName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return cleanName;
}

export class GeocodingProvider {
  private timeoutMs = 6000;
  private cacheTtlSeconds = Number(process.env.GEOCODING_CACHE_SECONDS || 86400);

  public async searchLocations(query: string, count = 8): Promise<LocationInfo[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }

    const cacheKey = `geocode:search:${trimmed.toLowerCase()}:${count}`;
    const cached = weatherCache.get<LocationInfo[]>(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      name: trimmed,
      count: count.toString(),
      language: 'en',
      format: 'json',
    });

    const url = `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': process.env.WEATHER_USER_AGENT || 'WeatherHub/1.0',
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        return [];
      }

      const json: OpenMeteoGeocodingResponse = await res.json();
      if (!json.results || json.results.length === 0) {
        return [];
      }

      const locations: LocationInfo[] = json.results.map((r) => ({
        name: r.name,
        region: r.admin1,
        country: r.country,
        countryCode: r.country_code,
        lat: Number(r.latitude.toFixed(4)),
        lon: Number(r.longitude.toFixed(4)),
        timezone: r.timezone || 'UTC',
        elevation: r.elevation,
        slug: generateLocationSlug(r.name, r.admin1, r.country_code),
      }));

      weatherCache.set(cacheKey, locations, this.cacheTtlSeconds);
      return locations;
    } catch {
      return [];
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async reverseGeocode(lat: number, lon: number): Promise<LocationInfo | null> {
    const cacheKey = `geocode:reverse:${lat.toFixed(3)}:${lon.toFixed(3)}`;
    const cached = weatherCache.get<LocationInfo>(cacheKey);
    if (cached) return cached;

    // We can use Open-Meteo reverse or BigDataCloud / OSM open reverse endpoint
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) return null;

      const data = await res.json();
      const name = data.city || data.locality || data.principalSubdivision || `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
      const region = data.principalSubdivision;
      const country = data.countryName || 'Unknown';
      const countryCode = data.countryCode || 'XX';

      const loc: LocationInfo = {
        name,
        region,
        country,
        countryCode,
        lat: Number(lat.toFixed(4)),
        lon: Number(lon.toFixed(4)),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        slug: generateLocationSlug(name, region, countryCode),
      };

      weatherCache.set(cacheKey, loc, this.cacheTtlSeconds);
      return loc;
    } catch {
      return {
        name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
        country: 'Current Location',
        countryCode: 'XX',
        lat: Number(lat.toFixed(4)),
        lon: Number(lon.toFixed(4)),
        timezone: 'UTC',
        slug: `loc-${lat.toFixed(2)}-${lon.toFixed(2)}`,
      };
    }
  }
}

// Global geocoding provider singleton
const globalForGeo = globalThis as unknown as { geocodingProvider?: GeocodingProvider };
export const geocodingProvider = globalForGeo.geocodingProvider ?? new GeocodingProvider();
if (process.env.NODE_ENV !== 'production') globalForGeo.geocodingProvider = geocodingProvider;
