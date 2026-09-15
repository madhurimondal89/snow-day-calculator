'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Snowflake,
  MapPin,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  Layers,
  CloudSnow,
} from 'lucide-react';
import { LocationInfo } from '@/lib/weather/types/weather';
import { SnowDayPrediction } from '@/lib/snow-day/types';
import { SnowDayGauge } from './SnowDayGauge';
import { SnowDayFactorsGrid } from './SnowDayFactorsGrid';
import { SnowDayExplanation } from './SnowDayExplanation';
import { SnowDayTimeline } from './SnowDayTimeline';
import { TomorrowsWinterSummary } from './TomorrowsWinterSummary';
import { EducationalWinterGuide } from './EducationalWinterGuide';
import { SnowDayDisclaimer } from './SnowDayDisclaimer';
import { SnowDayShareButton } from './SnowDayShareButton';
import { SnowDayFAQ } from './SnowDayFAQ';
import { SearchBar } from '../weather/SearchBar';
import { DataSourceAttribution } from '../weather/DataSourceAttribution';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';
import { AdSenseBanner } from '../ads/AdSenseBanner';

interface SnowDayCalculatorViewProps {
  initialLocation?: LocationInfo;
  initialPrediction?: SnowDayPrediction | null;
  showExtendedGuides?: boolean;
}

const POPULAR_WINTER_HUBS: LocationInfo[] = [
  { name: 'New York', region: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lon: -74.006, timezone: 'America/New_York', slug: 'new-york' },
  { name: 'Chicago', region: 'Illinois', country: 'United States', countryCode: 'US', lat: 41.8781, lon: -87.6298, timezone: 'America/Chicago', slug: 'chicago' },
  { name: 'Boston', region: 'Massachusetts', country: 'United States', countryCode: 'US', lat: 42.3601, lon: -71.0589, timezone: 'America/New_York', slug: 'boston' },
  { name: 'Denver', region: 'Colorado', country: 'United States', countryCode: 'US', lat: 39.7392, lon: -104.9903, timezone: 'America/Denver', slug: 'denver' },
  { name: 'Toronto', region: 'Ontario', country: 'Canada', countryCode: 'CA', lat: 43.6532, lon: -79.3832, timezone: 'America/Toronto', slug: 'toronto' },
  { name: 'Montreal', region: 'Quebec', country: 'Canada', countryCode: 'CA', lat: 45.5017, lon: -73.5673, timezone: 'America/Toronto', slug: 'montreal' },
  { name: 'Minneapolis', region: 'Minnesota', country: 'United States', countryCode: 'US', lat: 44.9778, lon: -93.265, timezone: 'America/Chicago', slug: 'minneapolis' },
  { name: 'Buffalo', region: 'New York', country: 'United States', countryCode: 'US', lat: 42.8864, lon: -78.8784, timezone: 'America/New_York', slug: 'buffalo' },
  { name: 'London', region: 'England', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London', slug: 'london' },
  { name: 'Oslo', region: 'Oslo', country: 'Norway', countryCode: 'NO', lat: 59.9139, lon: 10.7522, timezone: 'Europe/Oslo', slug: 'oslo' },
];

export const SnowDayCalculatorView: React.FC<SnowDayCalculatorViewProps> = ({
  initialLocation,
  initialPrediction,
  showExtendedGuides = true,
}) => {
  const router = useRouter();
  const { unit } = useWeatherPreferences();

  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(
    initialLocation || POPULAR_WINTER_HUBS[0]
  );
  const [prediction, setPrediction] = useState<SnowDayPrediction | null>(initialPrediction || null);
  const [isLoading, setIsLoading] = useState(!initialPrediction);
  const [error, setError] = useState<string | null>(null);

  // Fetch prediction when location or unit changes
  const fetchSnowDayPrediction = async (loc: LocationInfo) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tools/snow-day?lat=${loc.lat}&lon=${loc.lon}&units=${unit}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPrediction(json.data);
          setCurrentLocation(loc);
        } else {
          setError(json.error || 'Unable to calculate snow day probability.');
        }
      } else {
        setError('Weather forecast service is temporarily unavailable for this location.');
      }
    } catch {
      setError('A network error occurred while evaluating the winter forecast.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialPrediction || initialLocation?.lat !== currentLocation.lat) {
      fetchSnowDayPrediction(currentLocation);
    }
  }, [unit]);

  const handleSelectLocation = (loc: LocationInfo) => {
    if (loc.slug) {
      router.push(`/snow-day-calculator/${loc.slug}`);
    } else {
      fetchSnowDayPrediction(loc);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Search & Location Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto 1.25rem auto' }}>
          <SearchBar
            placeholder="Search city, ZIP code or postal code (e.g. Buffalo, Chicago, Denver)..."
          />
        </div>

        {/* Popular Winter Location Quick-Pills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
            Popular Winter Hubs:
          </span>
          {POPULAR_WINTER_HUBS.map((hub) => {
            const isActive = hub.name === currentLocation.name;
            return (
              <button
                key={hub.name}
                type="button"
                onClick={() => handleSelectLocation(hub)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'var(--accent-primary)' : 'var(--bg-glass)',
                  border: `1px solid ${isActive ? 'transparent' : 'var(--border-color)'}`,
                  color: isActive ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
              >
                {hub.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          className="glass-card"
          style={{
            padding: '4rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Loader2 size={36} className="animate-spin" color="var(--accent-primary)" />
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Analyzing winter forecast models for {currentLocation.name}...
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Evaluating snowfall accumulation, freezing precipitation risk, commute temperatures and wind vectors.
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div
          className="glass-card"
          style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={38} color="#ef4444" />
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Forecast Temporarily Unavailable
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '480px' }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => fetchSnowDayPrediction(currentLocation)}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Try Another Location
          </button>
        </div>
      )}

      {/* Main Results View */}
      {prediction && !isLoading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Header Card with Location & Analysis Window */}
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                <MapPin size={15} /> <span>{currentLocation.region ? `${currentLocation.region}, ` : ''}{currentLocation.country}</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.15rem' }}>
                {currentLocation.name} Snow Day Estimate
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                }}
              >
                <Clock size={13} style={{ color: 'var(--accent-primary)' }} />
                <span>{prediction.analysisWindow.label}</span>
              </div>

              <SnowDayShareButton location={currentLocation} probability={prediction.probability} />
            </div>
          </div>

          {/* Radial Gauge & High-level Metric Overview */}
          <SnowDayGauge
            probability={prediction.probability}
            riskLevel={prediction.riskLevel}
            riskLabel={prediction.riskLabel}
            confidence={prediction.confidence}
            confidenceLabel={prediction.confidenceLabel}
          />

          {/* Detailed Meteorological Factors Grid */}
          <SnowDayFactorsGrid factors={prediction.factors} />

          {/* Tomorrow's Supporting Weather Summary */}
          {prediction.weather && (
            <TomorrowsWinterSummary weather={prediction.weather} factors={prediction.factors} />
          )}

          {/* Hourly Winter Timeline */}
          {prediction.weather && (
            <SnowDayTimeline weather={prediction.weather} targetDateStr={prediction.analysisWindow.dateStr} />
          )}

          {/* Dynamic Explanation Breakdown */}
          <SnowDayExplanation reasons={prediction.reasons} riskLabel={prediction.riskLabel} />

          {/* Clear Notice & Disclaimer */}
          <SnowDayDisclaimer />

          {/* Secondary Weather Ecosystem Promotion */}
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Secondary Meteorological Data
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.2rem' }}>
                Need full weather details for {currentLocation.name}?
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '540px' }}>
                Explore 7-day extended forecasts, high-resolution precipitation radar maps, air quality index, and 24-hour hourly trend analytics.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                href={`/weather/${currentLocation.slug || 'new-york'}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                <span>View Full Forecast</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/weather-map"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                <Layers size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Radar Maps</span>
              </Link>
            </div>
          </div>

          {/* Attribution */}
          <div style={{ marginTop: '0.5rem' }}>
            <DataSourceAttribution
              metadata={{
                providerName: prediction.providerInfo.name,
                providerId: 'snow-day-engine',
                fetchedAt: prediction.calculatedAt,
                attributionText: 'Meteorological observations and Numerical Weather Prediction models.',
                attributionUrl: '/data-sources',
                isFallback: prediction.providerInfo.isFallback,
              }}
            />
          </div>
        </div>
      )}

      {/* Non-intrusive Ad Placement: positioned cleanly after prediction results and before guides */}
      <div style={{ margin: '2.5rem 0' }}>
        <AdSenseBanner slot="7021668643" />
      </div>

      {/* Educational Guide Section */}
      {showExtendedGuides && <EducationalWinterGuide />}

      {/* SEO FAQ Section */}
      <SnowDayFAQ />
    </div>
  );
};
