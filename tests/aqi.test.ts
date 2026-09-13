import { describe, it, expect } from 'vitest';
import { classifyAQI } from '../lib/weather/providers/air-quality';

describe('Air Quality Classification', () => {
  it('should categorize US EPA AQI levels correctly', () => {
    const good = classifyAQI(35);
    expect(good.level).toBe('good');
    expect(good.label).toBe('Good');

    const moderate = classifyAQI(75);
    expect(moderate.level).toBe('moderate');

    const unhealthy = classifyAQI(160);
    expect(unhealthy.level).toBe('unhealthy');

    const hazardous = classifyAQI(350);
    expect(hazardous.level).toBe('hazardous');
  });

  it('should categorize European EAQI correctly as fallback', () => {
    const euGood = classifyAQI(undefined, 15);
    expect(euGood.level).toBe('good');

    const euPoor = classifyAQI(undefined, 70);
    expect(euPoor.level).toBe('unhealthy');
  });
});
