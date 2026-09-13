import { describe, it, expect } from 'vitest';
import {
  mapMetNorwaySymbolToIcon,
  mapMetNorwaySymbolToCondition,
  calculateFeelsLike,
  normalizeMetNorwayResponse,
  MetNorwayResponse,
} from '../lib/weather/normalizers/met-norway.normalizer';
import { LocationInfo } from '../lib/weather/types/weather';

describe('MET Norway Normalizer', () => {
  it('should map symbol codes to correct icons', () => {
    expect(mapMetNorwaySymbolToIcon('clearsky_day')).toBe('clear_day');
    expect(mapMetNorwaySymbolToIcon('clearsky_night')).toBe('clear_night');
    expect(mapMetNorwaySymbolToIcon('partlycloudy_day')).toBe('partly_cloudy_day');
    expect(mapMetNorwaySymbolToIcon('rain')).toBe('rain');
    expect(mapMetNorwaySymbolToIcon('heavyrain')).toBe('heavy_rain');
    expect(mapMetNorwaySymbolToIcon('heavyrainshowersandthunder_day')).toBe('thunderstorm_rain');
    expect(mapMetNorwaySymbolToIcon('snow')).toBe('snow');
    expect(mapMetNorwaySymbolToIcon('fog')).toBe('fog');
  });

  it('should map symbol codes to human readable conditions', () => {
    expect(mapMetNorwaySymbolToCondition('clearsky_day')).toBe('Clear Sky');
    expect(mapMetNorwaySymbolToCondition('heavyrainshowers_day')).toBe('Heavy Rain Showers');
    expect(mapMetNorwaySymbolToCondition('thunderstorm')).toBe('Thunderstorm');
  });

  it('should calculate apparent temperature properly', () => {
    const feelsLike = calculateFeelsLike(30, 80, 10);
    expect(feelsLike).toBeGreaterThan(30); // High humidity should raise apparent temp
  });

  it('should normalize a full MET Norway API response', () => {
    const mockResponse: MetNorwayResponse = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [88.3639, 22.5726, 9],
      },
      properties: {
        meta: {
          updated_at: '2026-09-13T12:00:00Z',
          units: { air_temperature: 'celsius' },
        },
        timeseries: [
          {
            time: '2026-09-13T12:00:00Z',
            data: {
              instant: {
                details: {
                  air_temperature: 31.5,
                  relative_humidity: 78,
                  wind_speed: 3.5, // m/s -> ~12.6 km/h
                  wind_from_direction: 180,
                  air_pressure_at_sea_level: 1008,
                  cloud_area_fraction: 40,
                  ultraviolet_index_clear_sky: 7.2,
                },
              },
              next_1_hours: {
                summary: { symbol_code: 'partlycloudy_day' },
                details: { precipitation_amount: 0, probability_of_precipitation: 15 },
              },
            },
          },
          {
            time: '2026-09-13T13:00:00Z',
            data: {
              instant: {
                details: {
                  air_temperature: 30.8,
                  relative_humidity: 80,
                  wind_speed: 3.0,
                  wind_from_direction: 175,
                },
              },
              next_1_hours: {
                summary: { symbol_code: 'rain' },
                details: { precipitation_amount: 1.2, probability_of_precipitation: 65 },
              },
            },
          },
        ],
      },
    };

    const loc: LocationInfo = {
      name: 'Kolkata',
      country: 'India',
      countryCode: 'IN',
      lat: 22.5726,
      lon: 88.3639,
      timezone: 'Asia/Kolkata',
    };

    const normalized = normalizeMetNorwayResponse(mockResponse, loc);
    expect(normalized.location.name).toBe('Kolkata');
    expect(normalized.current.temp).toBe(31.5);
    expect(normalized.current.humidity).toBe(78);
    expect(normalized.current.windSpeed).toBe(12.6);
    expect(normalized.current.windDirection).toBe(180);
    expect(normalized.current.iconCode).toBe('partly_cloudy_day');
    expect(normalized.hourly.length).toBe(2);
    expect(normalized.metadata.providerName).toBe('MET Norway Weather API');
    expect(normalized.dynamicSummary).toContain('Kolkata');
  });
});
