import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Snowflake, ChevronRight, Home } from 'lucide-react';
import { SnowDayCalculatorView } from '@/components/snow-day/SnowDayCalculatorView';
import { weatherService } from '@/lib/weather/service';
import { SnowDayPredictionEngine } from '@/lib/snow-day/engine';
import { LocationInfo } from '@/lib/weather/types/weather';

export const revalidate = 900;

export const metadata: Metadata = {
  title: 'Free Snow Day Calculator — Check Your Snow Day Probability',
  description:
    'Free Snow Day Calculator: Calculate your chance of a school snow day using real-time snowfall accumulation, morning commute temperatures, ice hazards, and wind forecasts.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://snowdaycalculatorfree.com'}/snow-day-calculator`,
  },
  openGraph: {
    title: 'Free Snow Day Calculator — Will Tomorrow Be a Snow Day?',
    description:
      'Estimate your chance of a snow day using snowfall, temperature, ice, wind, and winter weather forecasts.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://snowdaycalculatorfree.com'}/snow-day-calculator`,
    siteName: 'Snow Day Calculator Free',
    type: 'website',
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

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
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
    </div>
  );
}
