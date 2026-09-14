import React from 'react';
import Link from 'next/link';
import { Snowflake, Home, Sparkles, CloudSnow, Compass, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="container"
      style={{
        minHeight: '65vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.25rem',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'rgba(56, 189, 248, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-color)',
        }}
      >
        <Snowflake size={36} color="#38bdf8" />
      </div>

      <span
        style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--accent-primary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}
      >
        404 — Page Not Found
      </span>

      <h1
        style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          marginBottom: '1rem',
        }}
      >
        Lost in a Blizzard?
      </h1>

      <p
        style={{
          maxWidth: '520px',
          color: 'var(--text-secondary)',
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
        }}
      >
        The page or location forecast you are looking for does not exist or has been moved. Explore our core winter calculation tools below.
      </p>

      {/* Quick Navigation Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          width: '100%',
          maxWidth: '820px',
          marginBottom: '2.5rem',
          textAlign: 'left',
        }}
      >
        <Link href="/" className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Home size={18} color="#38bdf8" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Snow Day Home</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Main snow day probability calculator with real-time radar
          </p>
        </Link>

        <Link href="/snow-day-calculator" className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Snowflake size={18} color="#38bdf8" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Calculator Tool</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Enter city or ZIP code for instant closure probability
          </p>
        </Link>

        <Link href="/snow-day-predictor" className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Sparkles size={18} color="#f59e0b" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Snow Day Predictor</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            School cancellation analytics and storm timing
          </p>
        </Link>

        <Link href="/snow-forecast" className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <CloudSnow size={18} color="#06b6d4" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Snow Forecast</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Accumulation maps and precipitation radar
          </p>
        </Link>
      </div>

      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent-primary)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}
      >
        <span>Back to Snow Day Calculator</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
