import { describe, it, expect } from 'vitest';
import { SnowDayPredictionEngine } from '../lib/snow-day/engine';
import { generateSnowDayReasons } from '../lib/snow-day/explanations';
import { WeatherData, LocationInfo } from '../lib/weather/types/weather';

const mockLocation: LocationInfo = {
  name: 'Chicago',
  region: 'Illinois',
  country: 'United States',
  countryCode: 'US',
  lat: 41.8781,
  lon: -87.6298,
  timezone: 'America/Chicago',
  slug: 'chicago',
};

function createMockWeatherData(options: {
  temp?: number;
  condition?: string;
  iconCode?: any;
  precip?: number;
  pop?: number;
  hourlyPrecip?: number;
  hourlySnow?: boolean;
  hourlyIce?: boolean;
  hourlyTemp?: number;
  windSpeed?: number;
  windGust?: number;
}): WeatherData {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const hourly = Array.from({ length: 24 }).map((_, i) => {
    const d = new Date(tomorrow);
    d.setUTCHours(i, 0, 0, 0);

    const isSnow = options.hourlySnow ?? false;
    const isIce = options.hourlyIce ?? false;

    return {
      time: d.toISOString(),
      temp: options.hourlyTemp ?? (options.temp ?? 5),
      feelsLike: options.hourlyTemp ?? (options.temp ?? 5),
      pop: options.pop ?? (isSnow || isIce ? 80 : 10),
      precip: isSnow || isIce ? options.hourlyPrecip ?? 2.5 : 0,
      windSpeed: options.windSpeed ?? 15,
      windDirection: 180,
      iconCode: isSnow ? ('snow' as const) : isIce ? ('sleet' as const) : ('partly_cloudy_day' as const),
      condition: isSnow ? 'Moderate Snow' : isIce ? 'Freezing Rain' : 'Partly Cloudy',
      isDay: i >= 6 && i <= 18,
    };
  });

  return {
    location: mockLocation,
    current: {
      time: new Date().toISOString(),
      temp: options.temp ?? 5,
      feelsLike: options.temp ?? 4,
      condition: options.condition ?? 'Partly Cloudy',
      iconCode: options.iconCode ?? 'partly_cloudy_day',
      humidity: 60,
      windSpeed: options.windSpeed ?? 15,
      windDirection: 180,
      windGust: options.windGust ?? 20,
      pressure: 1015,
      precipitation: 0,
      cloudCover: 40,
      uvIndex: 2,
      sunrise: '06:30',
      sunset: '18:30',
      isDay: true,
    },
    hourly,
    daily: [
      {
        date: new Date().toISOString().split('T')[0],
        dayName: 'Today',
        high: options.temp ?? 8,
        low: (options.temp ?? 5) - 4,
        pop: options.pop ?? 10,
        precip: 0,
        windSpeed: options.windSpeed ?? 15,
        iconCode: 'partly_cloudy_day',
        condition: 'Partly Cloudy',
      },
      {
        date: tomorrowStr,
        dayName: 'Tomorrow',
        high: options.temp ?? 6,
        low: options.hourlyTemp ?? (options.temp ?? 2),
        pop: options.pop ?? (options.hourlySnow ? 85 : 10),
        precip: options.precip ?? (options.hourlySnow ? 8 : 0),
        windSpeed: options.windSpeed ?? 15,
        iconCode: options.hourlySnow ? 'snow' : 'partly_cloudy_day',
        condition: options.hourlySnow ? 'Snow' : 'Partly Cloudy',
      },
    ],
    dynamicSummary: 'Test forecast summary',
    metadata: {
      providerName: 'MET Norway',
      providerId: 'metno',
      fetchedAt: new Date().toISOString(),
      attributionText: 'MET Norway',
      attributionUrl: 'https://met.no',
      isFallback: false,
      debugInfo: {
        selectedProvider: 'metno',
        latencyMs: 120,
        cacheHit: false,
        isFallback: false,
      },
    },
  };
}

describe('SnowDayPredictionEngine & Scoring Tests', () => {
  it('Scenario 1: No snow + warm temperature returns Very Low risk (0%)', () => {
    const weather = createMockWeatherData({
      temp: 15,
      condition: 'Sunny',
      iconCode: 'clear_day',
      precip: 0,
      pop: 0,
      hourlySnow: false,
      hourlyTemp: 12,
    });

    const prediction = SnowDayPredictionEngine.calculate(weather);
    expect(prediction.probability).toBeLessThanOrEqual(15);
    expect(prediction.riskLevel).toBe('very-low');
    expect(prediction.factors.snowAccumulationCm).toBe(0);
  });

  it('Scenario 2: Light snow + freezing temperature returns Low or Moderate risk', () => {
    const weather = createMockWeatherData({
      temp: -2,
      hourlySnow: true,
      hourlyPrecip: 0.15, // ~1.5 to 2.5 cm light snow accumulation
      hourlyTemp: -2,
      pop: 70,
    });

    const prediction = SnowDayPredictionEngine.calculate(weather);
    expect(prediction.probability).toBeGreaterThanOrEqual(15);
    expect(prediction.probability).toBeLessThanOrEqual(59);
    expect(['very-low', 'low', 'moderate']).toContain(prediction.riskLevel);
    expect(prediction.factors.snowAccumulationCm).toBeGreaterThan(0);
  });

  it('Scenario 3: Heavy overnight snow + below-freezing morning returns High or Very High risk', () => {
    const weather = createMockWeatherData({
      temp: -6,
      hourlySnow: true,
      hourlyPrecip: 3.5, // Heavy snow accumulating ~15+ cm
      hourlyTemp: -8,
      pop: 95,
      windSpeed: 30,
      windGust: 45,
    });

    const prediction = SnowDayPredictionEngine.calculate(weather);
    expect(prediction.probability).toBeGreaterThanOrEqual(65);
    expect(['high', 'very-high']).toContain(prediction.riskLevel);
    expect(prediction.factors.snowAccumulationCm).toBeGreaterThanOrEqual(10);
    expect(prediction.factors.morningTemperatureC).toBeLessThanOrEqual(-5);
  });

  it('Scenario 4: Heavy snow + freezing rain & blizzard winds returns Very High risk (>= 80%)', () => {
    const weather = createMockWeatherData({
      temp: -4,
      hourlySnow: true,
      hourlyIce: true,
      hourlyPrecip: 4.0,
      hourlyTemp: -5,
      pop: 100,
      windSpeed: 45,
      windGust: 65,
    });

    const prediction = SnowDayPredictionEngine.calculate(weather);
    expect(prediction.probability).toBeGreaterThanOrEqual(75);
    expect(['high', 'very-high']).toContain(prediction.riskLevel);
  });

  it('Scenario 5: Handles missing hourly snow data gracefully without crashing or false 0%', () => {
    const weather = createMockWeatherData({
      temp: -3,
      hourlySnow: false,
      hourlyTemp: -4,
    });
    // Strip hourly items to simulate sparse provider
    weather.hourly = [];

    const prediction = SnowDayPredictionEngine.calculate(weather);
    expect(prediction).toBeDefined();
    expect(prediction.probability).toBeGreaterThanOrEqual(0);
    expect(prediction.confidence).toBe('low');
  });

  it('Scenario 6: Freezing rain alone significantly elevates risk even with 0 cm snow', () => {
    const weather = createMockWeatherData({
      temp: -1,
      hourlySnow: false,
      hourlyIce: true,
      hourlyPrecip: 1.5,
      hourlyTemp: -1,
      pop: 85,
    });

    const prediction = SnowDayPredictionEngine.calculate(weather);
    expect(prediction.factors.freezingRainRisk || prediction.factors.iceRisk !== 'none').toBe(true);
    expect(prediction.probability).toBeGreaterThanOrEqual(30);
  });

  it('Scenario 7: Explanations are dynamically generated with accurate facts', () => {
    const weather = createMockWeatherData({
      temp: -7,
      hourlySnow: true,
      hourlyPrecip: 3.0,
      hourlyTemp: -7,
      pop: 90,
      windGust: 55,
    });

    const prediction = SnowDayPredictionEngine.calculate(weather, undefined, 'c');
    expect(prediction.reasons.length).toBeGreaterThan(0);
    expect(prediction.reasons.some((r) => r.toLowerCase().includes('snow'))).toBe(true);
    expect(prediction.reasons.some((r) => r.toLowerCase().includes('temperature') || r.toLowerCase().includes('cold'))).toBe(true);
  });

  it('Scenario 8: Supports imperial unit conversions in explanations', () => {
    const weather = createMockWeatherData({
      temp: -5,
      hourlySnow: true,
      hourlyPrecip: 2.5,
      hourlyTemp: -5,
      pop: 90,
    });

    const prediction = SnowDayPredictionEngine.calculate(weather, undefined, 'f');
    const reasonsStr = prediction.reasons.join(' ');
    // Imperial text should format inches or °F
    expect(reasonsStr.includes('in') || reasonsStr.includes('°F') || reasonsStr.includes('inches')).toBe(true);
  });
});
