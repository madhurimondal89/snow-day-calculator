import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Snowflake,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Calendar,
  CloudSnow,
} from 'lucide-react';
import { SnowDayCalculatorView } from '@/components/snow-day/SnowDayCalculatorView';
import { weatherService } from '@/lib/weather/service';
import { SnowDayPredictionEngine } from '@/lib/snow-day/engine';
import { POPULAR_CITIES, SNOW_BELT_CITIES } from '@/lib/location/cities';
import { LocationInfo } from '@/lib/weather/types/weather';

export const revalidate = 900; // 15 minutes ISR

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.snowdaycalculatorfree.com').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Free Snow Day Calculator — Snow Day Predictor',
  description:
    'Calculate your snow day probability using snowfall, temperature, ice, wind and winter weather forecasts. Free Snow Day Calculator and Snow Day Predictor.',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Free Snow Day Calculator — Snow Day Predictor',
    description:
      'Calculate your snow day probability using snowfall, temperature, ice, wind and winter weather forecasts. Free Snow Day Calculator and Snow Day Predictor.',
    url: siteUrl,
    siteName: 'Snow Day Calculator Free',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Snow Day Calculator — Snow Day Predictor',
    description:
      'Calculate your snow day probability using snowfall, temperature, ice, wind and winter weather forecasts. Free Snow Day Calculator and Snow Day Predictor.',
  },
};

const DEFAULT_HOMEPAGE_LOCATION: LocationInfo = {
  name: 'New York',
  region: 'New York',
  country: 'United States',
  countryCode: 'US',
  lat: 40.7128,
  lon: -74.006,
  timezone: 'America/New_York',
  slug: 'new-york',
};

export default async function HomePage() {
  let initialPrediction = null;
  try {
    const weatherData = await weatherService.getWeather(
      DEFAULT_HOMEPAGE_LOCATION.lat,
      DEFAULT_HOMEPAGE_LOCATION.lon,
      DEFAULT_HOMEPAGE_LOCATION
    );
    initialPrediction = SnowDayPredictionEngine.calculate(weatherData);
  } catch (err) {
    console.error('[HomePage] Failed initial SSR fetch:', err);
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Snow Day Calculator Free',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/snow-day-calculator/{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Free Snow Day Calculator',
    operatingSystem: 'All',
    applicationCategory: 'WeatherApplication',
    description:
      'Instant snow day prediction and school closure probability calculator powered by real-time meteorological models.',
    url: siteUrl,
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
  };

  // Group cities by regions
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
    <div style={{ paddingBottom: '4rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      {/* 1. Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '3.5rem 0 2.5rem 0',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--accent-primary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Snowflake size={15} color="#38bdf8" />
            <span>Real-Time Winter Weather Prediction Engine</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              marginBottom: '0.75rem',
            }}
          >
            Free Snow Day Calculator
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              fontWeight: 700,
              color: 'var(--accent-primary)',
              marginBottom: '1rem',
            }}
          >
            Will Tomorrow Be a Snow Day?
          </p>

          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '680px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Enter your city, ZIP code or postal code to calculate your estimated snow day probability based on snowfall accumulation, morning commute temperatures, freezing rain hazards, and winter storm wind gusts.
          </p>
        </div>
      </section>

      {/* 2. Main Interactive Calculator Experience (Above the Fold / Centerpiece) */}
      <section className="container" style={{ marginTop: '2.5rem' }}>
        <SnowDayCalculatorView
          initialLocation={DEFAULT_HOMEPAGE_LOCATION}
          initialPrediction={initialPrediction}
          showExtendedGuides={true}
        />
      </section>

      {/* 3. Snow Day Calculator by City Directory (Categorized by Region) */}
      <section className="container" style={{ marginTop: '4.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CloudSnow size={24} style={{ color: 'var(--accent-primary)' }} /> Snow Day Calculator by Region
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Instant localized snow day probability reports and school cancellation predictors across major metropolitan districts
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

        {/* Mountain West */}
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

        {/* International */}
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

      {/* 4. Secondary Supporting Weather Tools */}
      <section className="container" style={{ marginTop: '4.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem auto' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Supporting Meteorological Ecosystem
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.2rem' }}>
            Explore Full Weather Intelligence
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            The Snow Day Calculator is powered by high-resolution global numerical weather prediction models.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <Link href="/weather" className="glass-card" style={{ padding: '1.75rem', display: 'block' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Compass size={22} color="#38bdf8" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>Global City Forecasts</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Comprehensive 7-day extended projections, 24-hour hourly temperatures, precipitation probabilities, and air quality analytics.
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem' }}>
              Browse Cities <ArrowRight size={13} />
            </span>
          </Link>

          <Link href="/weather-map" className="glass-card" style={{ padding: '1.75rem', display: 'block' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Layers size={22} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>Interactive Weather Maps</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Explore real-time high-resolution map overlays for forecast precipitation, snow, temperature vectors, and wind speed.
            </p>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem' }}>
              Open Live Radar <ArrowRight size={13} />
            </span>
          </Link>

          <Link href="/snow-day-predictor" className="glass-card" style={{ padding: '1.75rem', display: 'block' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Snowflake size={22} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>Snow Day Predictor Guide</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              In-depth breakdown of how municipal school cancellation decisions interact with road temperatures and plowing logistics.
            </p>
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.75rem' }}>
              Learn More <ArrowRight size={13} />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
