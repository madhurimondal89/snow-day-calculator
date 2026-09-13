'use client';

import React from 'react';
import { Clock, Snowflake, ShieldAlert, Sparkles } from 'lucide-react';
import { WeatherData } from '@/lib/weather/types/weather';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';
import { formatTemperature } from '@/lib/weather/utils';
import { WeatherIcon } from '../weather/WeatherIcon';

interface SnowDayTimelineProps {
  weather: WeatherData;
  targetDateStr?: string;
}

export const SnowDayTimeline: React.FC<SnowDayTimelineProps> = ({ weather }) => {
  const { unit } = useWeatherPreferences();
  const isImperial = unit === 'f';

  const hourly = weather.hourly?.slice(0, 24) || [];
  if (hourly.length === 0) return null;

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            Hourly Winter Weather Timeline
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-glass)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
          Overnight & Morning Commute Focus
        </span>
      </div>

      <div
        className="custom-scrollbar"
        style={{
          display: 'flex',
          gap: '0.75rem',
          overflowX: 'auto',
          paddingTop: '0.5rem',
          paddingBottom: '0.75rem',
        }}
      >
        {hourly.map((h, idx) => {
          const date = new Date(h.time);
          const hour = date.getHours();
          const hourLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
          const isCommute = hour >= 6 && hour <= 9;
          const isOvernight = hour >= 22 || hour < 6;

          const isSnow =
            h.iconCode === 'snow' ||
            h.iconCode === 'heavy_snow' ||
            (h.condition || '').toLowerCase().includes('snow');

          const isIce =
            h.iconCode === 'sleet' ||
            (h.condition || '').toLowerCase().includes('ice') ||
            (h.condition || '').toLowerCase().includes('freezing rain');

          // Liquid to snow conversion
          const ratio = h.temp <= -5 ? 1.4 : h.temp <= 0 ? 1.1 : 0.8;
          const snowCm = isSnow && h.precip > 0 ? Number((h.precip * ratio).toFixed(1)) : 0;
          const snowText = isImperial ? `${(snowCm / 2.54).toFixed(1)}"` : `${snowCm}cm`;

          let cardBorder = '1px solid var(--border-color)';
          let cardBg = 'var(--bg-glass)';

          if (isCommute) {
            cardBorder = '1.5px solid rgba(56, 189, 248, 0.6)';
            cardBg = 'rgba(56, 189, 248, 0.08)';
          }

          return (
            <div
              key={idx}
              style={{
                minWidth: '110px',
                padding: '0.85rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                background: cardBg,
                border: cardBorder,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                flexShrink: 0,
                position: 'relative',
                boxShadow: isCommute ? '0 0 12px rgba(56, 189, 248, 0.12)' : 'none',
              }}
            >
              {isCommute ? (
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    color: '#0284c7',
                    background: 'rgba(56, 189, 248, 0.16)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '0.35rem',
                    display: 'inline-block',
                  }}
                >
                  Commute
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    color: 'transparent',
                    padding: '2px 8px',
                    marginBottom: '0.35rem',
                    userSelect: 'none',
                    display: 'inline-block',
                  }}
                >
                  &nbsp;
                </span>
              )}

              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {hourLabel}
              </span>

              <div style={{ margin: '0.4rem 0' }}>
                <WeatherIcon code={h.iconCode} size={28} />
              </div>

              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatTemperature(h.temp, unit)}
              </span>

              {/* Snowfall Badge or Precip Chance */}
              {isSnow && snowCm > 0 ? (
                <div
                  style={{
                    marginTop: '0.4rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <Snowflake size={11} /> {snowText}
                </div>
              ) : isIce ? (
                <div
                  style={{
                    marginTop: '0.4rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <ShieldAlert size={11} /> Ice Risk
                </div>
              ) : (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 500 }}>
                  {h.pop > 0 ? `${h.pop}% precip` : 'Dry'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
