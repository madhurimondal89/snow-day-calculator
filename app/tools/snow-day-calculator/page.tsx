import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Snowflake, ChevronRight, Home, ShieldCheck, Sparkles } from 'lucide-react';
import { SnowDayCalculatorView } from '@/components/snow-day/SnowDayCalculatorView';
import { weatherService } from '@/lib/weather/service';
import { SnowDayPredictionEngine } from '@/lib/snow-day/engine';
import { LocationInfo } from '@/lib/weather/types/weather';

export const revalidate = 900; // 15 minutes ISR

export const metadata: Metadata = {
  title: 'Snow Day Calculator — Snow Day Probability & Predictor | Weather Hub',
  description:
    'Calculate your estimated snow day probability using snowfall, temperature, ice, wind and winter weather forecasts. Real-time deterministic meteorological analysis.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://weatherhub.example.com'}/tools/snow-day-calculator`,
  },
  openGraph: {
    title: 'Snow Day Calculator — Snow Day Probability & Predictor | Weather Hub',
    description:
      'Calculate your estimated snow day probability using snowfall, temperature, ice, wind and winter weather forecasts.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://weatherhub.example.com'}/tools/snow-day-calculator`,
    siteName: 'Weather Hub',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Snow Day Calculator — Snow Day Probability & Predictor',
    description:
      'Estimate snow day cancellation probability using real-time snowfall accumulation, morning temperatures, ice risk and wind speeds.',
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

export default async function SnowDayCalculatorPage() {
  let initialPrediction = null;
  try {
    const weatherData = await weatherService.getWeather(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      DEFAULT_LOCATION
    );
    initialPrediction = SnowDayPredictionEngine.calculate(weatherData);
  } catch (err) {
    console.error('[SnowDayPage] Failed initial SSR fetch:', err);
  }

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Snow Day Calculator',
    operatingSystem: 'All',
    applicationCategory: 'WeatherApplication',
    description:
      'Calculate the estimated probability of a school closure or snow day using real-time snowfall accumulation, temperature, ice hazard, and wind forecast data.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://weatherhub.example.com'}/tools/snow-day-calculator`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: process.env.NEXT_PUBLIC_SITE_URL || 'https://weatherhub.example.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://weatherhub.example.com'}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Snow Day Calculator',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://weatherhub.example.com'}/tools/snow-day-calculator`,
      },
    ],
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
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
        <span>Tools</span>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Snow Day Calculator</span>
      </nav>

      {/* Hero Header */}
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
          <span>Winter Weather Probability Engine</span>
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
          Estimate your chance of a snow day using snowfall accumulation, morning commute temperatures, freezing rain hazards, and winter storm wind gusts.
        </p>
      </div>

      {/* Main Interactive Tool */}
      <SnowDayCalculatorView
        initialLocation={DEFAULT_LOCATION}
        initialPrediction={initialPrediction}
      />
    </div>
  );
}
