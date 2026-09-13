'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Loader2, MapPin } from 'lucide-react';

const WeatherMapDynamic = dynamic(
  () => import('./WeatherMap').then((mod) => mod.WeatherMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="glass-panel"
        style={{
          width: '100%',
          height: '480px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: 'var(--text-muted)',
          background: 'var(--bg-card)',
        }}
      >
        <Loader2 size={32} className="animate-spin" color="var(--accent-primary)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
          <MapPin size={16} /> Loading interactive weather map...
        </div>
      </div>
    ),
  }
);

export const WeatherMapLazy: React.FC<React.ComponentProps<typeof WeatherMapDynamic>> = (props) => {
  return <WeatherMapDynamic {...props} />;
};
