import React from 'react';
import { Metadata } from 'next';
import { Layers, Info, ShieldCheck } from 'lucide-react';
import { WeatherMapLazy } from '@/components/map/WeatherMapLazy';

export const metadata: Metadata = {
  title: 'Interactive Weather Map & Live Radar | Weather Hub',
  description:
    'Explore global forecast precipitation, temperature heatmaps, wind speed vectors, cloud cover, and AQI air quality on our interactive high-resolution weather map.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://weatherhub.example.com'}/weather-map`,
  },
};

export default function WeatherMapPage() {
  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Layers size={28} style={{ color: 'var(--accent-primary)' }} /> Live Weather Map & Forecast Radar
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
          Real-time interactive weather visualization. Toggle layers for forecast precipitation, temperature, wind vectors, clouds, and air quality. Click anywhere on the map to inspect localized meteorological data.
        </p>
      </div>

      {/* Main Full Height Map */}
      <WeatherMapLazy height="680px" initialZoom={4} />

      {/* Map Information & Data Compliance Notice */}
      <div
        className="glass-panel"
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <Info size={16} style={{ color: 'var(--accent-primary)' }} /> Layer Information & Integrity
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            All precipitation visualizations represent simulated numerical forecast accumulation models. We transparently label this as <strong>Forecast Precipitation</strong> rather than claiming instantaneous raw military radar where open real-time radar data streams are unavailable.
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={16} style={{ color: 'var(--brand-emerald)' }} /> Map Source Attribution
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Vector tile geometries rendered via <strong>OpenFreeMap</strong> based on cartographic contributions by <strong>OpenStreetMap</strong> contributors. Meteorological models supplied by <strong>MET Norway</strong> and <strong>Open-Meteo</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
