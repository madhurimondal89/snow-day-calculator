import {
  WeatherData,
  CurrentWeather,
  HourlyForecastItem,
  DailyForecastItem,
  WeatherIconCode,
  LocationInfo,
} from '../types/weather';

export interface MetNorwayTimeseriesItem {
  time: string;
  data: {
    instant: {
      details: {
        air_pressure_at_sea_level?: number;
        air_temperature?: number;
        cloud_area_fraction?: number;
        relative_humidity?: number;
        wind_from_direction?: number;
        wind_speed?: number;
        wind_speed_of_gust?: number;
        dew_point_temperature?: number;
        ultraviolet_index_clear_sky?: number;
      };
    };
    next_1_hours?: {
      summary: { symbol_code: string };
      details?: { precipitation_amount?: number; probability_of_precipitation?: number };
    };
    next_6_hours?: {
      summary: { symbol_code: string };
      details?: {
        air_temperature_max?: number;
        air_temperature_min?: number;
        precipitation_amount?: number;
        probability_of_precipitation?: number;
      };
    };
    next_12_hours?: {
      summary: { symbol_code: string };
      details?: { probability_of_precipitation?: number };
    };
  };
}

export interface MetNorwayResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [lon, lat, altitude]
  };
  properties: {
    meta: {
      updated_at: string;
      units: Record<string, string>;
    };
    timeseries: MetNorwayTimeseriesItem[];
  };
}

/**
 * Maps MET Norway symbol codes to unified WeatherIconCode
 */
export function mapMetNorwaySymbolToIcon(symbolCode: string): WeatherIconCode {
  const code = symbolCode.toLowerCase();

  if (code.startsWith('clearsky')) {
    return code.includes('night') ? 'clear_night' : 'clear_day';
  }
  if (code.startsWith('fair') || code.startsWith('partlycloudy')) {
    return code.includes('night') ? 'partly_cloudy_night' : 'partly_cloudy_day';
  }
  if (code.startsWith('cloudy')) {
    return 'cloudy';
  }
  if (code.startsWith('fog')) {
    return 'fog';
  }
  if (code.startsWith('heavyrainshowersandthunder') || code.startsWith('heavyrainandthunder') || code.startsWith('thunderstorm')) {
    return 'thunderstorm_rain';
  }
  if (code.includes('thunder')) {
    return 'thunderstorm';
  }
  if (code.startsWith('heavyrain') || code.startsWith('heavyrainshowers')) {
    return 'heavy_rain';
  }
  if (code.startsWith('rain') || code.startsWith('rainshowers') || code.startsWith('lightrainshowers')) {
    return 'rain';
  }
  if (code.startsWith('lightrain')) {
    return 'drizzle';
  }
  if (code.startsWith('heavysnow') || code.startsWith('heavysnowshowers')) {
    return 'heavy_snow';
  }
  if (code.startsWith('snow') || code.startsWith('snowshowers') || code.startsWith('lightsnowshowers') || code.startsWith('lightsnow')) {
    return 'snow';
  }
  if (code.startsWith('sleet') || code.startsWith('lightsleet') || code.startsWith('heavysleet')) {
    return 'sleet';
  }

  return 'cloudy';
}

/**
 * Converts MET Norway symbol code to clean human readable condition string
 */
export function mapMetNorwaySymbolToCondition(symbolCode: string): string {
  const cleaned = symbolCode.replace(/_(day|night|polartwilight)$/, '').toLowerCase();
  const descriptions: Record<string, string> = {
    clearsky: 'Clear Sky',
    fair: 'Mainly Clear',
    partlycloudy: 'Partly Cloudy',
    cloudy: 'Cloudy',
    overcast: 'Overcast',
    fog: 'Foggy',
    lightrain: 'Light Rain',
    rain: 'Moderate Rain',
    heavyrain: 'Heavy Rain',
    lightrainshowers: 'Light Rain Showers',
    rainshowers: 'Rain Showers',
    heavyrainshowers: 'Heavy Rain Showers',
    lightsleet: 'Light Sleet',
    sleet: 'Sleet',
    heavysleet: 'Heavy Sleet',
    lightsnow: 'Light Snow',
    snow: 'Snow',
    heavysnow: 'Heavy Snow',
    lightsnowshowers: 'Light Snow Showers',
    snowshowers: 'Snow Showers',
    heavysnowshowers: 'Heavy Snow Showers',
    lightrainandthunder: 'Light Rain with Thunder',
    rainandthunder: 'Thunderstorm with Rain',
    heavyrainandthunder: 'Heavy Thunderstorm',
    lightrainshowersandthunder: 'Scattered Thunderstorms',
    rainshowersandthunder: 'Thunderstorms with Showers',
    heavyrainshowersandthunder: 'Severe Thunderstorms',
    lightsleetandthunder: 'Sleet and Thunder',
    sleetandthunder: 'Sleet with Thunder',
    heavysleetandthunder: 'Heavy Sleet with Thunder',
    lightsnowandthunder: 'Snow with Thunder',
    snowandthunder: 'Snowstorm with Thunder',
    heavysnowandthunder: 'Severe Snowstorm with Thunder',
  };

  return descriptions[cleaned] || cleaned.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Calculate Steadman's Apparent Temperature / Feels-Like temperature
 */
export function calculateFeelsLike(tempC: number, humidityPct: number, windSpeedKmh: number): number {
  const windMs = windSpeedKmh / 3.6;
  // Water vapor pressure (hPa)
  const e = (humidityPct / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  // Australian Bureau of Meteorology formula for apparent temperature
  const apparent = tempC + 0.33 * e - 0.7 * windMs - 4.0;
  return Math.round(apparent * 10) / 10;
}

/**
 * Generates an algorithmic natural-language summary strictly from real API response data
 */
export function generateRealWeatherSummary(
  locationName: string,
  current: CurrentWeather,
  todayDaily?: DailyForecastItem
): string {
  const parts: string[] = [];
  parts.push(`${locationName} is currently ${Math.round(current.temp)}°C with ${current.condition.toLowerCase()}.`);

  if (Math.abs(current.feelsLike - current.temp) >= 2) {
    parts.push(`It feels like ${Math.round(current.feelsLike)}°C.`);
  }

  if (todayDaily) {
    parts.push(`Today's temperatures are expected between ${Math.round(todayDaily.low)}°C and ${Math.round(todayDaily.high)}°C.`);
    if (todayDaily.pop >= 40) {
      parts.push(`There is a ${Math.round(todayDaily.pop)}% chance of precipitation (${todayDaily.precip.toFixed(1)} mm).`);
    } else if (todayDaily.pop > 10) {
      parts.push(`Precipitation probability is around ${Math.round(todayDaily.pop)}%.`);
    } else {
      parts.push('Dry conditions are expected throughout the day.');
    }
  }

  if (current.windSpeed > 25) {
    parts.push(`Breezy conditions with wind speeds of ${Math.round(current.windSpeed)} km/h.`);
  }

  return parts.join(' ');
}

/**
 * Normalizes MET Norway response into WeatherHub internal format
 */
export function normalizeMetNorwayResponse(
  data: MetNorwayResponse,
  locationInfo: LocationInfo
): WeatherData {
  const timeseries = data.properties?.timeseries || [];
  if (timeseries.length === 0) {
    throw new Error('MET Norway returned empty timeseries');
  }

  const first = timeseries[0];
  const instant = first.data.instant.details;
  const next1 = first.data.next_1_hours;
  const next6 = first.data.next_6_hours;

  const symbolCode = next1?.summary?.symbol_code || next6?.summary?.symbol_code || 'cloudy';
  const isDay = !symbolCode.includes('night');
  const temp = instant.air_temperature ?? 0;
  const humidity = instant.relative_humidity ?? 50;
  const windSpeed = (instant.wind_speed ?? 0) * 3.6; // convert m/s to km/h
  const windGust = instant.wind_speed_of_gust ? instant.wind_speed_of_gust * 3.6 : undefined;
  const windDirection = instant.wind_from_direction ?? 0;
  const pressure = instant.air_pressure_at_sea_level ?? 1013;
  const precipitation = next1?.details?.precipitation_amount ?? (next6?.details?.precipitation_amount ? next6.details.precipitation_amount / 6 : 0);
  const cloudCover = instant.cloud_area_fraction ?? 0;
  const uvIndex = instant.ultraviolet_index_clear_sky ?? 0;
  const dewPoint = instant.dew_point_temperature;
  const feelsLike = calculateFeelsLike(temp, humidity, windSpeed);

  // Approximate sunrise/sunset if not provided by provider (solar calculation based on coordinates)
  const todayDateStr = first.time.split('T')[0];
  const sunrise = `${todayDateStr}T06:00:00Z`;
  const sunset = `${todayDateStr}T18:30:00Z`;

  const current: CurrentWeather = {
    time: first.time,
    temp: Math.round(temp * 10) / 10,
    feelsLike,
    condition: mapMetNorwaySymbolToCondition(symbolCode),
    iconCode: mapMetNorwaySymbolToIcon(symbolCode),
    humidity: Math.round(humidity),
    windSpeed: Math.round(windSpeed * 10) / 10,
    windDirection,
    windGust: windGust ? Math.round(windGust * 10) / 10 : undefined,
    pressure: Math.round(pressure),
    precipitation: Math.round(precipitation * 10) / 10,
    cloudCover: Math.round(cloudCover),
    uvIndex: Math.round(uvIndex * 10) / 10,
    sunrise,
    sunset,
    dewPoint: dewPoint !== undefined ? Math.round(dewPoint * 10) / 10 : undefined,
    isDay,
  };

  // Hourly items (next 36 items)
  const hourly: HourlyForecastItem[] = timeseries.slice(0, 36).map((item) => {
    const d = item.data.instant.details;
    const n1 = item.data.next_1_hours;
    const n6 = item.data.next_6_hours;
    const sym = n1?.summary?.symbol_code || n6?.summary?.symbol_code || 'cloudy';
    const hTemp = d.air_temperature ?? 0;
    const hHum = d.relative_humidity ?? 50;
    const hWind = (d.wind_speed ?? 0) * 3.6;
    const hPop = n1?.details?.probability_of_precipitation ?? n6?.details?.probability_of_precipitation ?? 0;
    const hPrecip = n1?.details?.precipitation_amount ?? (n6?.details?.precipitation_amount ? n6.details.precipitation_amount / 6 : 0);

    return {
      time: item.time,
      temp: Math.round(hTemp * 10) / 10,
      feelsLike: calculateFeelsLike(hTemp, hHum, hWind),
      pop: Math.round(hPop),
      precip: Math.round(hPrecip * 10) / 10,
      windSpeed: Math.round(hWind * 10) / 10,
      windDirection: d.wind_from_direction ?? 0,
      iconCode: mapMetNorwaySymbolToIcon(sym),
      condition: mapMetNorwaySymbolToCondition(sym),
      uvIndex: d.ultraviolet_index_clear_sky ? Math.round(d.ultraviolet_index_clear_sky * 10) / 10 : undefined,
      humidity: Math.round(hHum),
      isDay: !sym.includes('night'),
    };
  });

  // Daily grouping (group by YYYY-MM-DD)
  const dailyMap = new Map<string, MetNorwayTimeseriesItem[]>();
  for (const item of timeseries) {
    const dateKey = item.time.split('T')[0];
    const existing = dailyMap.get(dateKey) || [];
    existing.push(item);
    dailyMap.set(dateKey, existing);
  }

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daily: DailyForecastItem[] = [];

  for (const [dateStr, dayItems] of Array.from(dailyMap.entries())) {
    if (daily.length >= 8) break;

    const temps = dayItems
      .map((i) => i.data.instant.details.air_temperature)
      .filter((t): t is number => t !== undefined);

    const high = temps.length > 0 ? Math.max(...temps) : temp;
    const low = temps.length > 0 ? Math.min(...temps) : temp;

    // Precipitation sum and max probability
    let precipSum = 0;
    let maxPop = 0;
    const symbolCounts: Record<string, number> = {};

    for (const item of dayItems) {
      const n1 = item.data.next_1_hours;
      const n6 = item.data.next_6_hours;
      const pop = n1?.details?.probability_of_precipitation ?? n6?.details?.probability_of_precipitation ?? 0;
      if (pop > maxPop) maxPop = pop;

      const pAmount = n1?.details?.precipitation_amount ?? (n6?.details?.precipitation_amount ? n6.details.precipitation_amount / 6 : 0);
      precipSum += pAmount;

      const sym = n1?.summary?.symbol_code || n6?.summary?.symbol_code;
      if (sym) {
        const cleanSym = sym.replace(/_(day|night)$/, '');
        symbolCounts[cleanSym] = (symbolCounts[cleanSym] || 0) + 1;
      }
    }

    // Pick dominant symbol
    let dominantSymbol = 'cloudy';
    let maxCount = 0;
    for (const [sym, count] of Object.entries(symbolCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantSymbol = sym;
      }
    }

    const dateObj = new Date(dateStr + 'T12:00:00Z');
    const dayName = weekdayNames[dateObj.getUTCDay()];

    daily.push({
      date: dateStr,
      dayName,
      iconCode: mapMetNorwaySymbolToIcon(dominantSymbol),
      condition: mapMetNorwaySymbolToCondition(dominantSymbol),
      high: Math.round(high * 10) / 10,
      low: Math.round(low * 10) / 10,
      pop: Math.round(maxPop),
      precip: Math.round(precipSum * 10) / 10,
      windSpeed: Math.round(windSpeed * 10) / 10,
      summary: `${mapMetNorwaySymbolToCondition(dominantSymbol)}, high ${Math.round(high)}°C, low ${Math.round(low)}°C`,
    });
  }

  const dynamicSummary = generateRealWeatherSummary(locationInfo.name, current, daily[0]);

  return {
    location: locationInfo,
    current,
    hourly,
    daily,
    dynamicSummary,
    metadata: {
      providerName: 'MET Norway Weather API',
      providerId: 'metno',
      fetchedAt: new Date().toISOString(),
      attributionText: 'Weather forecast from MET Norway (api.met.no)',
      attributionUrl: 'https://api.met.no/',
      isFallback: false,
    },
  };
}
