import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Snowflake, ChevronRight, Home, CloudSnow, MapPin, ArrowRight } from 'lucide-react';
import { WeatherMapLazy } from '@/components/map/WeatherMapLazy';
import { POPULAR_CITIES } from '@/lib/location/cities';

export const revalidate = 900;

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.snowdaycalculatorfree.com').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Snow Forecast — Snowfall & Winter Weather Forecast',
  description:
    'Real-time snow forecast, snowfall accumulation maps, precipitation radar, and winter storm projections powered by open meteorological data.',
  alternates: {
    canonical: `${siteUrl}/snow-forecast`,
  },
  openGraph: {
    title: 'Snow Forecast — Snowfall & Winter Weather Forecast',
    description:
      'Real-time snow forecast, snowfall accumulation maps, precipitation radar, and winter storm projections powered by open meteorological data.',
    url: `${siteUrl}/snow-forecast`,
    siteName: 'Snow Day Calculator Free',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Snow Forecast — Snowfall & Winter Weather Forecast',
    description: 'Real-time snow forecast and snowfall accumulation maps.',
  },
};

const TOP_WINTER_HUBS = POPULAR_CITIES.filter((c) =>
  ['new-york', 'chicago', 'london', 'toronto', 'oslo', 'helsinki', 'stockholm', 'tokyo'].includes(c.slug)
);

export default function SnowForecastPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Snow Forecast',
        item: `${siteUrl}/snow-forecast`,
      },
    ],
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Breadcrumb Navigation */}
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
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Snow Forecast</span>
      </nav>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CloudSnow size={30} style={{ color: 'var(--accent-primary)' }} /> Winter Snow Forecast & Live Radar
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem', maxWidth: '750px' }}>
          Interactive snowfall accumulation maps, forecast precipitation overlays, and temperature heatmaps tracking upcoming winter storm trajectories.
        </p>
      </div>

      {/* Interactive Map */}
      <WeatherMapLazy height="600px" defaultLayer="precipitation" />

      {/* Snow Day Hubs Directory */}
      <div style={{ marginTop: '3.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Major Winter Forecast Hubs
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {TOP_WINTER_HUBS.map((c) => (
            <Link
              key={c.slug}
              href={`/snow-day-calculator/${c.slug}`}
              className="glass-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.region}, {c.country}</div>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Calculate →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
