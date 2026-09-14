import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Snowflake, ChevronRight, Home, CloudSnow, ShieldCheck, HelpCircle, MapPin, Compass } from 'lucide-react';
import { SnowDayCalculatorView } from '@/components/snow-day/SnowDayCalculatorView';
import { weatherService } from '@/lib/weather/service';
import { resolveLocationFromSlug } from '@/lib/location/slugs';
import { SnowDayPredictionEngine } from '@/lib/snow-day/engine';
import { SNOW_BELT_CITIES, POPULAR_CITIES } from '@/lib/location/cities';

interface PageProps {
  params: {
    location: string;
  };
}

export const revalidate = 900;

export async function generateStaticParams() {
  return SNOW_BELT_CITIES.map((city) => ({
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

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.snowdaycalculatorfree.com').replace(/\/+$/, '');
  const regionLabel = loc.region || loc.country;
  const title = `Snow Day Calculator for ${loc.name}, ${regionLabel}`;
  const description = `Calculate the estimated snow day probability for ${loc.name}, ${regionLabel}. Accurate winter weather forecast analysis including overnight snowfall, ice hazards, and morning commute temperatures.`;
  const canonicalUrl = `${siteUrl}/snow-day-calculator/${params.location}`;

  return {
    title,
    description,
    keywords: [
      `${loc.name.toLowerCase()} snow day calculator`,
      `snow day predictor ${loc.name.toLowerCase()}`,
      `will schools close tomorrow in ${loc.name.toLowerCase()}`,
      `${loc.name.toLowerCase()} school closing probability`,
      `${loc.name.toLowerCase()} snow forecast`,
      `snow day chances ${loc.name.toLowerCase()}`,
      `winter weather prediction ${loc.name.toLowerCase()}`,
      `${loc.name.toLowerCase()} school cancellations`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Snow Day Calculator Free',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocationSnowDayCalculatorPage({ params }: PageProps) {
  const loc = await resolveLocationFromSlug(params.location);

  if (!loc) {
    notFound();
  }

  let initialPrediction = null;
  try {
    const weatherData = await weatherService.getWeather(loc.lat, loc.lon, loc);
    initialPrediction = SnowDayPredictionEngine.calculate(weatherData);
  } catch (err) {
    console.error(`[LocationSnowDayCalculatorPage] Failed fetch for ${params.location}:`, err);
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.snowdaycalculatorfree.com').replace(/\/+$/, '');
  const pageUrl = `${siteUrl}/snow-day-calculator/${params.location}`;

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
      {
        '@type': 'ListItem',
        position: 3,
        name: `Snow Day Calculator for ${loc.name}`,
        item: pageUrl,
      },
    ],
  };

  const cityFaqs = [
    {
      q: `Will tomorrow be a snow day in ${loc.name}?`,
      a: `Our real-time meteorological engine analyzes snowfall accumulation, freezing rain, and morning commute temperatures for ${loc.name} to calculate the probability of school cancellations or delays. Check the live probability gauge above for today's forecast breakdown.`,
    },
    {
      q: `What snowfall amount causes school closures in ${loc.name}?`,
      a: `In ${loc.name}, school closure thresholds depend on local road clearing capacity and elevation. In metropolitan districts, 4 to 8 inches (10–20 cm) of rapid snowfall or any measurable freezing rain glaze often prompts closures or 2-hour delays.`,
    },
    {
      q: `When do school districts in ${loc.name} announce snow days?`,
      a: `School superintendents in ${loc.name} typically issue initial alerts between 5:00 AM and 6:30 AM on the morning of a storm, or the night before by 10:00 PM if a heavy winter storm warning is in effect.`,
    },
    {
      q: `How does freezing rain affect school closings in ${loc.name}?`,
      a: `Freezing rain creates hazardous black ice across highways and residential bus routes in ${loc.name}. Even 0.1 inches of ice glaze often triggers immediate district-wide cancellations.`,
    },
  ];

  const cityFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: cityFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  const citySoftwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `Snow Day Calculator for ${loc.name}`,
    applicationCategory: 'WeatherApplication',
    operatingSystem: 'All',
    url: pageUrl,
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
  };

  // Nearby / other major snow cities for internal linking
  const relatedCities = SNOW_BELT_CITIES
    .filter((c) => c.slug !== loc.slug)
    .slice(0, 12);

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem 1.25rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityFaqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(citySoftwareSchema) }}
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
        <Link href="/snow-day-calculator">Snow Day Calculator</Link>
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
          <span>{loc.name} Winter Weather & School Closure Forecast</span>
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
          Calculate the estimated chance of a snow day or school delay in {loc.name}, {[loc.region, loc.country].filter(Boolean).join(', ')} using real-time snowfall accumulation, morning temperatures, and road icing models.
        </p>
      </div>

      <SnowDayCalculatorView
        initialLocation={loc}
        initialPrediction={initialPrediction}
      />

      {/* City-Specific Localized Winter FAQ & Guide */}
      <section style={{ marginTop: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <HelpCircle size={22} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{loc.name} Snow Day & Winter Closure FAQ</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {cityFaqs.map((faq, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {faq.q}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal Linking: Related Snow Day Cities */}
      <section style={{ marginTop: '4rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={20} style={{ color: 'var(--accent-primary)' }} /> Other Winter Snow Day Calculators
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Check school closure probabilities and winter storm forecasts for other major cities
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '0.85rem',
          }}
        >
          {relatedCities.map((city) => (
            <Link
              key={city.slug}
              href={`/snow-day-calculator/${city.slug}`}
              className="glass-card"
              style={{
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{city.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{city.region || city.country}</div>
              </div>
              <Snowflake size={14} style={{ color: 'var(--accent-primary)' }} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

