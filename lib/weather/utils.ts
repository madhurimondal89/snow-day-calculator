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
 * Calculate accurate astronomical sunrise and sunset UTC times for any coordinates and date
 */
export function calculateSunriseSunset(
  lat: number,
  lon: number,
  dateInput: Date | string = new Date()
): { sunrise: string; sunset: string } {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  function getTimes(isSunrise: boolean): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const N1 = Math.floor((275 * month) / 9);
    const N2 = Math.floor((month + 9) / 12);
    const N3 = 1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3);
    const N = N1 - N2 * N3 + day - 30;

    const lngHour = lon / 15;
    const t = isSunrise ? N + (6 - lngHour) / 24 : N + (18 - lngHour) / 24;

    const M = 0.9856 * t - 3.289;
    let L = M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
    L = ((L % 360) + 360) % 360;

    let RA = deg * Math.atan(0.91764 * Math.tan(L * rad));
    RA = ((RA % 360) + 360) % 360;
    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = RA + (Lquadrant - RAquadrant);
    RA = RA / 15;

    const sinDec = 0.39782 * Math.sin(L * rad);
    const cosDec = Math.cos(Math.asin(sinDec));

    const zenith = 90.833; // standard astronomical zenith
    const cosH = (Math.cos(zenith * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));

    if (cosH > 1) {
      // Polar night (sun never rises)
      return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).toISOString();
    }
    if (cosH < -1) {
      // Polar day (sun never sets)
      return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString();
    }

    let H: number;
    if (isSunrise) {
      H = 360 - deg * Math.acos(cosH);
    } else {
      H = deg * Math.acos(cosH);
    }
    H = H / 15;

    const T = H + RA - 0.06571 * t - 6.622;
    let UT = T - lngHour;
    UT = ((UT % 24) + 24) % 24;

    const hours = Math.floor(UT);
    const minutes = Math.floor((UT - hours) * 60);
    const seconds = Math.floor(((UT - hours) * 60 - minutes) * 60);

    const res = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    return res.toISOString();
  }

  return {
    sunrise: getTimes(true),
    sunset: getTimes(false),
  };
}

/**
 * Format local time in the specified IANA timezone
 */
export function formatLocalTime(
  isoDateString: string | Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!isoDateString) return '--:--';

  // If already a formatted time string like "05:25 AM" or "5:42 PM"
  if (typeof isoDateString === 'string' && /^(0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM)$/i.test(isoDateString.trim())) {
    return isoDateString.trim().toUpperCase();
  }

  // If ISO local string without timezone suffix (e.g. "2026-09-14T05:25")
  if (typeof isoDateString === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(isoDateString.trim())) {
    const parts = isoDateString.trim().split('T')[1].split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

  try {
    const date = typeof isoDateString === 'string' ? new Date(isoDateString) : isoDateString;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone || 'UTC',
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
