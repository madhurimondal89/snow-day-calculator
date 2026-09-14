import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Snowflake, ChevronRight, Home, CloudSnow, MapPin } from 'lucide-react';
import { SnowDayCalculatorView } from '@/components/snow-day/SnowDayCalculatorView';
import { weatherService } from '@/lib/weather/service';
import { SnowDayPredictionEngine } from '@/lib/snow-day/engine';
import { LocationInfo } from '@/lib/weather/types/weather';
import { SNOW_BELT_CITIES } from '@/lib/location/cities';

export const revalidate = 900;

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.snowdaycalculatorfree.com').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Snow Day Calculator — Free Snow Day Predictor',
  description:
    'Calculate your estimated snow day probability using snowfall accumulation, morning commute temperatures, freezing rain hazards, and winter weather forecasts.',
  keywords: [
    'snow day calculator',
    'free snow day calculator',
    'school closure calculator',
    'will tomorrow be a snow day',
    'snow day predictor',
    'snow day probability',
    'school snow day forecast',
    'winter weather prediction',
  ],
  alternates: {
    canonical: `${siteUrl}/snow-day-calculator`,
  },
  openGraph: {
    title: 'Snow Day Calculator — Free Snow Day Predictor',
    description:
      'Calculate your estimated snow day probability using snowfall accumulation, morning commute temperatures, freezing rain hazards, and winter weather forecasts.',
    url: `${siteUrl}/snow-day-calculator`,
    siteName: 'Snow Day Calculator Free',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Snow Day Calculator — Free Snow Day Predictor',
    description: 'Calculate your snow day probability based on real-time winter weather forecasts.',
  },
};

const DEFAULT_LOCATION: LocationInfo = {
  name: 'New York',
  region: 'New York',
  country: 'United States',
  countryCode: 'US',
  lat: 40.7128,
  lon: -74.006,
  timezone: 'America/New_York',
  slug: 'new-york',
};

export default async function SnowDayCalculatorMainPage() {
  let initialPrediction = null;
  try {
    const weatherData = await weatherService.getWeather(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      DEFAULT_LOCATION
    );
    initialPrediction = SnowDayPredictionEngine.calculate(weatherData);
  } catch (err) {
    console.error('[SnowDayCalculatorMainPage] SSR error:', err);
  }

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
        name: 'Snow Day Calculator',
        item: `${siteUrl}/snow-day-calculator`,
      },
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Snow Day Calculator',
    applicationCategory: 'WeatherApplication',
    operatingSystem: 'All',
    url: `${siteUrl}/snow-day-calculator`,
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
  };

  // Group cities by region
  const northeast = SNOW_BELT_CITIES.filter((c) =>
    ['New York', 'Massachusetts', 'Connecticut', 'Rhode Island', 'Pennsylvania', 'New Jersey', 'Maryland', 'District of Columbia'].includes(c.region || '')
  );
  const midwest = SNOW_BELT_CITIES.filter((c) =>
    ['Illinois', 'Michigan', 'Minnesota', 'Ohio', 'Wisconsin', 'Indiana', 'Missouri', 'Nebraska', 'Iowa', 'North Dakota', 'South Dakota'].includes(c.region || '')
  );
  const mountainWest = SNOW_BELT_CITIES.filter((c) =>
    ['Colorado', 'Utah', 'Idaho', 'Washington', 'Oregon', 'Alaska'].includes(c.region || '')
  );
  const canada = SNOW_BELT_CITIES.filter((c) => c.countryCode === 'CA');
  const europeIntl = SNOW_BELT_CITIES.filter((c) => !['US', 'CA'].includes(c.countryCode || ''));

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
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
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Snow Day Calculator</span>
      </nav>

      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem auto' }}>
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
          <Snowflake size={14} color="#38bdf8" />
          <span>Winter Forecast Analysis Engine</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '0.75rem',
          }}
        >
          Snow Day Calculator
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)', lineHeight: 1.6 }}>
          Calculate your estimated snow day probability using snowfall accumulation, morning commute temperatures, freezing rain hazards, and winter storm wind gusts.
        </p>
      </div>

      <SnowDayCalculatorView
        initialLocation={DEFAULT_LOCATION}
        initialPrediction={initialPrediction}
      />

      {/* Regional Snow Day Calculator Directory */}
      <section style={{ marginTop: '4.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CloudSnow size={24} style={{ color: 'var(--accent-primary)' }} /> Snow Day Calculators by Region
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Select your city or district to view localized school closing probabilities and winter road safety models
          </p>
        </div>

        {/* Northeast */}
        {northeast.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--accent-primary)' }}>
              US Northeast & Mid-Atlantic
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {northeast.map((city) => (
                <Link key={city.slug} href={`/snow-day-calculator/${city.slug}`} className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{city.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{city.region}</div>
                  </div>
                  <Snowflake size={14} style={{ color: 'var(--accent-primary)' }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Midwest */}
        {midwest.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--accent-primary)' }}>
              US Midwest & Great Lakes
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {midwest.map((city) => (
                <Link key={city.slug} href={`/snow-day-calculator/${city.slug}`} className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{city.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{city.region}</div>
                  </div>
                  <Snowflake size={14} style={{ color: 'var(--accent-primary)' }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mountain West & Pacific */}
        {mountainWest.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--accent-primary)' }}>
              US Mountain West & Northwest
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {mountainWest.map((city) => (
                <Link key={city.slug} href={`/snow-day-calculator/${city.slug}`} className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{city.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{city.region}</div>
                  </div>
                  <Snowflake size={14} style={{ color: 'var(--accent-primary)' }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Canada */}
        {canada.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--accent-primary)' }}>
              Canada
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {canada.map((city) => (
                <Link key={city.slug} href={`/snow-day-calculator/${city.slug}`} className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{city.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{city.region}, CA</div>
                  </div>
                  <Snowflake size={14} style={{ color: 'var(--accent-primary)' }} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Europe & International */}
        {europeIntl.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--accent-primary)' }}>
              UK, Europe & International
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {europeIntl.map((city) => (
                <Link key={city.slug} href={`/snow-day-calculator/${city.slug}`} className="glass-card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{city.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{city.country}</div>
                  </div>
                  <Snowflake size={14} style={{ color: 'var(--accent-primary)' }} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

