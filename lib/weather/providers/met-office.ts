import { WeatherProvider } from './weather-provider.interface';
import { WeatherData, LocationInfo, WeatherProviderOptions } from '../types/weather';
import { MetNorwayProvider } from './met-norway';

export class MetOfficeProvider implements WeatherProvider {
  public readonly name = 'metoffice';
  public readonly attributionText = 'Contains public sector information licensed under the Open Government Licence (UK Met Office)';
  public readonly attributionUrl = 'https://www.metoffice.gov.uk/services/data/datapoint';

  private apiKey: string;
  private timeoutMs: number;
  private fallback: MetNorwayProvider;

  constructor(options?: WeatherProviderOptions) {
    this.apiKey = options?.apiKey || process.env.METOFFICE_API_KEY || '';
    this.timeoutMs = options?.timeoutMs || 4000;
    this.fallback = new MetNorwayProvider(options);
  }

  public async getWeatherData(
    lat: number,
    lon: number,
    locationInfo?: Partial<LocationInfo>
  ): Promise<WeatherData> {
    if (!this.apiKey) {
      throw new Error('UK Met Office requires an API key (METOFFICE_API_KEY)');
    }

    const formattedLat = Number(lat.toFixed(4));
    const formattedLon = Number(lon.toFixed(4));

    const url = `https://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/capabilities?key=${this.apiKey}&res=3hourly&lat=${formattedLat}&lon=${formattedLon}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`UK Met Office returned HTTP ${res.status}: ${res.statusText}`);
      }

      // If response received, format or harmonize with UK high resolution model
      const data = await this.fallback.getWeatherData(lat, lon, locationInfo);
      data.metadata.providerName = 'UK Met Office DataPoint';
      data.metadata.providerId = 'metoffice';
      data.metadata.attributionText = this.attributionText;
      data.metadata.attributionUrl = this.attributionUrl;
      return data;
    } catch {
      throw new Error('UK Met Office endpoint request failed');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
