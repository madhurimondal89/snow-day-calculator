import React from 'react';
import { Metadata } from 'next';
import { Database, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Data Sources & Meteorological Attribution | Weather Hub',
  description:
    'Complete transparency and official attribution for MET Norway, Open-Meteo, OpenFreeMap, and OpenStreetMap data providers.',
};

export default function DataSourcesPage() {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem', maxWidth: '860px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <Database size={16} />
          <span>Open Meteorology & Mapping</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
          Data Sources & Attribution
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Weather Hub is built entirely on authorized, open-access meteorological models and cartography. We proudly adhere to all provider attribution terms, caching regulations, and rate limitations.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* MET Norway */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>MET Norway (api.met.no)</h2>
            <a
              href="https://api.met.no/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <span>api.met.no</span> <ExternalLink size={13} />
            </a>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            The Norwegian Meteorological Institute provides high-accuracy numerical weather predictions globally via the official <strong>Locationforecast 2.0</strong> API.
          </p>
          <div style={{ background: 'var(--bg-glass)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Compliance Note:</strong> Weather Hub communicates with MET Norway using a descriptive custom User-Agent identifying our domain and contact information, and respects all HTTP caching headers.
          </div>
        </div>

        {/* Open-Meteo */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Open-Meteo (open-meteo.com)</h2>
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <span>open-meteo.com</span> <ExternalLink size={13} />
            </a>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            Open-Meteo provides open-source weather forecasting, historical datasets, geocoding search, and Air Quality (AQI) API data under the <strong>Creative Commons Attribution 4.0 International (CC BY 4.0)</strong> license.
          </p>
          <div style={{ background: 'var(--bg-glass)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Attribution:</strong> Weather and air quality data powered by Open-Meteo.com.
          </div>
        </div>

        {/* OpenFreeMap & OpenStreetMap */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>OpenFreeMap & OpenStreetMap</h2>
            <a
              href="https://openfreemap.org/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <span>openfreemap.org</span> <ExternalLink size={13} />
            </a>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            Our interactive weather maps use vector map tiles hosted by <strong>OpenFreeMap</strong>, derived from cartographic geographic information contributed by <strong>OpenStreetMap</strong> under the Open Database License (ODbL).
          </p>
          <div style={{ background: 'var(--bg-glass)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Map Attribution:</strong> © <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a>, © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors.
          </div>
        </div>
      </div>
    </div>
  );
}
