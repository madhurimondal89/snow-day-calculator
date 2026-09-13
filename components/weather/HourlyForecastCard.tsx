'use client';

import React from 'react';
import { Clock, Umbrella, Wind } from 'lucide-react';
import { HourlyForecastItem } from '@/lib/weather/types/weather';
import { WeatherIcon } from './WeatherIcon';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';
import { formatTemperature, formatWindSpeed, formatLocalTime } from '@/lib/weather/utils';

interface HourlyForecastCardProps {
  hourly: HourlyForecastItem[];
  timezone: string;
}

export const HourlyForecastCard: React.FC<HourlyForecastCardProps> = ({ hourly, timezone }) => {
  const { unit } = useWeatherPreferences();

  if (!hourly || hourly.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} style={{ color: 'var(--accent-primary)' }} /> Hourly Forecast (24 Hours)
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scroll horizontally →</span>
      </div>

      <div
        className="custom-scrollbar"
        style={{
          display: 'flex',
          gap: '0.85rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          scrollSnapType: 'x mandatory',
        }}
      >
        {hourly.slice(0, 24).map((item, idx) => {
          const timeLabel =
            idx === 0
              ? 'Now'
              : formatLocalTime(item.time, timezone, { hour: 'numeric', hour12: true });

          return (
            <div
              key={`hourly-${item.time}-${idx}`}
              style={{
                flex: '0 0 100px',
                scrollSnapAlign: 'start',
                background: idx === 0 ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-glass)',
                border: idx === 0 ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 0.6rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.6rem',
                transition: 'transform var(--transition-fast)',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: idx === 0 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                {timeLabel}
              </span>

              <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WeatherIcon code={item.iconCode} size={28} />
              </div>

              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {formatTemperature(item.temp, unit)}
              </span>

              {/* Rain Probability / Precip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: item.pop >= 20 ? '#38bdf8' : 'var(--text-muted)' }}>
                <Umbrella size={12} />
                <span>{item.pop}%</span>
              </div>

              {/* Wind */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <Wind size={11} />
                <span>{formatWindSpeed(item.windSpeed)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
