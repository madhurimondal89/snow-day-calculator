'use client';

import React from 'react';
import { Calendar, Umbrella, Wind } from 'lucide-react';
import { DailyForecastItem } from '@/lib/weather/types/weather';
import { WeatherIcon } from './WeatherIcon';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';
import { formatTemperature, formatWindSpeed } from '@/lib/weather/utils';

interface DailyForecastCardProps {
  daily: DailyForecastItem[];
}

export const DailyForecastCard: React.FC<DailyForecastCardProps> = ({ daily }) => {
  const { unit } = useWeatherPreferences();

  if (!daily || daily.length === 0) return null;

  // Find min & max across the entire 7-day period to normalize temperature bars
  const allLows = daily.map((d) => d.low);
  const allHighs = daily.map((d) => d.high);
  const minTemp = Math.min(...allLows);
  const maxTemp = Math.max(...allHighs);
  const tempRange = Math.max(maxTemp - minTemp, 1);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} style={{ color: 'var(--accent-primary)' }} /> 7-Day Extended Forecast
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Highs & Lows</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {daily.map((day, idx) => {
          const leftPercent = Math.max(0, ((day.low - minTemp) / tempRange) * 100);
          const widthPercent = Math.max(12, ((day.high - day.low) / tempRange) * 100);

          return (
            <div
              key={`daily-${day.date}-${idx}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 140px 1fr 110px',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                background: idx === 0 ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
              }}
              className="daily-row"
            >
              {/* Day Label */}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {idx === 0 ? 'Today' : day.dayName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{day.date.slice(5)}</div>
              </div>

              {/* Icon & Condition */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <WeatherIcon code={day.iconCode} size={26} />
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {day.condition}
                </span>
              </div>

              {/* Temperature Range Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>
                  {formatTemperature(day.low, unit)}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: '6px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-full)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      height: '100%',
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(to right, #38bdf8, #f59e0b)',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '32px' }}>
                  {formatTemperature(day.high, unit)}
                </span>
              </div>

              {/* Rain & Wind Details */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: day.pop >= 20 ? '#38bdf8' : 'var(--text-muted)' }}>
                  <Umbrella size={13} />
                  <span>{day.pop}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Wind size={12} />
                  <span>{formatWindSpeed(day.windSpeed)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @media (max-width: 680px) {
          .daily-row {
            grid-template-columns: 80px 1fr 90px !important;
          }
          .daily-row > div:nth-child(2) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
