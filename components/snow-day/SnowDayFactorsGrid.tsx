'use client';

import React from 'react';
import { Snowflake, Thermometer, ShieldAlert, Wind, Clock, AlertTriangle } from 'lucide-react';
import { SnowDayFactors } from '@/lib/snow-day/types';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';
import { formatTemperature } from '@/lib/weather/utils';

interface SnowDayFactorsGridProps {
  factors: SnowDayFactors;
}

export const SnowDayFactorsGrid: React.FC<SnowDayFactorsGridProps> = ({ factors }) => {
  const { unit } = useWeatherPreferences();
  const isImperial = unit === 'f';

  // Format snowfall
  const snowAmountText = isImperial
    ? `${factors.snowAccumulationInches.toFixed(1)} in`
    : `${factors.snowAccumulationCm.toFixed(1)} cm`;

  const overnightSnowText = isImperial
    ? `${(factors.overnightSnowCm / 2.54).toFixed(1)} in`
    : `${factors.overnightSnowCm.toFixed(1)} cm`;

  const commuteSnowText = isImperial
    ? `${(factors.morningCommuteSnowCm / 2.54).toFixed(1)} in`
    : `${factors.morningCommuteSnowCm.toFixed(1)} cm`;

  // Format morning temp
  const morningTempStr = formatTemperature(factors.morningTemperatureC, unit);
  const isFrozen = factors.morningTemperatureC <= 0;

  // Format wind
  const windGustText = isImperial
    ? `${Math.round(factors.maxWindGustKmh * 0.621371)} mph`
    : `${Math.round(factors.maxWindGustKmh)} km/h`;

  // Ice Risk formatting
  let iceColor = '#10b981';
  let iceLabel = 'Minimal / None';
  if (factors.iceRisk === 'high' || factors.freezingRainRisk) {
    iceColor = '#ef4444';
    iceLabel = 'Severe (Freezing Rain)';
  } else if (factors.iceRisk === 'moderate' || factors.sleetRisk) {
    iceColor = '#f59e0b';
    iceLabel = 'Moderate (Sleet / Mix)';
  } else if (factors.iceRisk === 'low') {
    iceColor = '#38bdf8';
    iceLabel = 'Low (Light Glaze)';
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}
    >
      {/* 1. Snow Accumulation Card */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Snowfall Expected
          </span>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Snowflake size={16} color="#38bdf8" />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {snowAmountText}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          Overnight: <strong>{overnightSnowText}</strong> • Commute: <strong>{commuteSnowText}</strong>
        </div>
      </div>

      {/* 2. Morning Commute Temperature Card */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Commute Temp
          </span>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: isFrozen ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Thermometer size={16} color={isFrozen ? '#3b82f6' : '#f59e0b'} />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {morningTempStr}
        </div>
        <div style={{ fontSize: '0.75rem', color: isFrozen ? '#38bdf8' : 'var(--text-secondary)', marginTop: '0.35rem' }}>
          {isFrozen ? '❄️ Below Freezing (Pavement Stays Frozen)' : '☀️ Above Freezing (Snow Melting)'}
        </div>
      </div>

      {/* 3. Ice & Freezing Rain Risk Card */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Ice & Glaze Risk
          </span>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${iceColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={16} color={iceColor} />
          </div>
        </div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: iceColor, marginTop: '0.25rem' }}>
          {iceLabel}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          {factors.freezingRainRisk ? 'Hazardous road glazing possible' : 'No major ice accumulation projected'}
        </div>
      </div>

      {/* 4. Wind Gusts & Blizzard Conditions Card */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Peak Wind Gusts
          </span>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wind size={16} color="#06b6d4" />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {windGustText}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          {factors.blizzardConditions ? '⚠️ Blizzard / Blowing Snow Risk' : 'Normal winter transit wind range'}
        </div>
      </div>
    </div>
  );
};
