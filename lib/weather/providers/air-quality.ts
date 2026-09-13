import { AirQualityData, AQILevel } from '../types/weather';

export interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  current?: {
    time: string;
    european_aqi?: number;
    us_aqi?: number;
    pm10?: number;
    pm2_5?: number;
    carbon_monoxide?: number;
    nitrogen_dioxide?: number;
    sulphur_dioxide?: number;
    ozone?: number;
  };
}

export function classifyAQI(usAqi?: number, europeanAqi?: number): {
  level: AQILevel;
  label: string;
  colorCode: string;
  description: string;
  advisory: string;
} {
  // If US AQI is available (0-500 scale)
  if (usAqi !== undefined && usAqi !== null) {
    if (usAqi <= 50) {
      return {
        level: 'good',
        label: 'Good',
        colorCode: '#10b981', // green
        description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
        advisory: 'Enjoy outdoor activities. Air quality is ideal for all individuals.',
      };
    } else if (usAqi <= 100) {
      return {
        level: 'moderate',
        label: 'Moderate',
        colorCode: '#f59e0b', // yellow-amber
        description: 'Air quality is acceptable; however, some pollutants may pose a moderate health concern for a very small number of unusually sensitive individuals.',
        advisory: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.',
      };
    } else if (usAqi <= 150) {
      return {
        level: 'unhealthy_sensitive',
        label: 'Unhealthy for Sensitive Groups',
        colorCode: '#f97316', // orange
        description: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
        advisory: 'People with respiratory or heart disease, the elderly, and children should limit prolonged outdoor exertion.',
      };
    } else if (usAqi <= 200) {
      return {
        level: 'unhealthy',
        label: 'Unhealthy',
        colorCode: '#ef4444', // red
        description: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
        advisory: 'Active children and adults, and people with respiratory disease, should avoid prolonged outdoor exertion; everyone else should limit outdoor exertion.',
      };
    } else if (usAqi <= 300) {
      return {
        level: 'very_unhealthy',
        label: 'Very Unhealthy',
        colorCode: '#8b5cf6', // purple
        description: 'Health alert: everyone may experience more serious health effects.',
        advisory: 'Avoid outdoor activities. Keep windows closed and run an air purifier if possible.',
      };
    } else {
      return {
        level: 'hazardous',
        label: 'Hazardous',
        colorCode: '#881337', // maroon
        description: 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
        advisory: 'Remain indoors with clean air filtration. Avoid all physical outdoor activity.',
      };
    }
  }

  // European AQI fallback (1-5 or 0-100 scale)
  const eAqi = europeanAqi || 20;
  if (eAqi <= 20) {
    return {
      level: 'good',
      label: 'Good',
      colorCode: '#10b981',
      description: 'Air quality is good. Minimal or no health concern.',
      advisory: 'Ideal conditions for outdoor recreation.',
    };
  } else if (eAqi <= 40) {
    return {
      level: 'moderate',
      label: 'Fair',
      colorCode: '#f59e0b',
      description: 'Air quality is fair with minor pollutant concentrations.',
      advisory: 'Sensitive individuals should monitor symptoms.',
    };
  } else if (eAqi <= 60) {
    return {
      level: 'unhealthy_sensitive',
      label: 'Moderate',
      colorCode: '#f97316',
      description: 'Moderate air pollution levels.',
      advisory: 'Consider reducing prolonged strenuous outdoor activities.',
    };
  } else if (eAqi <= 80) {
    return {
      level: 'unhealthy',
      label: 'Poor',
      colorCode: '#ef4444',
      description: 'Poor air quality. High concentration of airborne particulates.',
      advisory: 'Limit outdoor activities, especially for vulnerable individuals.',
    };
  } else {
    return {
      level: 'very_unhealthy',
      label: 'Very Poor',
      colorCode: '#8b5cf6',
      description: 'Very poor air quality condition.',
      advisory: 'Stay indoors and avoid outdoor physical exercise.',
    };
  }
}

export class AirQualityProvider {
  private timeoutMs: number = 6000;

  public async getAirQuality(lat: number, lon: number): Promise<AirQualityData | undefined> {
    const formattedLat = Number(lat.toFixed(4));
    const formattedLon = Number(lon.toFixed(4));

    const params = new URLSearchParams({
      latitude: formattedLat.toString(),
      longitude: formattedLon.toString(),
      current: 'european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
    });

    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': process.env.WEATHER_USER_AGENT || 'WeatherHub/1.0',
        },
        signal: controller.signal,
        next: {
          revalidate: Number(process.env.AQI_CACHE_SECONDS || 1800),
        },
      });

      if (!res.ok) {
        return undefined;
      }

      const json: OpenMeteoAirQualityResponse = await res.json();
      if (!json.current) return undefined;

      const c = json.current;
      const usAqi = c.us_aqi;
      const eAqi = c.european_aqi;
      const classification = classifyAQI(usAqi, eAqi);

      return {
        aqi: usAqi ?? eAqi ?? 0,
        aqiStandard: usAqi !== undefined ? 'US EPA AQI' : 'European EAQI',
        level: classification.level,
        label: classification.label,
        colorCode: classification.colorCode,
        description: classification.description,
        advisory: classification.advisory,
        pm2_5: c.pm2_5 !== undefined ? Math.round(c.pm2_5 * 10) / 10 : undefined,
        pm10: c.pm10 !== undefined ? Math.round(c.pm10 * 10) / 10 : undefined,
        o3: c.ozone !== undefined ? Math.round(c.ozone * 10) / 10 : undefined,
        no2: c.nitrogen_dioxide !== undefined ? Math.round(c.nitrogen_dioxide * 10) / 10 : undefined,
        so2: c.sulphur_dioxide !== undefined ? Math.round(c.sulphur_dioxide * 10) / 10 : undefined,
        co: c.carbon_monoxide !== undefined ? Math.round(c.carbon_monoxide * 10) / 10 : undefined,
      };
    } catch {
      // Air quality failure should not break main weather experience
      return undefined;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
