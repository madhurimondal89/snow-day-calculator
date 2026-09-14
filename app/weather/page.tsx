import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Compass, ChevronRight, Home, Globe2, Layers, ArrowRight, Snowflake } from 'lucide-react';
import { POPULAR_CITIES } from '@/lib/location/cities';
import { SearchBar } from '@/components/weather/SearchBar';
import { weatherService } from '@/lib/weather/service';
import { formatTemperature } from '@/lib/weather/utils';
import { WeatherIcon } from '@/components/weather/WeatherIcon';

export const revalidate = 900;

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.snowdaycalculatorfree.com').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Weather Forecast — Current & Hourly Weather',
  description:
    'Accurate global weather forecasts, 7-day extended projections, hourly temperatures, precipitation probabilities, and air quality analytics.',
  alternates: {
    canonical: `${siteUrl}/weather`,
  },
  openGraph: {
    title: 'Weather Forecast — Current & Hourly Weather',
    description:
      'Accurate global weather forecasts, 7-day extended projections, hourly temperatures, precipitation probabilities, and air quality analytics.',
    url: `${siteUrl}/weather`,
    siteName: 'Snow Day Calculator Free',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weather Forecast — Current & Hourly Weather',
    description: 'Accurate global weather forecasts and hourly trends.',
  },
};

export default async function WeatherDirectoryPage() {
  const featuredCities = POPULAR_CITIES.slice(0, 6);
  const featuredWeatherPromises = featuredCities.map(async (c) => {
    try {
      const data = await weatherService.getWeather(c.lat, c.lon, c);
      return { city: c, data };
    } catch {
      return { city: c, data: null };
    }
  });

  const featuredResults = await Promise.all(featuredWeatherPromises);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      {/* Breadcrumbs */}
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
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Weather Forecasts</span>
      </nav>

      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            color: 'var(--accent-primary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          <Compass size={14} color="#38bdf8" />
          <span>Global Meteorological Directory</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
          City Weather Forecasts
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
          Live current conditions, 24-hour hourly projections, air quality ratings, and 7-day extended forecasts powering our Snow Day calculation engine.
        </p>

        <div style={{ maxWidth: '540px', margin: '1.5rem auto 0 auto' }}>
          <SearchBar placeholder="Search any city or location worldwide..." />
        </div>
      </div>

      {/* Featured Cities Snapshot */}
      <section style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Key Global Weather Hubs
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {featuredResults.map(({ city, data }) => {
            const temp = data ? formatTemperature(data.current.temp, 'c') : '--';
            const condition = data ? data.current.condition : 'Loading forecast...';
            const iconCode = data ? data.current.iconCode : 'partly_cloudy_day';

            return (
              <Link
                key={city.slug}
                href={`/weather/${city.slug}`}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '180px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{city.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {[city.region, city.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <WeatherIcon code={iconCode} size={36} />
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                      {temp}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {condition}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    Details →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Full City Directory */}
      <section style={{ marginTop: '3.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe2 size={20} style={{ color: 'var(--accent-primary)' }} /> Popular Cities Directory
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '0.85rem',
          }}
        >
          {POPULAR_CITIES.map((c) => (
            <Link
              key={c.slug}
              href={`/weather/${c.slug}`}
              className="glass-card"
              style={{
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.country}</div>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', background: 'var(--bg-glass)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                {c.countryCode}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
