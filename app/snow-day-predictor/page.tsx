import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Snowflake, ChevronRight, Home, Sparkles, ShieldCheck } from 'lucide-react';
import { SnowDayCalculatorView } from '@/components/snow-day/SnowDayCalculatorView';
import { weatherService } from '@/lib/weather/service';
import { SnowDayPredictionEngine } from '@/lib/snow-day/engine';
import { LocationInfo } from '@/lib/weather/types/weather';

export const revalidate = 900;

export const metadata: Metadata = {
  title: 'Snow Day Predictor — Predict School Closures & Winter Cancellations',
  description:
    'Use our Snow Day Predictor to calculate school cancellation risk using advanced winter meteorological models, overnight snow accumulation, and ice hazard detection.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://snowdaycalculatorfree.com'}/snow-day-predictor`,
  },
  openGraph: {
    title: 'Snow Day Predictor — Winter School Cancellation Estimate',
    description:
      'Predict your snow day probability using snowfall accumulation, morning commute temperatures, and road icing risks.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://snowdaycalculatorfree.com'}/snow-day-predictor`,
    siteName: 'Snow Day Calculator Free',
    type: 'website',
  },
};

const DEFAULT_LOCATION: LocationInfo = {
  name: 'Chicago',
  region: 'Illinois',
  country: 'United States',
  countryCode: 'US',
  lat: 41.8781,
  lon: -87.6298,
  timezone: 'America/Chicago',
  slug: 'chicago',
};

export default async function SnowDayPredictorPage() {
  let initialPrediction = null;
  try {
    const weatherData = await weatherService.getWeather(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      DEFAULT_LOCATION
    );
    initialPrediction = SnowDayPredictionEngine.calculate(weatherData);
  } catch (err) {
    console.error('[SnowDayPredictorPage] SSR error:', err);
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
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Snow Day Predictor</span>
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
            color: '#f59e0b',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          <Sparkles size={14} color="#f59e0b" />
          <span>School Closure Risk Prediction</span>
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
          Snow Day Predictor
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)', lineHeight: 1.6 }}>
          Analyze winter storm forecasts and commute timing to predict the probability that schools or offices may cancel schedules.
        </p>
      </div>

      <SnowDayCalculatorView
        initialLocation={DEFAULT_LOCATION}
        initialPrediction={initialPrediction}
      />
    </div>
  );
}
