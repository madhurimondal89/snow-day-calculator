import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, MapPin, AlertCircle, Snowflake } from 'lucide-react';
import { resolveLocationFromSlug } from '@/lib/location/slugs';
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
  return POPULAR_CITIES.slice(0, 20).map((city) => ({
    location: city.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const loc = await resolveLocationFromSlug(params.location);
  if (!loc) {
    return {
      title: 'Location Not Found | Snow Day Calculator Free',
    };
  }

  const title = `${loc.name} Weather Forecast, Hourly & 7-Day Trend | Snow Day Calculator Free`;
  const description = `Detailed ${loc.name} weather forecast, 24-hour hourly temperatures, rain & snowfall accumulation, humidity, AQI air quality and winter weather risk metrics.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://snowdaycalculatorfree.com'}/forecast/${params.location}`,
    },
  };
}

export default async function ForecastLocationPage({ params }: PageProps) {
  const loc = await resolveLocationFromSlug(params.location);

  if (!loc) {
    notFound();
  }

  let weatherData;
  try {
    weatherData = await weatherService.getWeather(loc.lat, loc.lon, loc);
  } catch (error) {
    console.error(`[ForecastLocationPage] Failed for ${params.location}:`, error);
    notFound();
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
          flexWrap: 'wrap',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Home size={13} /> <span>Home</span>
        </Link>
        <ChevronRight size={13} />
        <Link href="/weather">Weather</Link>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{loc.name} Forecast</span>
      </nav>

      {/* Top Banner: Check Snow Day Probability */}
      <div
        className="glass-card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Snowflake size={20} color="#38bdf8" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Want to know if school or office will be closed in {loc.name}?
          </span>
        </div>
        <Link
          href={`/snow-day-calculator/${loc.slug || params.location}`}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-primary)',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 700,
          }}
        >
          Check {loc.name} Snow Day % →
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <CurrentWeatherCard data={weatherData} />
        <DynamicSummaryCard data={weatherData} />
        <HourlyForecastCard hourly={weatherData.hourly} timezone={loc.timezone} />
        <DailyForecastCard daily={weatherData.daily} />
        <WeatherDetailsGrid current={weatherData.current} />
        <AirQualityCard airQuality={weatherData.airQuality} />
        <SunMoonCard current={weatherData.current} timezone={loc.timezone} />

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: 'var(--accent-primary)' }} /> {loc.name} Weather Radar & Map
            </h2>
            <Link
              href="/maps"
              style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}
            >
              Expand Full Map →
            </Link>
          </div>
          <WeatherMapLazy initialLat={loc.lat} initialLon={loc.lon} initialZoom={7} height="420px" />
        </div>

        <LocationFAQ data={weatherData} />
      </div>
    </div>
  );
}
