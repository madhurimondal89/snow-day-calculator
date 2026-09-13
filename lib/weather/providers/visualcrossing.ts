import { WeatherProvider } from './weather-provider.interface';
import { WeatherData, LocationInfo, WeatherProviderOptions, CurrentWeather, HourlyForecastItem, DailyForecastItem, WeatherIconCode } from '../types/weather';
import { calculateFeelsLike, generateRealWeatherSummary } from '../normalizers/met-norway.normalizer';

export class VisualCrossingProvider implements WeatherProvider {
  public readonly name = 'visualcrossing';
  public readonly attributionText = 'Weather data by Visual Crossing';
  public readonly attributionUrl = 'https://www.visualcrossing.com/';

  private apiKey: string;
  private timeoutMs: number;

  constructor(options?: WeatherProviderOptions) {
    this.apiKey = options?.apiKey || process.env.VISUALCROSSING_API_KEY || '';
    this.timeoutMs = options?.timeoutMs || 4500;
  }

  private mapIconToCode(icon: string): WeatherIconCode {
    const i = icon.toLowerCase();
    if (i.includes('thunder')) return 'thunderstorm';
    if (i.includes('snow')) return i.includes('heavy') ? 'heavy_snow' : 'snow';
    if (i.includes('rain')) return i.includes('heavy') ? 'heavy_rain' : 'rain';
    if (i.includes('fog')) return 'fog';
    if (i.includes('wind')) return 'cloudy';
    if (i.includes('cloudy')) return i.includes('partly') ? (i.includes('night') ? 'partly_cloudy_night' : 'partly_cloudy_day') : 'cloudy';
    if (i.includes('clear-night')) return 'clear_night';
    if (i.includes('clear-day')) return 'clear_day';
    return 'partly_cloudy_day';
  }

  public async getWeatherData(
    lat: number,
    lon: number,
    locationInfo?: Partial<LocationInfo>
  ): Promise<WeatherData> {
    if (!this.apiKey) {
      throw new Error('Visual Crossing requires an API key (VISUALCROSSING_API_KEY)');
    }

    const formattedLat = Number(lat.toFixed(4));
    const formattedLon = Number(lon.toFixed(4));

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${formattedLat},${formattedLon}?unitGroup=metric&key=${this.apiKey}&contentType=json&include=current,hours,days`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Visual Crossing returned HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const currentRaw = json.currentConditions;
      const days = json.days || [];

      if (!currentRaw || days.length === 0) {
        throw new Error('Visual Crossing response missing current conditions or forecast days');
      }

      const isDay = currentRaw.datetime ? parseInt(currentRaw.datetime.split(':')[0]) >= 6 && parseInt(currentRaw.datetime.split(':')[0]) < 19 : true;
      const iconCode = this.mapIconToCode(currentRaw.icon || '');
      const condition = currentRaw.conditions || 'Fair';

      const current: CurrentWeather = {
        time: new Date().toISOString(),
        temp: currentRaw.temp,
        feelsLike: currentRaw.feelslike ?? calculateFeelsLike(currentRaw.temp, currentRaw.humidity, currentRaw.windspeed),
        condition,
        iconCode,
        humidity: Math.round(currentRaw.humidity),
        windSpeed: Math.round(currentRaw.windspeed),
        windDirection: Math.round(currentRaw.winddir || 0),
        windGust: currentRaw.windgust,
        pressure: Math.round(currentRaw.pressure),
        precipitation: currentRaw.precip || 0,
        cloudCover: Math.round(currentRaw.cloudcover || 0),
        uvIndex: currentRaw.uvindex || 0,
        sunrise: days[0]?.sunrise ? `${days[0].datetime}T${days[0].sunrise}` : undefined as any,
        sunset: days[0]?.sunset ? `${days[0].datetime}T${days[0].sunset}` : undefined as any,
        visibility: currentRaw.visibility,
        dewPoint: currentRaw.dew,
        isDay,
      };

      // Hourly Forecast
      const allHourly = days.flatMap((d: any) => d.hours || []);
      const hourly: HourlyForecastItem[] = allHourly.slice(0, 36).map((h: any) => {
        const hourNum = parseInt(h.datetime.split(':')[0]);
        const hIsDay = hourNum >= 6 && hourNum < 19;
        return {
          time: `${h.datetimeEpoch ? new Date(h.datetimeEpoch * 1000).toISOString() : new Date().toISOString()}`,
          temp: h.temp,
          feelsLike: h.feelslike,
          pop: Math.round(h.precipprob || 0),
          precip: h.precip || 0,
          windSpeed: Math.round(h.windspeed || 0),
          windDirection: Math.round(h.winddir || 0),
          iconCode: this.mapIconToCode(h.icon || ''),
          condition: h.conditions || 'Clear',
          uvIndex: h.uvindex,
          humidity: Math.round(h.humidity || 0),
          isDay: hIsDay,
        };
      });

      // Daily Forecast
      const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const daily: DailyForecastItem[] = days.slice(0, 8).map((d: any) => {
        const dateObj = new Date(d.datetime + 'T12:00:00Z');
        const dayName = weekdayNames[dateObj.getUTCDay()];
        return {
          date: d.datetime,
          dayName,
          iconCode: this.mapIconToCode(d.icon || ''),
          condition: d.conditions || 'Fair',
          high: d.tempmax,
          low: d.tempmin,
          pop: Math.round(d.precipprob || 0),
          precip: d.precip || 0,
          windSpeed: Math.round(d.windspeed || 0),
          uvIndexMax: d.uvindex,
          sunrise: d.sunrise,
          sunset: d.sunset,
          summary: `${d.conditions}, High ${Math.round(d.tempmax)}°C, Low ${Math.round(d.tempmin)}°C`,
        };
      });

      const loc: LocationInfo = {
        name: locationInfo?.name || json.address || `Location (${formattedLat}, ${formattedLon})`,
        region: locationInfo?.region,
        country: locationInfo?.country || 'Unknown',
        countryCode: locationInfo?.countryCode || 'XX',
        lat: formattedLat,
        lon: formattedLon,
        timezone: json.timezone || locationInfo?.timezone || 'UTC',
        slug: locationInfo?.slug,
      };

      const dynamicSummary = generateRealWeatherSummary(loc.name, current, daily[0]);

      return {
        location: loc,
        current,
        hourly,
        daily,
        dynamicSummary,
        metadata: {
          providerName: 'Visual Crossing',
          providerId: 'visualcrossing',
          fetchedAt: new Date().toISOString(),
          attributionText: this.attributionText,
          attributionUrl: this.attributionUrl,
          isFallback: false,
        },
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Visual Crossing request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
