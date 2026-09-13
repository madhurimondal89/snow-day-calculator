import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Snowflake, ChevronRight, Home, MapPin, Sparkles } from 'lucide-react';
import { SnowDayCalculatorView } from '@/components/snow-day/SnowDayCalculatorView';
import { weatherService } from '@/lib/weather/service';
import { resolveLocationFromSlug } from '@/lib/location/slugs';
import { SnowDayPredictionEngine } from '@/lib/snow-day/engine';

interface PageProps {
  params: {
    location: string;
  };
}

export const revalidate = 900; // 15 minutes ISR

const POPULAR_SNOW_LOCATIONS = [
  'new-york',
  'chicago',
  'boston',
  'denver',
  'toronto',
  'montreal',
  'minneapolis',
  'london',
  'oslo',
  'helsinki',
  'stockholm',
  'tokyo',
  'seattle',
  'detroit',
  'philadelphia',
  'pittsburgh',
  'cleveland',
  'buffalo',
  'calgary',
  'vancouver',
];

export async function generateStaticParams() {
  return POPULAR_SNOW_LOCATIONS.map((loc) => ({
    location: loc,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const loc = await resolveLocationFromSlug(params.location);
  if (!loc) {
    return {
      title: 'Location Not Found | Weather Hub',
    };
  }

  const title = `${loc.name} Snow Day Calculator & Snow Probability | Weather Hub`;
  const description = `Calculate the estimated snow day probability for ${loc.name}. Accurate winter weather forecast analysis including overnight snowfall, ice hazard and morning commute temperatures.`;
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://weatherhub.example.com'}/tools/snow-day-calculator/${params.location}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Weather Hub',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocationSnowDayPage({ params }: PageProps) {
  const loc = await resolveLocationFromSlug(params.location);

  if (!loc) {
    notFound();
  }

  let initialPrediction = null;
  try {
    const weatherData = await weatherService.getWeather(loc.lat, loc.lon, loc);
    initialPrediction = SnowDayPredictionEngine.calculate(weatherData);
  } catch (err) {
    console.error(`[LocationSnowDayPage] Failed to fetch weather for ${params.location}:`, err);
  }

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
      {
        '@type': 'ListItem',
        position: 4,
        name: `${loc.name} Snow Day Calculator`,
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://weatherhub.example.com'}/tools/snow-day-calculator/${params.location}`,
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
          flexWrap: 'wrap',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Home size={13} /> <span>Home</span>
        </Link>
        <ChevronRight size={13} />
        <Link href="/tools/snow-day-calculator">Tools</Link>
        <ChevronRight size={13} />
        <Link href="/tools/snow-day-calculator">Snow Day Calculator</Link>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{loc.name}</span>
      </nav>

      {/* Header */}
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
          <span>{loc.name} Winter Weather Forecast</span>
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
          {loc.name} Snow Day Calculator
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)', lineHeight: 1.6 }}>
          Estimated school cancellation and snow day probability for {loc.name}, {[loc.region, loc.country].filter(Boolean).join(', ')}.
        </p>
      </div>

      {/* Main Interactive Tool for this location */}
      <SnowDayCalculatorView
        initialLocation={loc}
        initialPrediction={initialPrediction}
      />
    </div>
  );
}
