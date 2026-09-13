'use client';

import React from 'react';
import { Wind, ShieldAlert, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { AirQualityData } from '@/lib/weather/types/weather';

interface AirQualityCardProps {
  airQuality?: AirQualityData;
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({ airQuality }) => {
  if (!airQuality) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Wind size={18} style={{ color: 'var(--accent-primary)' }} /> Air Quality Index (AQI)
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Air quality station data is currently unavailable for this specific coordinate.
        </p>
      </div>
    );
  }

  const { aqi, aqiStandard, label, colorCode, description, advisory, pm2_5, pm10, o3, no2, so2, co } = airQuality;

  const getStatusIcon = () => {
    switch (airQuality.level) {
      case 'good':
        return <CheckCircle2 size={24} color={colorCode} />;
      case 'moderate':
      case 'unhealthy_sensitive':
        return <AlertTriangle size={24} color={colorCode} />;
      case 'unhealthy':
      case 'very_unhealthy':
      case 'hazardous':
      default:
        return <AlertOctagon size={24} color={colorCode} />;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wind size={18} style={{ color: 'var(--accent-primary)' }} /> Air Quality Index
        </h2>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
          }}
        >
          Standard: {aqiStandard}
        </span>
      </div>

      {/* Main AQI Score & Advisory */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.25rem',
            background: 'var(--bg-glass)',
            border: `1px solid ${colorCode}40`,
            borderRadius: 'var(--radius-md)',
          }}
        >
          {getStatusIcon()}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: colorCode, lineHeight: 1 }}>
                {aqi}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {label}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {description}
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '1.25rem',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
            <ShieldAlert size={14} style={{ color: 'var(--accent-primary)' }} /> Health Advisory
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {advisory}
          </p>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            *General public health guidance based on ambient atmospheric concentration. Not medical advice.
          </div>
        </div>
      </div>

      {/* Pollutant Breakdown Matrix */}
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Pollutant Concentrations (µg/m³)
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {pm2_5 !== undefined && (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PM2.5 (Fine)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{pm2_5}</div>
            </div>
          )}
          {pm10 !== undefined && (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PM10 (Coarse)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{pm10}</div>
            </div>
          )}
          {o3 !== undefined && (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ozone (O₃)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{o3}</div>
            </div>
          )}
          {no2 !== undefined && (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nitrogen (NO₂)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{no2}</div>
            </div>
          )}
          {so2 !== undefined && (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sulphur (SO₂)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{so2}</div>
            </div>
          )}
          {co !== undefined && (
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carbon (CO)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>{co}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
