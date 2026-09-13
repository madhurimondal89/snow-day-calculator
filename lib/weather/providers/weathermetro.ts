import { WeatherProvider } from './weather-provider.interface';
import { WeatherData, LocationInfo, WeatherProviderOptions } from '../types/weather';

export class WeatherMetroProvider implements WeatherProvider {
  public readonly name = 'weathermetro';
  public readonly attributionText = 'Weather forecast data provided by WeatherMetro';
  public readonly attributionUrl = 'https://weathermetro.com/';

  private apiKey: string;
  private timeoutMs: number;

  constructor(options?: WeatherProviderOptions) {
    this.apiKey = options?.apiKey || process.env.WEATHERMETRO_API_KEY || '';
    this.timeoutMs = options?.timeoutMs || 4000;
  }

  public async getWeatherData(
    lat: number,
    lon: number,
    locationInfo?: Partial<LocationInfo>
  ): Promise<WeatherData> {
    if (!this.apiKey) {
      throw new Error('WeatherMetro requires an API key (WEATHERMETRO_API_KEY)');
    }

    const formattedLat = Number(lat.toFixed(4));
    const formattedLon = Number(lon.toFixed(4));
    const url = `https://api.weathermetro.com/v1/forecast?lat=${formattedLat}&lon=${formattedLon}&key=${this.apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`WeatherMetro returned HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (!json || !json.current) {
        throw new Error('WeatherMetro returned invalid payload');
      }

      const loc: LocationInfo = {
        name: locationInfo?.name || `Location (${formattedLat}, ${formattedLon})`,
        country: locationInfo?.country || 'Unknown',
        countryCode: locationInfo?.countryCode || 'XX',
        lat: formattedLat,
        lon: formattedLon,
        timezone: json.timezone || locationInfo?.timezone || 'UTC',
      };

      return {
        location: loc,
        current: json.current,
        hourly: json.hourly || [],
        daily: json.daily || [],
        dynamicSummary: `${loc.name} is currently ${Math.round(json.current.temp)}°C.`,
        metadata: {
          providerName: 'WeatherMetro',
          providerId: 'weathermetro',
          fetchedAt: new Date().toISOString(),
          attributionText: this.attributionText,
          attributionUrl: this.attributionUrl,
          isFallback: false,
        },
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`WeatherMetro request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
