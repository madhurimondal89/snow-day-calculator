export type UnitSystem = 'c' | 'f';

/**
 * Format temperature based on unit preference
 */
export function formatTemperature(celsius: number, unit: UnitSystem = 'c'): string {
  if (unit === 'f') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°`;
  }
  return `${Math.round(celsius)}°`;
}

/**
 * Format wind speed
 */
export function formatWindSpeed(kmh: number, unit: 'kmh' | 'mph' | 'ms' = 'kmh'): string {
  if (unit === 'mph') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  if (unit === 'ms') {
    return `${(kmh / 3.6).toFixed(1)} m/s`;
  }
  return `${Math.round(kmh)} km/h`;
}

/**
 * Convert degree angle to 16-point cardinal compass direction
 */
export function getWindDirectionLabel(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}

/**
 * Format local time in the specified IANA timezone
 */
export function formatLocalTime(
  isoDateString: string | Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const date = typeof isoDateString === 'string' ? new Date(isoDateString) : isoDateString;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    };
    return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(date);
  } catch {
    // Fallback if timezone string is unrecognized
    const date = typeof isoDateString === 'string' ? new Date(isoDateString) : isoDateString;
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
}

/**
 * Format local full date in location timezone
 */
export function formatLocalDate(
  isoDateString: string | Date,
  timezone: string
): string {
  try {
    const date = typeof isoDateString === 'string' ? new Date(isoDateString) : isoDateString;
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      timeZone: timezone,
    }).format(date);
  } catch {
    return new Date(isoDateString).toLocaleDateString();
  }
}

/**
 * Calculate UV index category and color
 */
export function getUvCategory(uv: number): { label: string; color: string } {
  if (uv < 3) return { label: 'Low', color: '#10b981' };
  if (uv < 6) return { label: 'Moderate', color: '#f59e0b' };
  if (uv < 8) return { label: 'High', color: '#f97316' };
  if (uv < 11) return { label: 'Very High', color: '#ef4444' };
  return { label: 'Extreme', color: '#8b5cf6' };
}
