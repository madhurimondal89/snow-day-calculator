import { WeatherProvider } from './weather-provider.interface';
import { WeatherData, LocationInfo, WeatherProviderOptions } from '../types/weather';
import { OpenMeteoResponse, normalizeOpenMeteoResponse } from '../normalizers/open-meteo.normalizer';

export class OpenMeteoProvider implements WeatherProvider {
  public readonly name = 'openmeteo';
  public readonly attributionText = 'Weather data by Open-Meteo.com (CC-BY 4.0)';
  public readonly attributionUrl = 'https://open-meteo.com/';

  private timeoutMs: number;

  constructor(options?: WeatherProviderOptions) {
    this.timeoutMs = options?.timeoutMs || 8000;
  }

  public async getWeatherData(
    lat: number,
    lon: number,
    locationInfo?: Partial<LocationInfo>
  ): Promise<WeatherData> {
    const formattedLat = Number(lat.toFixed(4));
    const formattedLon = Number(lon.toFixed(4));

    const params = new URLSearchParams({
      latitude: formattedLat.toString(),
      longitude: formattedLon.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation_probability',
        'precipitation',
        'weather_code',
        'pressure_msl',
        'cloud_cover',
        'wind_speed_10m',
        'wind_direction_10m',
        'uv_index',
        'is_day',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'sunrise',
        'sunset',
        'uv_index_max',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'wind_direction_10m_dominant',
      ].join(','),
      timezone: locationInfo?.timezone || 'auto',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': process.env.WEATHER_USER_AGENT || 'WeatherHub/1.0',
        },
        signal: controller.signal,
        next: {
          revalidate: Number(process.env.WEATHER_CACHE_SECONDS || 900),
        },
      });

      if (!res.ok) {
        throw new Error(`Open-Meteo API returned HTTP ${res.status}: ${res.statusText}`);
      }

      const json: OpenMeteoResponse = await res.json();

      const loc: LocationInfo = {
        name: locationInfo?.name || `Location (${formattedLat}, ${formattedLon})`,
        region: locationInfo?.region,
        country: locationInfo?.country || 'Unknown',
        countryCode: locationInfo?.countryCode || 'XX',
        lat: formattedLat,
        lon: formattedLon,
        timezone: json.timezone || locationInfo?.timezone || 'UTC',
        elevation: json.elevation ?? locationInfo?.elevation,
        slug: locationInfo?.slug,
      };

      const normalized = normalizeOpenMeteoResponse(json, loc);
      return normalized;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Open-Meteo request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
