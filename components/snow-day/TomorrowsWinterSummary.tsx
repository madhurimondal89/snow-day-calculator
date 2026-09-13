'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CloudSnow, Wind, Droplets, Thermometer, Compass } from 'lucide-react';
import { WeatherData, DailyForecastItem } from '@/lib/weather/types/weather';
import { SnowDayFactors } from '@/lib/snow-day/types';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';
import { formatTemperature, formatWindSpeed } from '@/lib/weather/utils';
import { WeatherIcon } from '../weather/WeatherIcon';

interface TomorrowsWinterSummaryProps {
  weather: WeatherData;
  factors: SnowDayFactors;
}

export const TomorrowsWinterSummary: React.FC<TomorrowsWinterSummaryProps> = ({ weather, factors }) => {
  const { unit } = useWeatherPreferences();
  const isImperial = unit === 'f';

  const tomorrow: DailyForecastItem = weather.daily?.[1] || weather.daily?.[0] || {
    date: new Date().toISOString().split('T')[0],
    dayName: 'Tomorrow',
    iconCode: 'partly_cloudy_day',
    condition: 'Partly Cloudy',
    high: 5,
    low: -2,
    pop: 40,
    precip: 2,
    windSpeed: 15,
  };

  const snowAmountText = isImperial
    ? `${factors.snowAccumulationInches.toFixed(1)}"`
    : `${factors.snowAccumulationCm.toFixed(1)} cm`;

  const citySlug = weather.location.slug || weather.location.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Supporting Forecast
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.1rem' }}>
            Tomorrow&apos;s Weather Overview
          </h3>
        </div>

        <Link
          href={`/weather/${citySlug}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            color: 'var(--accent-primary)',
            fontWeight: 600,
          }}
        >
          <span>Full 7-Day Weather Forecast</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.85rem',
        }}
      >
        {/* High / Low */}
        <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Thermometer size={14} color="#f59e0b" /> High / Low
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.3rem', color: 'var(--text-primary)' }}>
            {formatTemperature(tomorrow.high, unit)} / {formatTemperature(tomorrow.low, unit)}
          </div>
        </div>

        {/* Snow Expected */}
        <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <CloudSnow size={14} color="#38bdf8" /> Expected Snow
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.3rem', color: '#38bdf8' }}>
            {snowAmountText}
          </div>
        </div>

        {/* Precip Chance */}
        <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Droplets size={14} color="#06b6d4" /> Precip Chance
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.3rem', color: 'var(--text-primary)' }}>
            {tomorrow.pop}%
          </div>
        </div>

        {/* Wind Speed */}
        <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Wind size={14} color="#818cf8" /> Wind Speed
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.3rem', color: 'var(--text-primary)' }}>
            {formatWindSpeed(tomorrow.windSpeed, isImperial ? 'mph' : 'kmh')}
          </div>
        </div>
      </div>
    </div>
  );
};
