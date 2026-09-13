import { WeatherProvider } from './weather-provider.interface';
import { WeatherData, LocationInfo, WeatherProviderOptions, CurrentWeather, HourlyForecastItem, DailyForecastItem, WeatherIconCode } from '../types/weather';
import { calculateFeelsLike, generateRealWeatherSummary } from '../normalizers/met-norway.normalizer';

export class WeatherApiProvider implements WeatherProvider {
  public readonly name = 'weatherapi';
  public readonly attributionText = 'Powered by WeatherAPI.com';
  public readonly attributionUrl = 'https://www.weatherapi.com/';

  private apiKey: string;
  private timeoutMs: number;

  constructor(options?: WeatherProviderOptions) {
    this.apiKey = options?.apiKey || process.env.WEATHERAPI_API_KEY || '';
    this.timeoutMs = options?.timeoutMs || 4000;
  }

  private mapConditionCodeToIcon(code: number, isDay: boolean): WeatherIconCode {
    if (code === 1000) return isDay ? 'clear_day' : 'clear_night';
    if (code === 1003) return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
    if (code === 1006 || code === 1009) return 'cloudy';
    if (code === 1030 || code === 1135 || code === 1147) return 'fog';
    if ([1063, 1150, 1153, 1180, 1183, 1240].includes(code)) return 'drizzle';
    if ([1186, 1189, 1192, 1195, 1243, 1246].includes(code)) return 'rain';
    if ([1273, 1276, 1087].includes(code)) return 'thunderstorm';
    if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) return 'snow';
    if ([1069, 1072, 1168, 1171, 1198, 1201, 1204, 1207, 1235, 1249, 1252, 1261, 1264].includes(code)) return 'sleet';
    return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
  }

  public async getWeatherData(
    lat: number,
    lon: number,
    locationInfo?: Partial<LocationInfo>
  ): Promise<WeatherData> {
    if (!this.apiKey) {
      throw new Error('WeatherAPI requires an API key (WEATHERAPI_API_KEY)');
    }

    const formattedLat = Number(lat.toFixed(4));
    const formattedLon = Number(lon.toFixed(4));

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=${formattedLat},${formattedLon}&days=7&aqi=yes&alerts=no`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`WeatherAPI returned HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const currentRaw = json.current;
      const forecastDays = json.forecast?.forecastday || [];

      if (!currentRaw || forecastDays.length === 0) {
        throw new Error('WeatherAPI response missing current or forecast data');
      }

      const isDay = currentRaw.is_day === 1;
      const condition = currentRaw.condition?.text || 'Clear';
      const iconCode = this.mapConditionCodeToIcon(currentRaw.condition?.code || 1000, isDay);

      const todayAstro = forecastDays[0]?.astro;
      const todayDateStr = forecastDays[0]?.date || new Date().toISOString().split('T')[0];

      const current: CurrentWeather = {
        time: currentRaw.last_updated ? `${currentRaw.last_updated.replace(' ', 'T')}:00Z` : new Date().toISOString(),
        temp: currentRaw.temp_c,
        feelsLike: currentRaw.feelslike_c ?? calculateFeelsLike(currentRaw.temp_c, currentRaw.humidity, currentRaw.wind_kph),
        condition,
        iconCode,
        humidity: currentRaw.humidity,
        windSpeed: currentRaw.wind_kph,
        windDirection: currentRaw.wind_degree || 0,
        windGust: currentRaw.gust_kph,
        pressure: currentRaw.pressure_mb,
        precipitation: currentRaw.precip_mm,
        cloudCover: currentRaw.cloud,
        uvIndex: currentRaw.uv,
        sunrise: todayAstro?.sunrise ? `${todayDateStr}T${todayAstro.sunrise}` : `${todayDateStr}T06:00:00Z`,
        sunset: todayAstro?.sunset ? `${todayDateStr}T${todayAstro.sunset}` : `${todayDateStr}T18:30:00Z`,
        visibility: currentRaw.vis_km,
        isDay,
      };

      // Hourly Forecast
      const allHourly = forecastDays.flatMap((day: any) => day.hour || []);
      const hourly: HourlyForecastItem[] = allHourly.slice(0, 36).map((h: any) => {
        const hIsDay = h.is_day === 1;
        return {
          time: `${h.time.replace(' ', 'T')}:00Z`,
          temp: h.temp_c,
          feelsLike: h.feelslike_c,
          pop: h.chance_of_rain || h.chance_of_snow || 0,
          precip: h.precip_mm || 0,
          windSpeed: h.wind_kph,
          windDirection: h.wind_degree || 0,
          iconCode: this.mapConditionCodeToIcon(h.condition?.code || 1000, hIsDay),
          condition: h.condition?.text || 'Clear',
          uvIndex: h.uv,
          humidity: h.humidity,
          isDay: hIsDay,
        };
      });

      // Daily Forecast
      const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const daily: DailyForecastItem[] = forecastDays.map((d: any) => {
        const dateObj = new Date(d.date + 'T12:00:00Z');
        const dayName = weekdayNames[dateObj.getUTCDay()];
        const dayCond = d.day?.condition?.text || 'Partly Cloudy';
        const dayIcon = this.mapConditionCodeToIcon(d.day?.condition?.code || 1000, true);

        return {
          date: d.date,
          dayName,
          iconCode: dayIcon,
          condition: dayCond,
          high: d.day?.maxtemp_c ?? current.temp,
          low: d.day?.mintemp_c ?? current.temp,
          pop: d.day?.daily_chance_of_rain || d.day?.daily_chance_of_snow || 0,
          precip: d.day?.totalprecip_mm || 0,
          windSpeed: d.day?.maxwind_kph || current.windSpeed,
          uvIndexMax: d.day?.uv,
          sunrise: d.astro?.sunrise,
          sunset: d.astro?.sunset,
          summary: `${dayCond}, High ${Math.round(d.day?.maxtemp_c)}°C, Low ${Math.round(d.day?.mintemp_c)}°C`,
        };
      });

      const loc: LocationInfo = {
        name: locationInfo?.name || json.location?.name || `Location (${formattedLat}, ${formattedLon})`,
        region: locationInfo?.region || json.location?.region,
        country: locationInfo?.country || json.location?.country || 'Unknown',
        countryCode: locationInfo?.countryCode || 'XX',
        lat: formattedLat,
        lon: formattedLon,
        timezone: json.location?.tz_id || locationInfo?.timezone || 'UTC',
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
          providerName: 'WeatherAPI',
          providerId: 'weatherapi',
          fetchedAt: new Date().toISOString(),
          attributionText: this.attributionText,
          attributionUrl: this.attributionUrl,
          isFallback: false,
        },
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`WeatherAPI request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
