'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, ExternalLink, RefreshCw, Cpu } from 'lucide-react';
import { WeatherMetadata } from '@/lib/weather/types/weather';

interface DataSourceAttributionProps {
  metadata: WeatherMetadata;
  className?: string;
}

export const DataSourceAttribution: React.FC<DataSourceAttributionProps> = ({ metadata, className = '' }) => {
  const { providerName, attributionText, attributionUrl, isFallback, fallbackFrom, isStale, staleCachedAt, debugInfo } = metadata;

  return (
    <div
      className={`data-source-attribution ${className}`}
      style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1rem',
        marginTop: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}
    >
      {/* Stale Cache Notice Banner */}
      {isStale && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#f59e0b',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
        >
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span>
            Offline fallback: Showing cached weather recorded at{' '}
            {staleCachedAt ? new Date(staleCachedAt).toLocaleTimeString() : 'recently'}. Live provider queries are currently undergoing automated recovery.
          </span>
        </div>
      )}

      {/* Fallback Switch Notice */}
      {isFallback && !isStale && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--brand-cyan)',
            fontSize: '0.75rem',
          }}
        >
          <RefreshCw size={13} />
          <span>
            Weather data source automatically routed to {providerName}{' '}
            {fallbackFrom ? `(primary ${fallbackFrom} timed out)` : ''}.
          </span>
        </div>
      )}

      {/* Main Attribution Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} style={{ color: 'var(--brand-emerald)' }} />
          <span>
            Meteorological Data:{' '}
            <a
              href={attributionUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-primary)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
            >
              {attributionText || providerName} <ExternalLink size={11} />
            </a>
          </span>
        </div>

        {/* Debug Info Pill (if present) */}
        {debugInfo && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              fontSize: '0.7rem',
              color: '#38bdf8',
            }}
          >
            <Cpu size={12} />
            <span>
              {debugInfo.selectedProvider} • {debugInfo.latencyMs}ms • {debugInfo.cacheHit ? 'Cache HIT' : 'Live'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
