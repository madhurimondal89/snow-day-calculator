import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, MapPin, AlertCircle } from 'lucide-react';
import { resolveLocationFromSlug, getLocationCanonicalUrl } from '@/lib/location/slugs';
import { weatherService } from '@/lib/weather/service';
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard';
import { DynamicSummaryCard } from '@/components/weather/DynamicSummaryCard';
import { HourlyForecastCard } from '@/components/weather/HourlyForecastCard';
import { DailyForecastCard } from '@/components/weather/DailyForecastCard';
import { WeatherDetailsGrid } from '@/components/weather/WeatherDetailsGrid';
import { AirQualityCard } from '@/components/weather/AirQualityCard';
import { SunMoonCard } from '@/components/weather/SunMoonCard';
import { LocationFAQ } from '@/components/weather/LocationFAQ';
import { WeatherMapLazy } from '@/components/map/WeatherMapLazy';
import { POPULAR_CITIES } from '@/lib/location/cities';

interface PageProps {
  params: {
    location: string;
  };
}

export const revalidate = 900; // 15 minutes ISR

export async function generateStaticParams() {
  // Pre-render top popular cities at build time for lightning speed
  return POPULAR_CITIES.slice(0, 25).map((city) => ({
    location: city.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const loc = await resolveLocationFromSlug(params.location);
  if (!loc) {
    return {
      title: 'Location Not Found',
      description: 'The requested weather location could not be found.',
    };
  }

  const title = `${loc.name} Weather Today, Hourly & 7-Day Forecast | Weather Hub`;
  const description = `Check ${loc.name} weather today, hourly forecast, temperature, rain probability, wind, humidity, AQI and 7-day extended forecast. Real meteorological data from Weather Hub.`;
  const canonicalUrl = getLocationCanonicalUrl(params.location);

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
      type: 'article',
      siteName: 'Weather Hub',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocationWeatherPage({ params }: PageProps) {
  const loc = await resolveLocationFromSlug(params.location);

  if (!loc) {
    notFound();
  }

  let weatherData;
  try {
    weatherData = await weatherService.getWeather(loc.lat, loc.lon, loc);
  } catch (error) {
    console.error(`[LocationPage] Failed to fetch weather for ${params.location}:`, error);
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div
          className="glass-panel"
          style={{ maxWidth: '560px', margin: '0 auto', padding: '2.5rem 1.5rem' }}
        >
          <AlertCircle size={44} color="#f43f5e" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Weather Forecast Temporarily Unavailable
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            We encountered a temporary issue retrieving live meteorological data for {loc.name}. Please refresh the page or try again in a few moments.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Schema.org Structured Data: Breadcrumbs & WebPage
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
        name: 'Weather',
        item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://weatherhub.example.com'}/weather`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${loc.name} Weather`,
        item: getLocationCanonicalUrl(params.location),
      },
    ],
  };

  const webpageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${loc.name} Weather Today, Hourly & 7-Day Forecast`,
    description: `Comprehensive real-time weather, 24-hour hourly, and 7-day forecast for ${loc.name}.`,
    url: getLocationCanonicalUrl(params.location),
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
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
        <span>Weather</span>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{loc.name}</span>
      </nav>

      {/* Main Weather Content Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Current Weather Card */}
        <CurrentWeatherCard data={weatherData} />

        {/* Dynamic Weather Summary */}
        <DynamicSummaryCard data={weatherData} />

        {/* Hourly Forecast (24-Hour Scroll) */}
        <HourlyForecastCard hourly={weatherData.hourly} timezone={loc.timezone} />

        {/* 7-Day Extended Forecast */}
        <DailyForecastCard daily={weatherData.daily} />

        {/* Comprehensive Metrics Grid */}
        <WeatherDetailsGrid current={weatherData.current} />

        {/* Air Quality (AQI) Card */}
        <AirQualityCard airQuality={weatherData.airQuality} />

        {/* Sunrise & Sunset Daylight Card */}
        <SunMoonCard current={weatherData.current} timezone={loc.timezone} />

        {/* Localized Weather Map */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: 'var(--accent-primary)' }} /> {loc.name} Weather Radar & Map
            </h2>
            <Link
              href="/weather-map"
              style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}
            >
              Expand Full Map →
            </Link>
          </div>
          <WeatherMapLazy initialLat={loc.lat} initialLon={loc.lon} initialZoom={7} height="420px" />
        </div>

        {/* Location SEO FAQ */}
        <LocationFAQ data={weatherData} />
      </div>
    </div>
  );
}
