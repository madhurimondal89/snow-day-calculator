'use client';

import React from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  Cloud,
  Eye,
  Sun,
  CloudRain,
  Activity,
} from 'lucide-react';
import { CurrentWeather } from '@/lib/weather/types/weather';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';
import { formatTemperature, formatWindSpeed, getWindDirectionLabel, getUvCategory } from '@/lib/weather/utils';

interface WeatherDetailsGridProps {
  current: CurrentWeather;
}

export const WeatherDetailsGrid: React.FC<WeatherDetailsGridProps> = ({ current }) => {
  const { unit } = useWeatherPreferences();
  const uvCategory = getUvCategory(current.uvIndex);

  const metrics = [
    {
      icon: <Thermometer size={18} style={{ color: '#f43f5e' }} />,
      label: 'RealFeel® Temperature',
      value: formatTemperature(current.feelsLike, unit),
      subtext: Math.abs(current.feelsLike - current.temp) >= 2
        ? `Differs from actual (${formatTemperature(current.temp, unit)}) due to humidity and wind`
        : 'Feels close to actual air temperature',
    },
    {
      icon: <Droplets size={18} style={{ color: '#38bdf8' }} />,
      label: 'Humidity & Dew Point',
      value: `${current.humidity}%`,
      subtext: current.dewPoint !== undefined
        ? `Dew point: ${formatTemperature(current.dewPoint, unit)}`
        : 'Relative atmospheric moisture level',
    },
    {
      icon: <Wind size={18} style={{ color: '#06b6d4' }} />,
      label: 'Wind & Gusts',
      value: formatWindSpeed(current.windSpeed),
      subtext: `${getWindDirectionLabel(current.windDirection)} (${current.windDirection}°)${
        current.windGust ? ` • Gusts up to ${formatWindSpeed(current.windGust)}` : ''
      }`,
    },
    {
      icon: <Compass size={18} style={{ color: '#a855f7' }} />,
      label: 'Atmospheric Pressure',
      value: `${current.pressure} hPa`,
      subtext: current.pressure > 1013 ? 'High pressure (Fair weather tendencies)' : 'Low pressure system',
    },
    {
      icon: <Sun size={18} style={{ color: '#f59e0b' }} />,
      label: 'UV Index',
      value: `${current.uvIndex} (${uvCategory.label})`,
      subtext: current.uvIndex >= 6 ? 'Sun protection recommended during midday' : 'Minimal UV solar hazard',
    },
    {
      icon: <Cloud size={18} style={{ color: '#94a3b8' }} />,
      label: 'Cloud Cover',
      value: `${current.cloudCover}%`,
      subtext: current.cloudCover < 20 ? 'Clear blue skies' : current.cloudCover < 70 ? 'Partly cloudy' : 'Overcast sky',
    },
    {
      icon: <CloudRain size={18} style={{ color: '#60a5fa' }} />,
      label: 'Precipitation (Last Hr)',
      value: `${current.precipitation} mm`,
      subtext: current.precipitation > 0 ? 'Active rainfall recorded' : 'No recent liquid accumulation',
    },
    {
      icon: <Eye size={18} style={{ color: '#10b981' }} />,
      label: 'Visibility',
      value: current.visibility !== undefined ? `${current.visibility} km` : '> 10 km',
      subtext: 'Horizontal optical clarity',
    },
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Activity size={18} style={{ color: 'var(--accent-primary)' }} /> Comprehensive Weather Metrics
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {metrics.map((m, idx) => (
          <div
            key={`metric-${idx}`}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {m.icon}
              <span>{m.label}</span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {m.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {m.subtext}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
