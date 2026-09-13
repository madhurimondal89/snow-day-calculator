import { WeatherData, LocationInfo, CurrentWeather, HourlyForecastItem, DailyForecastItem } from '../types/weather';

export interface WeatherProvider {
  readonly name: string;
  readonly attributionText: string;
  readonly attributionUrl: string;

  /**
   * Fetch complete normalized weather data for the specified coordinates
   */
  getWeatherData(lat: number, lon: number, locationInfo?: Partial<LocationInfo>): Promise<WeatherData>;

  /**
   * Fetch current weather snapshot only
   */
  getCurrentWeather?(lat: number, lon: number): Promise<CurrentWeather>;

  /**
   * Fetch hourly forecast
   */
  getHourlyForecast?(lat: number, lon: number): Promise<HourlyForecastItem[]>;

  /**
   * Fetch daily forecast
   */
  getDailyForecast?(lat: number, lon: number): Promise<DailyForecastItem[]>;
}
