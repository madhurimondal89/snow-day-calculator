import { SnowDayFactors } from './types';
import { UnitSystem } from '../weather/utils';

export function generateSnowDayReasons(
  factors: SnowDayFactors,
  probability: number,
  unit: UnitSystem = 'c'
): string[] {
  const reasons: string[] = [];
  const isImperial = unit === 'f';

  // 1. Snow Accumulation & Timing
  if (factors.snowAccumulationCm >= 15) {
    const snowText = isImperial
      ? `${factors.snowAccumulationInches.toFixed(1)} inches`
      : `${factors.snowAccumulationCm.toFixed(1)} cm`;
    reasons.push(`Major snowfall of ${snowText} expected during the forecast window, creating severe travel disruption.`);
  } else if (factors.snowAccumulationCm >= 7) {
    const snowText = isImperial
      ? `${factors.snowAccumulationInches.toFixed(1)} inches`
      : `${factors.snowAccumulationCm.toFixed(1)} cm`;
    reasons.push(`Significant snowfall of ${snowText} expected, exceeding typical school transportation disruption thresholds.`);
  } else if (factors.snowAccumulationCm >= 2.5) {
    const snowText = isImperial
      ? `${factors.snowAccumulationInches.toFixed(1)} inches`
      : `${factors.snowAccumulationCm.toFixed(1)} cm`;
    reasons.push(`Moderate snowfall of ${snowText} forecast, which may slow morning commutes and require road treatment.`);
  } else if (factors.snowAccumulationCm > 0.5) {
    const snowText = isImperial
      ? `${factors.snowAccumulationInches.toFixed(1)} inches`
      : `${factors.snowAccumulationCm.toFixed(1)} cm`;
    reasons.push(`Light snow accumulation of ${snowText} expected; road crews typically manage this without widespread closures.`);
  } else if (factors.snowAccumulationCm === 0 && !factors.freezingRainRisk && !factors.sleetRisk) {
    reasons.push('No measurable snowfall is projected during the upcoming forecast window.');
  }

  // 2. Overnight & Morning Commute Timing
  if (factors.morningCommuteSnowCm >= 2) {
    const snowText = isImperial
      ? `${(factors.morningCommuteSnowCm / 2.54).toFixed(1)} in`
      : `${factors.morningCommuteSnowCm.toFixed(1)} cm`;
    reasons.push(`Snowfall actively continuing during the critical morning commute (6:00 AM – 9:00 AM) with ~${snowText} falling.`);
  } else if (factors.overnightSnowCm >= 4) {
    reasons.push('Heavy overnight accumulation gives municipal plows limited time to clear secondary bus routes.');
  }

  // 3. Freezing Rain / Ice / Sleet Risk
  if (factors.freezingRainRisk || factors.iceRisk === 'high') {
    reasons.push('Freezing rain and dangerous ice glaze risk detected, which makes road travel hazardous even with minimal snow.');
  } else if (factors.iceRisk === 'moderate' || factors.sleetRisk) {
    reasons.push('Sleet or mixed winter precipitation may create slippery untreated road surfaces.');
  }

  // 4. Temperatures & Freezing Conditions
  if (factors.morningTemperatureC <= -12) {
    const tempText = isImperial
      ? `${Math.round((factors.morningTemperatureC * 9) / 5 + 32)}°F`
      : `${Math.round(factors.morningTemperatureC)}°C`;
    reasons.push(`Extreme morning cold near ${tempText} increases the risk of mechanical bus issues and dangerous student exposure.`);
  } else if (factors.morningTemperatureC <= -2 && factors.snowAccumulationCm > 0) {
    const tempText = isImperial
      ? `${Math.round((factors.morningTemperatureC * 9) / 5 + 32)}°F`
      : `${Math.round(factors.morningTemperatureC)}°C`;
    reasons.push(`Below-freezing morning temperatures (${tempText}) will prevent fallen snow from naturally melting on roads.`);
  } else if (factors.morningTemperatureC >= 3 && factors.snowAccumulationCm < 3) {
    const tempText = isImperial
      ? `${Math.round((factors.morningTemperatureC * 9) / 5 + 32)}°F`
      : `${Math.round(factors.morningTemperatureC)}°C`;
    reasons.push(`Temperatures well above freezing (${tempText}) will encourage fast slush melt on primary roads.`);
  }

  // 5. Winds & Blizzard Conditions
  if (factors.blizzardConditions || (factors.maxWindGustKmh >= 55 && factors.snowAccumulationCm >= 3)) {
    const gustText = isImperial
      ? `${Math.round(factors.maxWindGustKmh * 0.621371)} mph`
      : `${Math.round(factors.maxWindGustKmh)} km/h`;
    reasons.push(`Strong wind gusts up to ${gustText} will cause blowing and drifting snow, significantly reducing road visibility.`);
  }

  // Default fallback if reasons are sparse
  if (reasons.length === 0) {
    if (probability <= 20) {
      reasons.push('Mild or dry winter conditions expected with negligible impact on school schedules.');
    } else if (probability >= 60) {
      reasons.push('Winter weather factors combine to create notable hazardous travel risks.');
    } else {
      reasons.push('Moderate winter conditions forecast; local district decisions will depend on local road treatment capabilities.');
    }
  }

  return reasons;
}
