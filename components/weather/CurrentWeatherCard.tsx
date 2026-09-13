'use client';

import React from 'react';
import { Star, Wind, Droplets, Compass, Sun, Clock } from 'lucide-react';
import { WeatherData } from '@/lib/weather/types/weather';
import { WeatherIcon } from './WeatherIcon';
import { DataSourceAttribution } from './DataSourceAttribution';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';
import { formatTemperature, formatWindSpeed, getWindDirectionLabel, formatLocalTime } from '@/lib/weather/utils';

interface CurrentWeatherCardProps {
  data: WeatherData;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ data }) => {
  const { unit, isFavorite, addFavorite, removeFavorite } = useWeatherPreferences();
  const { current, location, daily, metadata } = data;

  const fav = isFavorite(location.slug || location.name);
  const todayDaily = daily?.[0];

  const handleToggleFavorite = () => {
    if (fav) {
      removeFavorite(location.slug || location.name);
    } else {
      addFavorite(location);
    }
  };

  const localTimeStr = formatLocalTime(current.time, location.timezone);

  return (
    <div
      className="glass-panel"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '2rem',
        background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(30, 58, 138, 0.15) 100%)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Background glow decoration */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
          borderRadius: '50%',
        }}
      />

      {/* Header Row: Location Title & Action */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              {location.name}
            </h1>
            {location.countryCode && (
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-color)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {location.countryCode}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span>{[location.region, location.country].filter(Boolean).join(', ')}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} /> Local Time: {localTimeStr}
            </span>
          </div>
        </div>

        {/* Favorite Toggle Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            background: fav ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-glass)',
            border: fav ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
            color: fav ? '#f59e0b' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all var(--transition-fast)',
          }}
        >
          <Star size={16} fill={fav ? '#f59e0b' : 'none'} color={fav ? '#f59e0b' : 'currentColor'} />
          <span>{fav ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Main Temp & Condition Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WeatherIcon code={current.iconCode} size={68} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '4.5rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                }}
              >
                {formatTemperature(current.temp, unit)}
              </span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              {current.condition}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Feels like {formatTemperature(current.feelsLike, unit)}
              {todayDaily && ` • High: ${formatTemperature(todayDaily.high, unit)} / Low: ${formatTemperature(todayDaily.low, unit)}`}
            </div>
          </div>
        </div>

        {/* Quick Highlights Pill Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <Wind size={15} style={{ color: '#38bdf8' }} /> Wind
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              {formatWindSpeed(current.windSpeed)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {getWindDirectionLabel(current.windDirection)} ({current.windDirection}°)
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <Droplets size={15} style={{ color: '#60a5fa' }} /> Humidity
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              {current.humidity}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {current.dewPoint !== undefined ? `Dew point ${formatTemperature(current.dewPoint, unit)}` : 'Normal'}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <Sun size={15} style={{ color: '#fbbf24' }} /> UV Index
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              {current.uvIndex}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {current.uvIndex >= 6 ? 'Protection needed' : 'Safe / Low'}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <Compass size={15} style={{ color: '#a78bfa' }} /> Pressure
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              {current.pressure} hPa
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {current.precipitation > 0 ? `${current.precipitation} mm rain` : 'Stable'}
            </div>
          </div>
        </div>
      </div>

      {/* Provider Attribution Banner */}
      <DataSourceAttribution metadata={metadata} />
    </div>
  );
};
