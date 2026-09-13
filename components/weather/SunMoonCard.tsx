'use client';

import React from 'react';
import { Sunrise, Sunset, Sun, Moon } from 'lucide-react';
import { CurrentWeather } from '@/lib/weather/types/weather';
import { formatLocalTime } from '@/lib/weather/utils';

interface SunMoonCardProps {
  current: CurrentWeather;
  timezone: string;
}

export const SunMoonCard: React.FC<SunMoonCardProps> = ({ current, timezone }) => {
  const sunriseTime = current.sunrise ? formatLocalTime(current.sunrise, timezone) : '06:00 AM';
  const sunsetTime = current.sunset ? formatLocalTime(current.sunset, timezone) : '06:30 PM';

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Sun size={18} style={{ color: '#f59e0b' }} /> Sun & Daylight
      </h2>

      {/* Daylight Arc Visual */}
      <div
        style={{
          position: 'relative',
          height: '90px',
          borderBottom: '2px dashed var(--border-color)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '0.5rem',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '180px',
            height: '90px',
            borderTopLeftRadius: '90px',
            borderTopRightRadius: '90px',
            border: '2px solid rgba(245, 158, 11, 0.3)',
            borderBottom: 'none',
            top: 0,
          }}
        />

        {/* Sun Icon Indicator on Arc */}
        <div
          style={{
            position: 'absolute',
            top: current.isDay ? '10px' : '45px',
            transform: 'translateX(-50%)',
            background: current.isDay ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
            border: `1px solid ${current.isDay ? '#f59e0b' : '#818cf8'}`,
            borderRadius: '50%',
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {current.isDay ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="#818cf8" />}
        </div>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {current.isDay ? 'Sun is currently above the horizon' : 'Night time (sun below horizon)'}
        </span>
      </div>

      {/* Sunrise & Sunset Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sunrise size={20} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sunrise</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{sunriseTime}</div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sunset size={20} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sunset</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{sunsetTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
