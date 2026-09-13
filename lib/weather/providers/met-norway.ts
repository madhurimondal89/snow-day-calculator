import { WeatherProvider } from './weather-provider.interface';
import { WeatherData, LocationInfo, WeatherProviderOptions } from '../types/weather';
import { MetNorwayResponse, normalizeMetNorwayResponse } from '../normalizers/met-norway.normalizer';

export class MetNorwayProvider implements WeatherProvider {
  public readonly name = 'metno';
  public readonly attributionText = 'Weather forecast from MET Norway (api.met.no)';
  public readonly attributionUrl = 'https://api.met.no/';

  private userAgent: string;
  private timeoutMs: number;

  constructor(options?: WeatherProviderOptions) {
    const defaultSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://github.com/weather-hub/weather-hub';
    this.userAgent =
      options?.userAgent ||
      process.env.METNO_USER_AGENT ||
      process.env.WEATHER_USER_AGENT ||
      `WeatherHub/1.0 (${defaultSiteUrl} info@weatherhub-project.org)`;
    this.timeoutMs = options?.timeoutMs || 8000;
  }

  public async getWeatherData(
    lat: number,
    lon: number,
    locationInfo?: Partial<LocationInfo>
  ): Promise<WeatherData> {
    // MET Norway expects coordinates truncated to max 4 decimal digits
    const formattedLat = Number(lat.toFixed(4));
    const formattedLon = Number(lon.toFixed(4));

    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${formattedLat}&lon=${formattedLon}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/json',
        },
        signal: controller.signal,
        next: {
          revalidate: Number(process.env.WEATHER_CACHE_SECONDS || 900),
        },
      });

      if (!res.ok) {
        throw new Error(`MET Norway API returned HTTP ${res.status}: ${res.statusText}`);
      }

      const json: MetNorwayResponse = await res.json();

      const loc: LocationInfo = {
        name: locationInfo?.name || `Location (${formattedLat}, ${formattedLon})`,
        region: locationInfo?.region,
        country: locationInfo?.country || 'Unknown',
        countryCode: locationInfo?.countryCode || 'XX',
        lat: formattedLat,
        lon: formattedLon,
        timezone: locationInfo?.timezone || 'UTC',
        elevation: locationInfo?.elevation,
        slug: locationInfo?.slug,
      };

      const normalized = normalizeMetNorwayResponse(json, loc);
      return normalized;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`MET Norway request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
