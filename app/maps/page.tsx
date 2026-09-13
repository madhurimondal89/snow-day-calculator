import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Layers, ChevronRight, Home, Info, ShieldCheck } from 'lucide-react';
import { WeatherMapLazy } from '@/components/map/WeatherMapLazy';

export const metadata: Metadata = {
  title: 'Interactive Weather Maps & Live Radar | Snow Day Calculator Free',
  description:
    'Explore global forecast precipitation, snowfall accumulation, temperature heatmaps, and wind speed vectors on our interactive high-resolution weather map.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://snowdaycalculatorfree.com'}/maps`,
  },
};

export default function MapsPage() {
  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Home size={13} /> <span>Home</span>
        </Link>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Maps & Radar</span>
      </nav>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Layers size={28} style={{ color: 'var(--accent-primary)' }} /> Live Weather Map & Forecast Radar
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
          Real-time interactive weather visualization. Toggle layers for forecast precipitation, snowfall accumulation, temperature heatmaps, wind vectors, and air quality.
        </p>
      </div>

      <WeatherMapLazy height="680px" initialZoom={4} />

      {/* Map Attribution & Information */}
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
            All precipitation visualizations represent simulated numerical forecast accumulation models. We transparently label this as <strong>Forecast Precipitation</strong> rather than claiming instantaneous raw military radar.
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={16} style={{ color: 'var(--brand-emerald)' }} /> Map Source Attribution
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Vector tile geometries rendered via <strong>OpenStreetMap</strong> and <strong>ESRI Canvas</strong> basemaps. Meteorological models supplied by <strong>NOAA</strong>, <strong>MET Norway</strong>, and open national meteorological services.
          </p>
        </div>
      </div>
    </div>
  );
}
