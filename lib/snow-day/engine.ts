import { WeatherData, HourlyForecastItem } from '../weather/types/weather';
import {
  SnowDayPrediction,
  SnowDayFactors,
  SnowDayRiskLevel,
  ConfidenceLevel,
  IceRiskLevel,
  SnowDayAnalysisWindow,
  SnowDayHourlyWindowItem,
} from './types';
import { generateSnowDayReasons } from './explanations';
import { UnitSystem } from '../weather/utils';

export class SnowDayPredictionEngine {
  private static DISCLAIMER =
    'This calculator provides an automated weather-based estimate only. Actual school closures and cancellations depend on local school districts, county transportation conditions, road safety assessments, and municipal policies. Weather Hub is not an official school closure notification service.';

  /**
   * Calculates the snow day probability from normalized WeatherData
   */
  public static calculate(
    weather: WeatherData,
    targetDateStr?: string,
    unit: UnitSystem = 'c'
  ): SnowDayPrediction {
    const analysisWindow = this.determineAnalysisWindow(weather, targetDateStr);
    const hourlyItems = this.extractWindowHourly(weather.hourly, analysisWindow);

    const factors = this.extractFactors(hourlyItems, weather);
    const probability = this.calculateProbability(factors);
    const riskLevel = this.getRiskLevel(probability);
    const riskLabel = this.getRiskLabel(riskLevel);
    const confidence = this.calculateConfidence(weather, hourlyItems);
    const confidenceLabel = confidence.charAt(0).toUpperCase() + confidence.slice(1);
    const reasons = generateSnowDayReasons(factors, probability, unit);

    return {
      probability,
      riskLevel,
      riskLabel,
      confidence,
      confidenceLabel,
      analysisWindow,
      factors,
      reasons,
      location: weather.location,
      calculatedAt: new Date().toISOString(),
      providerInfo: {
        name: weather.metadata.providerName || 'Global Weather Service',
        isFallback: weather.metadata.isFallback,
        cached: weather.metadata.debugInfo?.cacheHit ?? false,
      },
      disclaimer: this.DISCLAIMER,
      weather,
    };
  }

  /**
   * Determines the analysis window (6:00 PM evening before -> 10:00 AM target day morning)
   */
  private static determineAnalysisWindow(
    weather: WeatherData,
    targetDateStr?: string
  ): SnowDayAnalysisWindow {
    let targetDate: Date;

    if (targetDateStr && /^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) {
      targetDate = new Date(`${targetDateStr}T00:00:00Z`);
    } else if (weather.daily && weather.daily.length > 1) {
      // Default to tomorrow (index 1 in daily forecast)
      targetDate = new Date(`${weather.daily[1].date}T00:00:00Z`);
    } else {
      // Fallback: +1 day from now
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const dateStr = targetDate.toISOString().split('T')[0];

    // Evening before (6 PM) to Morning of (10 AM)
    const windowStart = new Date(targetDate);
    windowStart.setDate(windowStart.getDate() - 1);
    windowStart.setUTCHours(18, 0, 0, 0);

    const windowEnd = new Date(targetDate);
    windowEnd.setUTCHours(10, 0, 0, 0);

    const formattedDayName = targetDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const formattedDate = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

    return {
      start: windowStart.toISOString(),
      end: windowEnd.toISOString(),
      dateStr,
      label: `${formattedDayName}, ${formattedDate} (6:00 PM → 10:00 AM Window)`,
    };
  }

  /**
   * Extracts hourly items within the analysis window
   */
  private static extractWindowHourly(
    hourly: HourlyForecastItem[],
    window: SnowDayAnalysisWindow
  ): SnowDayHourlyWindowItem[] {
    if (!hourly || hourly.length === 0) return [];

    const startTime = new Date(window.start).getTime();
    const endTime = new Date(window.end).getTime();

    const matched = hourly.filter((h) => {
      const t = new Date(h.time).getTime();
      return t >= startTime && t <= endTime;
    });

    // If no exact match (e.g. hourly array only has next 24h starting now), take the closest 16-24h slice
    const sourceList = matched.length >= 6 ? matched : hourly.slice(0, 24);

    return sourceList.map((h) => {
      const d = new Date(h.time);
      const hour = d.getUTCHours();
      const conditionLower = (h.condition || '').toLowerCase();
      const isSnow =
        h.iconCode === 'snow' ||
        h.iconCode === 'heavy_snow' ||
        conditionLower.includes('snow') ||
        conditionLower.includes('blizzard') ||
        conditionLower.includes('flurr');

      const isIce =
        h.iconCode === 'sleet' ||
        conditionLower.includes('freezing rain') ||
        conditionLower.includes('ice') ||
        conditionLower.includes('sleet') ||
        conditionLower.includes('glaze');

      // Estimate snow accumulation in cm from liquid precipitation when temp is <= 1.5°C
      let snowCm = 0;
      if (isSnow && h.precip > 0) {
        // Standard water-equivalent to snow ratio (1 mm liquid = ~1.0 to 1.2 cm snow at typical cold temps)
        const ratio = h.temp <= -5 ? 1.4 : h.temp <= 0 ? 1.1 : 0.8;
        snowCm = Number((h.precip * ratio).toFixed(1));
      } else if (isSnow && h.pop >= 40 && h.precip === 0) {
        // Trace snowfall
        snowCm = 0.5;
      }

      let period: 'evening' | 'overnight' | 'morning_commute' | 'day' = 'day';
      if (hour >= 18 && hour < 22) period = 'evening';
      else if (hour >= 22 || hour < 6) period = 'overnight';
      else if (hour >= 6 && hour <= 9) period = 'morning_commute';

      return {
        time: h.time,
        hour,
        tempC: h.temp,
        feelsLikeC: h.feelsLike,
        pop: h.pop,
        precipMm: h.precip,
        snowCm,
        isSnow,
        isIce,
        condition: h.condition,
        iconCode: h.iconCode,
        period,
      };
    });
  }

  /**
   * Evaluates aggregate meteorological factors
   */
  private static extractFactors(
    items: SnowDayHourlyWindowItem[],
    weather: WeatherData
  ): SnowDayFactors {
    if (items.length === 0) {
      // Fallback from daily summary if hourly items unavailable
      const dailyItem = weather.daily?.[1] || weather.daily?.[0];
      const isSnowDaily = dailyItem?.iconCode === 'snow' || dailyItem?.iconCode === 'heavy_snow';
      const approxSnowCm = isSnowDaily ? (dailyItem.precip || 2) * 1.1 : 0;

      return {
        snowAccumulationCm: approxSnowCm,
        snowAccumulationInches: Number((approxSnowCm / 2.54).toFixed(1)),
        overnightSnowCm: approxSnowCm * 0.5,
        morningCommuteSnowCm: approxSnowCm * 0.3,
        minTemperatureC: dailyItem?.low ?? 0,
        morningTemperatureC: dailyItem?.low ?? 0,
        maxWindGustKmh: dailyItem?.windSpeed ? dailyItem.windSpeed * 1.3 : 15,
        maxWindSpeedKmh: dailyItem?.windSpeed ?? 15,
        freezingRainRisk: dailyItem?.condition?.toLowerCase().includes('freezing rain') || false,
        iceRisk: 'none',
        sleetRisk: dailyItem?.iconCode === 'sleet',
        blizzardConditions: isSnowDaily && (dailyItem?.windSpeed ?? 0) >= 45,
        timingScore: 50,
        precipitationProbability: dailyItem?.pop ?? 20,
      };
    }

    let totalSnowCm = 0;
    let overnightSnowCm = 0;
    let morningCommuteSnowCm = 0;
    let minTemp = Infinity;
    let morningTemps: number[] = [];
    let maxWindGust = 0;
    let maxWindSpeed = 0;
    let freezingRainDetected = false;
    let sleetDetected = false;
    let maxPop = 0;

    items.forEach((item) => {
      totalSnowCm += item.snowCm;
      if (item.period === 'overnight') {
        overnightSnowCm += item.snowCm;
      } else if (item.period === 'morning_commute') {
        morningCommuteSnowCm += item.snowCm;
        morningTemps.push(item.tempC);
      }

      if (item.tempC < minTemp) minTemp = item.tempC;
      if (item.pop > maxPop) maxPop = item.pop;

      if (item.isIce) {
        if (item.condition.toLowerCase().includes('freezing rain')) {
          freezingRainDetected = true;
        } else {
          sleetDetected = true;
        }
      }
    });

    const morningTemp =
      morningTemps.length > 0
        ? morningTemps.reduce((a, b) => a + b, 0) / morningTemps.length
        : minTemp === Infinity
        ? 0
        : minTemp;

    // Check wind from current and daily
    maxWindSpeed = Math.max(weather.current.windSpeed, ...(weather.daily?.map((d) => d.windSpeed) || [20]));
    maxWindGust = weather.current.windGust || maxWindSpeed * 1.4;

    let iceRisk: IceRiskLevel = 'none';
    if (freezingRainDetected) iceRisk = 'high';
    else if (sleetDetected) iceRisk = 'moderate';
    else if (morningTemp <= 0 && items.some((i) => i.precipMm > 0 && !i.isSnow)) iceRisk = 'low';

    const blizzardConditions = totalSnowCm >= 5 && maxWindGust >= 55;

    // Calculate timing score (0 to 100)
    let timingScore = 0;
    if (morningCommuteSnowCm >= 2) timingScore += 50;
    else if (morningCommuteSnowCm > 0) timingScore += 30;

    if (overnightSnowCm >= 4) timingScore += 40;
    else if (overnightSnowCm > 0) timingScore += 20;

    timingScore = Math.min(100, timingScore);

    return {
      snowAccumulationCm: Number(totalSnowCm.toFixed(1)),
      snowAccumulationInches: Number((totalSnowCm / 2.54).toFixed(1)),
      overnightSnowCm: Number(overnightSnowCm.toFixed(1)),
      morningCommuteSnowCm: Number(morningCommuteSnowCm.toFixed(1)),
      minTemperatureC: minTemp === Infinity ? 0 : Number(minTemp.toFixed(1)),
      morningTemperatureC: Number(morningTemp.toFixed(1)),
      maxWindGustKmh: Number(maxWindGust.toFixed(1)),
      maxWindSpeedKmh: Number(maxWindSpeed.toFixed(1)),
      freezingRainRisk: freezingRainDetected,
      iceRisk,
      sleetRisk: sleetDetected,
      blizzardConditions,
      timingScore,
      precipitationProbability: maxPop,
    };
  }

  /**
   * Deterministic 0 - 100 scoring algorithm
   */
  public static calculateProbability(factors: SnowDayFactors): number {
    let score = 0;

    // 1. Snow Accumulation Base Points (0 to 55 pts)
    const snow = factors.snowAccumulationCm;
    if (snow >= 20) score += 55;
    else if (snow >= 15) score += 50;
    else if (snow >= 10) score += 45;
    else if (snow >= 7) score += 38;
    else if (snow >= 5) score += 30;
    else if (snow >= 3) score += 20;
    else if (snow >= 1.5) score += 12;
    else if (snow > 0.3) score += 5;

    // 2. Snow Timing Modifiers (-5 to +20 pts)
    if (factors.morningCommuteSnowCm >= 3) score += 18;
    else if (factors.morningCommuteSnowCm >= 1) score += 10;

    if (factors.overnightSnowCm >= 6) score += 12;
    else if (factors.overnightSnowCm >= 3) score += 6;

    // 3. Freezing Rain & Dangerous Ice Glaze (0 to 40 pts)
    if (factors.freezingRainRisk || factors.iceRisk === 'high') {
      score += 35; // Black ice causes mass bus cancellations even with 0 cm snow
    } else if (factors.iceRisk === 'moderate' || factors.sleetRisk) {
      score += 18;
    } else if (factors.iceRisk === 'low') {
      score += 8;
    }

    // 4. Temperature Modifiers (-15 to +15 pts)
    const mTemp = factors.morningTemperatureC;
    if (mTemp <= -12) {
      score += 15; // Extreme wind chill & engine start issues
    } else if (mTemp <= -5 && factors.snowAccumulationCm > 0) {
      score += 10;
    } else if (mTemp <= -1 && factors.snowAccumulationCm > 0) {
      score += 5;
    } else if (mTemp >= 4 && factors.snowAccumulationCm < 5 && !factors.freezingRainRisk) {
      score -= 15; // Fast melting on warm road surfaces
    } else if (mTemp >= 2 && factors.snowAccumulationCm < 3 && !factors.freezingRainRisk) {
      score -= 8;
    }

    // 5. Wind / Blizzard Modifier (0 to 15 pts)
    if (factors.blizzardConditions) {
      score += 15;
    } else if (factors.maxWindGustKmh >= 50 && factors.snowAccumulationCm >= 2) {
      score += 8;
    }

    // 6. Precipitation Probability Scaling
    // If PoP is low, dampen the overall score
    if (factors.precipitationProbability < 30 && factors.snowAccumulationCm < 1 && !factors.freezingRainRisk) {
      score = Math.min(score, 15);
    } else if (factors.precipitationProbability < 50) {
      score = score * (factors.precipitationProbability / 60);
    }

    // Special case: If warm and absolutely no snow/ice
    if (factors.snowAccumulationCm === 0 && !factors.freezingRainRisk && !factors.sleetRisk && mTemp >= 2) {
      return 0;
    }

    // Clamp score between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Maps probability score to categorical risk level
   */
  public static getRiskLevel(probability: number): SnowDayRiskLevel {
    if (probability < 20) return 'very-low';
    if (probability < 40) return 'low';
    if (probability < 60) return 'moderate';
    if (probability < 80) return 'high';
    return 'very-high';
  }

  public static getRiskLabel(risk: SnowDayRiskLevel): string {
    switch (risk) {
      case 'very-low':
        return 'Very Low';
      case 'low':
        return 'Low';
      case 'moderate':
        return 'Moderate';
      case 'high':
        return 'High';
      case 'very-high':
        return 'Very High';
    }
  }

  /**
   * Determines forecast confidence
   */
  private static calculateConfidence(
    weather: WeatherData,
    items: SnowDayHourlyWindowItem[]
  ): ConfidenceLevel {
    if (!weather.hourly || weather.hourly.length < 8 || items.length < 4) {
      return 'low';
    }
    if (items.length >= 12 && !weather.metadata.isFallback) {
      return 'high';
    }
    return 'medium';
  }
}
