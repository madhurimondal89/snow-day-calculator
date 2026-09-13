export type WeatherIconCode =
  | 'clear_day'
  | 'clear_night'
  | 'partly_cloudy_day'
  | 'partly_cloudy_night'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy_rain'
  | 'sleet'
  | 'snow'
  | 'heavy_snow'
  | 'thunderstorm'
  | 'thunderstorm_rain';

export interface LocationInfo {
  name: string;
  region?: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  timezone: string;
  elevation?: number;
  slug?: string;
}

export interface CurrentWeather {
  time: string; // ISO string
  temp: number; // Celsius
  feelsLike: number; // Celsius
  condition: string;
  iconCode: WeatherIconCode;
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // degrees 0-360
  windGust?: number; // km/h
  pressure: number; // hPa
  precipitation: number; // mm in last hour
  cloudCover: number; // %
  uvIndex: number;
  sunrise: string; // ISO or local time string
  sunset: string; // ISO or local time string
  visibility?: number; // km
  dewPoint?: number; // Celsius
  isDay: boolean;
}

export interface HourlyForecastItem {
  time: string; // ISO string
  temp: number; // Celsius
  feelsLike: number;
  pop: number; // Probability of precipitation % (0-100)
  precip: number; // mm
  windSpeed: number; // km/h
  windDirection: number;
  iconCode: WeatherIconCode;
  condition: string;
  uvIndex?: number;
  humidity?: number;
  isDay: boolean;
}

export interface DailyForecastItem {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  iconCode: WeatherIconCode;
  condition: string;
  high: number; // Celsius
  low: number; // Celsius
  pop: number; // %
  precip: number; // mm
  windSpeed: number; // km/h
  uvIndexMax?: number;
  sunrise?: string;
  sunset?: string;
  summary?: string;
}

export type AQILevel = 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface AirQualityData {
  aqi: number; // Standardized or native AQI number
  aqiStandard: 'European EAQI' | 'US EPA AQI';
  level: AQILevel;
  label: string; // "Good", "Moderate", etc.
  colorCode: string; // Hex color
  description: string;
  advisory: string;
  pm2_5?: number; // ug/m3
  pm10?: number; // ug/m3
  o3?: number; // Ozone ug/m3
  no2?: number; // Nitrogen dioxide ug/m3
  so2?: number; // Sulphur dioxide ug/m3
  co?: number; // Carbon monoxide ug/m3
}

export interface WeatherMetadata {
  providerName: string;
  providerId: string;
  fetchedAt: string;
  cachedExpiresAt?: string;
  attributionText: string;
  attributionUrl: string;
  isFallback: boolean;
  fallbackFrom?: string;
  isStale?: boolean;
  staleCachedAt?: string;
  debugInfo?: {
    selectedProvider: string;
    latencyMs: number;
    cacheHit: boolean;
    isFallback: boolean;
    circuitState?: string;
  };
}

export interface WeatherData {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecastItem[]; // 24-48 hours
  daily: DailyForecastItem[]; // 7-10 days
  airQuality?: AirQualityData;
  dynamicSummary: string;
  metadata: WeatherMetadata;
}

export interface WeatherProviderOptions {
  userAgent?: string;
  siteUrl?: string;
  timeoutMs?: number;
  apiKey?: string;
}
