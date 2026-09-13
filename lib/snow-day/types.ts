import { LocationInfo, WeatherData } from '../weather/types/weather';

export type SnowDayRiskLevel = 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type IceRiskLevel = 'none' | 'low' | 'moderate' | 'high';

export interface SnowDayFactors {
  snowAccumulationCm: number;
  snowAccumulationInches: number;
  overnightSnowCm: number;
  morningCommuteSnowCm: number;
  minTemperatureC: number;
  morningTemperatureC: number;
  maxWindGustKmh: number;
  maxWindSpeedKmh: number;
  freezingRainRisk: boolean;
  iceRisk: IceRiskLevel;
  sleetRisk: boolean;
  blizzardConditions: boolean;
  timingScore: number; // 0-100 based on overnight & morning weighting
  precipitationProbability: number; // 0-100
}

export interface SnowDayAnalysisWindow {
  start: string; // ISO string
  end: string; // ISO string
  dateStr: string; // YYYY-MM-DD
  label: string; // e.g. "Tomorrow — 6:00 PM → 10:00 AM"
}

export interface SnowDayPrediction {
  probability: number; // 0 to 100
  riskLevel: SnowDayRiskLevel;
  riskLabel: string; // "Very Low", "Low", "Moderate", "High", "Very High"
  confidence: ConfidenceLevel;
  confidenceLabel: string;
  analysisWindow: SnowDayAnalysisWindow;
  factors: SnowDayFactors;
  reasons: string[];
  location: LocationInfo;
  calculatedAt: string;
  providerInfo: {
    name: string;
    isFallback: boolean;
    cached: boolean;
  };
  disclaimer: string;
  weather?: WeatherData;
}

export interface SnowDayHourlyWindowItem {
  time: string;
  hour: number;
  tempC: number;
  feelsLikeC: number;
  pop: number;
  precipMm: number;
  snowCm: number;
  isSnow: boolean;
  isIce: boolean;
  condition: string;
  iconCode: string;
  period: 'evening' | 'overnight' | 'morning_commute' | 'day';
}
