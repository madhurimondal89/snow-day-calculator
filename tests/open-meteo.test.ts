import { describe, it, expect } from 'vitest';
import {
  mapWmoCodeToIcon,
  mapWmoCodeToCondition,
  normalizeOpenMeteoResponse,
  OpenMeteoResponse,
} from '../lib/weather/normalizers/open-meteo.normalizer';
import { LocationInfo } from '../lib/weather/types/weather';

describe('Open-Meteo Normalizer', () => {
  it('should map WMO codes correctly to unified icons', () => {
    expect(mapWmoCodeToIcon(0, true)).toBe('clear_day');
    expect(mapWmoCodeToIcon(0, false)).toBe('clear_night');
    expect(mapWmoCodeToIcon(2, true)).toBe('partly_cloudy_day');
    expect(mapWmoCodeToIcon(61)).toBe('rain');
    expect(mapWmoCodeToIcon(65)).toBe('heavy_rain');
    expect(mapWmoCodeToIcon(71)).toBe('snow');
    expect(mapWmoCodeToIcon(95)).toBe('thunderstorm');
  });

  it('should normalize Open-Meteo API response', () => {
    const mockResponse: OpenMeteoResponse = {
      latitude: 51.5,
      longitude: -0.12,
      generationtime_ms: 0.2,
      utc_offset_seconds: 0,
      timezone: 'Europe/London',
      timezone_abbreviation: 'GMT',
      elevation: 25,
      current: {
        time: '2026-09-13T12:00',
        temperature_2m: 18.5,
        relative_humidity_2m: 65,
        apparent_temperature: 18.2,
        is_day: 1,
        precipitation: 0.1,
        weather_code: 2,
        cloud_cover: 45,
        pressure_msl: 1015.2,
        wind_speed_10m: 14.2,
        wind_direction_10m: 230,
      },
      hourly: {
        time: ['2026-09-13T12:00', '2026-09-13T13:00'],
        temperature_2m: [18.5, 19.0],
        relative_humidity_2m: [65, 62],
        apparent_temperature: [18.2, 18.8],
        precipitation_probability: [10, 20],
        precipitation: [0.1, 0],
        weather_code: [2, 3],
        wind_speed_10m: [14.2, 15.0],
        wind_direction_10m: [230, 235],
        is_day: [1, 1],
      },
      daily: {
        time: ['2026-09-13'],
        weather_code: [2],
        temperature_2m_max: [21.5],
        temperature_2m_min: [14.0],
        precipitation_sum: [0.2],
        precipitation_probability_max: [25],
        wind_speed_10m_max: [18.0],
      },
    };

    const loc: LocationInfo = {
      name: 'London',
      country: 'United Kingdom',
      countryCode: 'GB',
      lat: 51.5074,
      lon: -0.1278,
      timezone: 'Europe/London',
    };

    const normalized = normalizeOpenMeteoResponse(mockResponse, loc);
    expect(normalized.location.name).toBe('London');
    expect(normalized.current.temp).toBe(18.5);
    expect(normalized.current.humidity).toBe(65);
    expect(normalized.current.windDirection).toBe(230);
    expect(normalized.hourly.length).toBe(2);
    expect(normalized.daily.length).toBe(1);
    expect(normalized.daily[0].high).toBe(21.5);
    expect(normalized.metadata.providerName).toBe('Open-Meteo Forecast API');
  });
});
