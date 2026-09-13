import { WeatherProvider } from './weather-provider.interface';
import { WeatherData, LocationInfo, WeatherProviderOptions, CurrentWeather, HourlyForecastItem, DailyForecastItem, WeatherIconCode } from '../types/weather';
import { calculateFeelsLike, generateRealWeatherSummary } from '../normalizers/met-norway.normalizer';

export class NoaaProvider implements WeatherProvider {
  public readonly name = 'noaa';
  public readonly attributionText = 'Data provided by NOAA / National Weather Service (weather.gov)';
  public readonly attributionUrl = 'https://www.weather.gov/';

  private userAgent: string;
  private timeoutMs: number;

  constructor(options?: WeatherProviderOptions) {
    const defaultSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://weatherhub.example.com';
    this.userAgent =
      options?.userAgent ||
      process.env.NOAA_USER_AGENT ||
      `WeatherHub/1.0 (${defaultSiteUrl} contact@weatherhub.example.com)`;
    this.timeoutMs = options?.timeoutMs || 4000;
  }

  private mapNoaaShortForecastToIcon(shortForecast: string, isDay: boolean): WeatherIconCode {
    const text = shortForecast.toLowerCase();
    if (text.includes('thunder') || text.includes('storm')) {
      return 'thunderstorm';
    }
    if (text.includes('snow') || text.includes('blizzard') || text.includes('flurries')) {
      return text.includes('heavy') ? 'heavy_snow' : 'snow';
    }
    if (text.includes('sleet') || text.includes('freezing rain') || text.includes('ice')) {
      return 'sleet';
    }
    if (text.includes('heavy rain') || text.includes('downpour')) {
      return 'heavy_rain';
    }
    if (text.includes('rain') || text.includes('showers')) {
      return 'rain';
    }
    if (text.includes('drizzle')) {
      return 'drizzle';
    }
    if (text.includes('fog') || text.includes('haze') || text.includes('smoke')) {
      return 'fog';
    }
    if (text.includes('mostly cloudy') || text.includes('overcast')) {
      return 'overcast';
    }
    if (text.includes('partly cloudy') || text.includes('partly sunny') || text.includes('scattered clouds')) {
      return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
    }
    if (text.includes('sunny') || text.includes('clear')) {
      return isDay ? 'clear_day' : 'clear_night';
    }
    return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
  }

  public async getWeatherData(
    lat: number,
    lon: number,
    locationInfo?: Partial<LocationInfo>
  ): Promise<WeatherData> {
    const formattedLat = Number(lat.toFixed(4));
    const formattedLon = Number(lon.toFixed(4));

    // Step 1: Query Points endpoint to get grid endpoints
    const pointsUrl = `https://api.weather.gov/points/${formattedLat},${formattedLon}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const pointRes = await fetch(pointsUrl, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/geo+json',
        },
        signal: controller.signal,
      });

      if (!pointRes.ok) {
        throw new Error(`NOAA points API returned HTTP ${pointRes.status}: ${pointRes.statusText}`);
      }

      const pointJson = await pointRes.json();
      const forecastUrl = pointJson.properties?.forecast;
      const hourlyUrl = pointJson.properties?.forecastHourly;

      if (!forecastUrl || !hourlyUrl) {
        throw new Error('NOAA point metadata missing forecast endpoints');
      }

      // Step 2: Query Forecast and Hourly endpoints in parallel
      const [forecastRes, hourlyRes] = await Promise.all([
        fetch(forecastUrl, {
          headers: { 'User-Agent': this.userAgent, Accept: 'application/geo+json' },
          signal: controller.signal,
        }),
        fetch(hourlyUrl, {
          headers: { 'User-Agent': this.userAgent, Accept: 'application/geo+json' },
          signal: controller.signal,
        }),
      ]);

      if (!forecastRes.ok || !hourlyRes.ok) {
        throw new Error(`NOAA forecast API returned HTTP ${forecastRes.status}/${hourlyRes.status}`);
      }

      const forecastJson = await forecastRes.json();
      const hourlyJson = await hourlyRes.json();

      const hourlyPeriods = hourlyJson.properties?.periods || [];
      const dailyPeriods = forecastJson.properties?.periods || [];

      if (hourlyPeriods.length === 0) {
        throw new Error('NOAA returned empty hourly forecast periods');
      }

      const curPeriod = hourlyPeriods[0];
      // Convert Fahrenheit to Celsius
      const tempC = Math.round((((curPeriod.temperature - 32) * 5) / 9) * 10) / 10;
      const humidity = curPeriod.relativeHumidity?.value ?? 55;
      const windSpeedMph = parseFloat(curPeriod.windSpeed) || 5;
      const windSpeedKmh = Math.round(windSpeedMph * 1.60934 * 10) / 10;
      const feelsLike = calculateFeelsLike(tempC, humidity, windSpeedKmh);

      // Parse wind direction string like "SSE" or "NW" to approx degrees
      const cardinalMap: Record<string, number> = {
        N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
        S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
      };
      const windDirection = cardinalMap[curPeriod.windDirection] ?? 180;
      const isDay = curPeriod.isDaytime ?? true;
      const condition = curPeriod.shortForecast || 'Fair';
      const iconCode = this.mapNoaaShortForecastToIcon(condition, isDay);

      const todayDateStr = curPeriod.startTime.split('T')[0];

      const current: CurrentWeather = {
        time: curPeriod.startTime,
        temp: tempC,
        feelsLike,
        condition,
        iconCode,
        humidity: Math.round(humidity),
        windSpeed: windSpeedKmh,
        windDirection,
        pressure: 1013,
        precipitation: curPeriod.probabilityOfPrecipitation?.value ? curPeriod.probabilityOfPrecipitation.value / 10 : 0,
        cloudCover: condition.toLowerCase().includes('cloud') ? 60 : 15,
        uvIndex: 5,
        sunrise: `${todayDateStr}T06:00:00Z`,
        sunset: `${todayDateStr}T18:30:00Z`,
        isDay,
      };

      const hourly: HourlyForecastItem[] = hourlyPeriods.slice(0, 36).map((p: any) => {
        const hTempC = Math.round((((p.temperature - 32) * 5) / 9) * 10) / 10;
        const hHum = p.relativeHumidity?.value ?? 50;
        const hWindSpeed = Math.round((parseFloat(p.windSpeed) || 5) * 1.60934 * 10) / 10;
        const hPop = p.probabilityOfPrecipitation?.value ?? 0;
        const hIsDay = p.isDaytime ?? true;

        return {
          time: p.startTime,
          temp: hTempC,
          feelsLike: calculateFeelsLike(hTempC, hHum, hWindSpeed),
          pop: Math.round(hPop),
          precip: hPop > 50 ? 0.5 : 0,
          windSpeed: hWindSpeed,
          windDirection: cardinalMap[p.windDirection] ?? 180,
          iconCode: this.mapNoaaShortForecastToIcon(p.shortForecast || '', hIsDay),
          condition: p.shortForecast || 'Fair',
          humidity: Math.round(hHum),
          isDay: hIsDay,
        };
      });

      // Daily grouping
      const dailyMap = new Map<string, any[]>();
      for (const p of dailyPeriods) {
        const dateKey = p.startTime.split('T')[0];
        const existing = dailyMap.get(dateKey) || [];
        existing.push(p);
        dailyMap.set(dateKey, existing);
      }

      const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const daily: DailyForecastItem[] = [];

      for (const [dateStr, periods] of Array.from(dailyMap.entries())) {
        if (daily.length >= 8) break;

        const temps = periods.map((p: any) => Math.round((((p.temperature - 32) * 5) / 9) * 10) / 10);
        const high = Math.max(...temps);
        const low = Math.min(...temps);
        const popValues = periods.map((p: any) => p.probabilityOfPrecipitation?.value ?? 0);
        const maxPop = Math.max(0, ...popValues);
        const dominantForecast = periods[0]?.shortForecast || 'Fair';

        const dateObj = new Date(dateStr + 'T12:00:00Z');
        const dayName = weekdayNames[dateObj.getUTCDay()];

        daily.push({
          date: dateStr,
          dayName,
          iconCode: this.mapNoaaShortForecastToIcon(dominantForecast, true),
          condition: dominantForecast,
          high,
          low,
          pop: Math.round(maxPop),
          precip: maxPop > 40 ? 1.0 : 0,
          windSpeed: windSpeedKmh,
          summary: `${dominantForecast}, High ${Math.round(high)}°C, Low ${Math.round(low)}°C`,
        });
      }

      const loc: LocationInfo = {
        name: locationInfo?.name || `Location (${formattedLat}, ${formattedLon})`,
        region: locationInfo?.region,
        country: locationInfo?.country || 'United States',
        countryCode: locationInfo?.countryCode || 'US',
        lat: formattedLat,
        lon: formattedLon,
        timezone: pointJson.properties?.timeZone || locationInfo?.timezone || 'America/New_York',
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
          providerName: 'NOAA / National Weather Service',
          providerId: 'noaa',
          fetchedAt: new Date().toISOString(),
          attributionText: this.attributionText,
          attributionUrl: this.attributionUrl,
          isFallback: false,
        },
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`NOAA request timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
