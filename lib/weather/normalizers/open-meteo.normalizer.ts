import {
  WeatherData,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  WeatherIconCode,
  LocationInfo,
} from '../types/weather';
import { calculateFeelsLike, generateRealWeatherSummary } from './met-norway.normalizer';

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current?: {
    time: string;
    interval?: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain?: number;
    showers?: number;
    snowfall?: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure?: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    pressure_msl?: number[];
    cloud_cover: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    uv_index?: number[];
    is_day: number[];
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max?: number[];
    apparent_temperature_min?: number[];
    sunrise?: string[];
    sunset?: string[];
    uv_index_max?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
    wind_speed_10m_max?: number[];
    wind_direction_10m_dominant?: number[];
  };
}

/**
 * Maps WMO weather interpretation codes to unified WeatherIconCode
 */
export function mapWmoCodeToIcon(code: number, isDay: boolean = true): WeatherIconCode {
  switch (code) {
    case 0: // Clear sky
      return isDay ? 'clear_day' : 'clear_night';
    case 1: // Mainly clear
    case 2: // Partly cloudy
      return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
    case 3: // Overcast
      return 'overcast';
    case 45: // Fog
    case 48: // Depositing rime fog
      return 'fog';
    case 51: // Light drizzle
    case 53: // Moderate drizzle
    case 55: // Dense drizzle
    case 56: // Light freezing drizzle
    case 57: // Dense freezing drizzle
      return 'drizzle';
    case 61: // Slight rain
    case 63: // Moderate rain
    case 80: // Slight rain showers
    case 81: // Moderate rain showers
      return 'rain';
    case 65: // Heavy rain
    case 82: // Violent rain showers
      return 'heavy_rain';
    case 66: // Light freezing rain
    case 67: // Heavy freezing rain
    case 77: // Snow grains
      return 'sleet';
    case 71: // Slight snow fall
    case 73: // Moderate snow fall
    case 85: // Slight snow showers
      return 'snow';
    case 75: // Heavy snow fall
    case 86: // Heavy snow showers
      return 'heavy_snow';
    case 95: // Thunderstorm: Slight or moderate
      return 'thunderstorm';
    case 96: // Thunderstorm with slight hail
    case 99: // Thunderstorm with heavy hail
      return 'thunderstorm_rain';
    default:
      return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
  }
}

/**
 * Maps WMO code to human readable weather condition string
 */
export function mapWmoCodeToCondition(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing Rime Fog',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Dense Drizzle',
    56: 'Light Freezing Drizzle',
    57: 'Dense Freezing Drizzle',
    61: 'Slight Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    66: 'Light Freezing Rain',
    67: 'Heavy Freezing Rain',
    71: 'Slight Snow Fall',
    73: 'Moderate Snow Fall',
    75: 'Heavy Snow Fall',
    77: 'Snow Grains',
    80: 'Slight Rain Showers',
    81: 'Moderate Rain Showers',
    82: 'Violent Rain Showers',
    85: 'Slight Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Slight Hail',
    99: 'Thunderstorm with Heavy Hail',
  };

  return descriptions[code] || 'Partly Cloudy';
}

/**
 * Normalizes Open-Meteo response into WeatherHub internal format
 */
export function normalizeOpenMeteoResponse(
  data: OpenMeteoResponse,
  locationInfo: LocationInfo
): WeatherData {
  if (!data.current) {
    throw new Error('Open-Meteo response missing current weather data');
  }

  const cur = data.current;
  const isDay = cur.is_day === 1;
  const temp = cur.temperature_2m;
  const humidity = cur.relative_humidity_2m;
  const windSpeed = cur.wind_speed_10m; // Open-Meteo default is km/h
  const feelsLike = cur.apparent_temperature ?? calculateFeelsLike(temp, humidity, windSpeed);
  const condition = mapWmoCodeToCondition(cur.weather_code);
  const iconCode = mapWmoCodeToIcon(cur.weather_code, isDay);

  const todaySunrise = data.daily?.sunrise?.[0] || `${cur.time.split('T')[0]}T06:00`;
  const todaySunset = data.daily?.sunset?.[0] || `${cur.time.split('T')[0]}T18:30`;

  const current: CurrentWeather = {
    time: cur.time,
    temp: Math.round(temp * 10) / 10,
    feelsLike: Math.round(feelsLike * 10) / 10,
    condition,
    iconCode,
    humidity: Math.round(humidity),
    windSpeed: Math.round(windSpeed * 10) / 10,
    windDirection: cur.wind_direction_10m,
    windGust: cur.wind_gusts_10m ? Math.round(cur.wind_gusts_10m * 10) / 10 : undefined,
    pressure: Math.round(cur.pressure_msl ?? cur.surface_pressure ?? 1013),
    precipitation: Math.round(cur.precipitation * 10) / 10,
    cloudCover: Math.round(cur.cloud_cover),
    uvIndex: data.daily?.uv_index_max?.[0] ?? 0,
    sunrise: todaySunrise,
    sunset: todaySunset,
    isDay,
  };

  // Build hourly array (next 36 hours)
  const hourly: HourlyForecastItem[] = [];
  if (data.hourly?.time) {
    const totalHours = Math.min(data.hourly.time.length, 36);
    for (let i = 0; i < totalHours; i++) {
      const hTime = data.hourly.time[i];
      const hIsDay = data.hourly.is_day ? data.hourly.is_day[i] === 1 : true;
      const hCode = data.hourly.weather_code[i];
      const hTemp = data.hourly.temperature_2m[i];
      const hApparent = data.hourly.apparent_temperature ? data.hourly.apparent_temperature[i] : hTemp;
      const hPop = data.hourly.precipitation_probability ? data.hourly.precipitation_probability[i] : 0;
      const hPrecip = data.hourly.precipitation ? data.hourly.precipitation[i] : 0;
      const hWind = data.hourly.wind_speed_10m[i];
      const hWindDir = data.hourly.wind_direction_10m[i];
      const hUv = data.hourly.uv_index ? data.hourly.uv_index[i] : undefined;
      const hHum = data.hourly.relative_humidity_2m ? data.hourly.relative_humidity_2m[i] : undefined;

      hourly.push({
        time: hTime,
        temp: Math.round(hTemp * 10) / 10,
        feelsLike: Math.round(hApparent * 10) / 10,
        pop: Math.round(hPop),
        precip: Math.round(hPrecip * 10) / 10,
        windSpeed: Math.round(hWind * 10) / 10,
        windDirection: hWindDir,
        iconCode: mapWmoCodeToIcon(hCode, hIsDay),
        condition: mapWmoCodeToCondition(hCode),
        uvIndex: hUv !== undefined ? Math.round(hUv * 10) / 10 : undefined,
        humidity: hHum,
        isDay: hIsDay,
      });
    }
  }

  // Build daily array (7-10 days)
  const daily: DailyForecastItem[] = [];
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (data.daily?.time) {
    const totalDays = Math.min(data.daily.time.length, 8);
    for (let i = 0; i < totalDays; i++) {
      const dDate = data.daily.time[i];
      const dCode = data.daily.weather_code[i];
      const dHigh = data.daily.temperature_2m_max[i];
      const dLow = data.daily.temperature_2m_min[i];
      const dPop = data.daily.precipitation_probability_max ? data.daily.precipitation_probability_max[i] : 0;
      const dPrecip = data.daily.precipitation_sum ? data.daily.precipitation_sum[i] : 0;
      const dWind = data.daily.wind_speed_10m_max ? data.daily.wind_speed_10m_max[i] : windSpeed;
      const dUv = data.daily.uv_index_max ? data.daily.uv_index_max[i] : undefined;
      const dSunrise = data.daily.sunrise ? data.daily.sunrise[i] : undefined;
      const dSunset = data.daily.sunset ? data.daily.sunset[i] : undefined;

      const dateObj = new Date(dDate + 'T12:00:00Z');
      const dayName = weekdayNames[dateObj.getUTCDay()];
      const dCondition = mapWmoCodeToCondition(dCode);

      daily.push({
        date: dDate,
        dayName,
        iconCode: mapWmoCodeToIcon(dCode, true),
        condition: dCondition,
        high: Math.round(dHigh * 10) / 10,
        low: Math.round(dLow * 10) / 10,
        pop: Math.round(dPop),
        precip: Math.round(dPrecip * 10) / 10,
        windSpeed: Math.round(dWind * 10) / 10,
        uvIndexMax: dUv !== undefined ? Math.round(dUv * 10) / 10 : undefined,
        sunrise: dSunrise,
        sunset: dSunset,
        summary: `${dCondition}, high ${Math.round(dHigh)}°C, low ${Math.round(dLow)}°C`,
      });
    }
  }

  const dynamicSummary = generateRealWeatherSummary(locationInfo.name, current, daily[0]);

  return {
    location: locationInfo,
    current,
    hourly,
    daily,
    dynamicSummary,
    metadata: {
      providerName: 'Open-Meteo Forecast API',
      providerId: 'openmeteo',
      fetchedAt: new Date().toISOString(),
      attributionText: 'Weather data by Open-Meteo.com (CC-BY 4.0)',
      attributionUrl: 'https://open-meteo.com/',
      isFallback: false,
    },
  };
}
