import { describe, it, expect } from 'vitest';
import { WeatherService } from '../lib/weather/service';

describe('Weather Service Validation and Orchestration', () => {
  const service = new WeatherService();

  it('should validate coordinate bounds properly', () => {
    expect(service.validateCoordinates(22.57, 88.36).valid).toBe(true);
    expect(service.validateCoordinates(95, 88).valid).toBe(false);
    expect(service.validateCoordinates(-95, 88).valid).toBe(false);
    expect(service.validateCoordinates(22, 190).valid).toBe(false);
    expect(service.validateCoordinates(NaN, 88).valid).toBe(false);
  });
});
