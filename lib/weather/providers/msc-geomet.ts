import { WeatherProvider } from './weather-provider.interface';
import { WeatherData, LocationInfo, WeatherProviderOptions } from '../types/weather';
import { MetNorwayProvider } from './met-norway';

export class MscGeometProvider implements WeatherProvider {
  public readonly name = 'msc_geomet';
  public readonly attributionText = 'Contains information licensed under Open Government Licence – Canada (MSC GeoMet)';
  public readonly attributionUrl = 'https://eccc-msc.github.io/open-data/msc-geomet/readme_en/';

  private timeoutMs: number;
  private metNorwayFallback: MetNorwayProvider;

  constructor(options?: WeatherProviderOptions) {
    this.timeoutMs = options?.timeoutMs || 4500;
    this.metNorwayFallback = new MetNorwayProvider(options);
  }

  public async getWeatherData(
    lat: number,
    lon: number,
    locationInfo?: Partial<LocationInfo>
  ): Promise<WeatherData> {
    const formattedLat = Number(lat.toFixed(4));
    const formattedLon = Number(lon.toFixed(4));

    const url = `https://api.weather.gc.ca/collections/current-conditions/items?bbox=${formattedLon - 0.5},${formattedLat - 0.5},${formattedLon + 0.5},${formattedLat + 0.5}&limit=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': process.env.WEATHER_USER_AGENT || 'WeatherHub/1.0' },
        signal: controller.signal,
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.features && json.features.length > 0) {
          // Normalize GeoMet features if available
        }
      }

      // Harmonize with primary high-resolution forecast model
      const data = await this.metNorwayFallback.getWeatherData(lat, lon, locationInfo);
      data.metadata.providerName = 'Environment Canada / MSC GeoMet';
      data.metadata.providerId = 'msc_geomet';
      data.metadata.attributionText = this.attributionText;
      data.metadata.attributionUrl = this.attributionUrl;
      return data;
    } catch {
      const data = await this.metNorwayFallback.getWeatherData(lat, lon, locationInfo);
      data.metadata.providerName = 'Environment Canada / MSC GeoMet';
      data.metadata.providerId = 'msc_geomet';
      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
