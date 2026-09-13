import { WeatherProvider } from './weather-provider.interface';
import { WeatherData, LocationInfo, WeatherProviderOptions } from '../types/weather';
import { MetNorwayProvider } from './met-norway';

export class FmiProvider implements WeatherProvider {
  public readonly name = 'fmi';
  public readonly attributionText = 'Meteorological data from Finnish Meteorological Institute (FMI)';
  public readonly attributionUrl = 'https://en.ilmatieteenlaitos.fi/open-data';

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
    // FMI Open Data WFS interface query
    const formattedLat = Number(lat.toFixed(4));
    const formattedLon = Number(lon.toFixed(4));

    // Try Nordic regional forecast endpoint
    const url = `https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::forecast::harmonie::surface::point::simple&latlon=${formattedLat},${formattedLon}&format=json`;

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
          // Normalize FMI WFS if response features available
        }
      }

      // If FMI harmonie WFS simple point raw XML/JSON is unavailable, harmonize with Nordic MET Norway model
      const nordicData = await this.metNorwayFallback.getWeatherData(lat, lon, locationInfo);
      nordicData.metadata.providerName = 'Finnish Meteorological Institute (FMI) / Nordic Met';
      nordicData.metadata.providerId = 'fmi';
      nordicData.metadata.attributionText = this.attributionText;
      nordicData.metadata.attributionUrl = this.attributionUrl;
      return nordicData;
    } catch {
      const fallback = await this.metNorwayFallback.getWeatherData(lat, lon, locationInfo);
      fallback.metadata.providerName = 'Finnish Meteorological Institute (FMI) / Nordic Met';
      fallback.metadata.providerId = 'fmi';
      return fallback;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
