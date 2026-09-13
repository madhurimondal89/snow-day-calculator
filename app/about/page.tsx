import React from 'react';
import { Metadata } from 'next';
import { Snowflake, ShieldCheck, Zap, Globe2, Layers, Heart, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Snow Day Calculator Free — Mission & Architecture',
  description:
    'Learn about Snow Day Calculator Free, our deterministic winter weather prediction engine, and how we normalize open meteorological models.',
};

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem', maxWidth: '860px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 4px 16px rgba(56, 189, 248, 0.3)',
          }}
        >
          <Snowflake size={30} color="#ffffff" />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
          About Snow Day Calculator Free
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
          A free, privacy-first, deterministic winter storm prediction engine powered by global meteorological data.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>Our Mission</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1rem' }}>
          Winter storms, freezing rain, and heavy snowfall create high-stakes scheduling decisions for millions of students, parents, teachers, and commuters each winter. Many legacy weather apps only show generic daily icons without explaining whether road conditions will actually impact morning transit safety.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          <strong>Snow Day Calculator Free</strong> was built to provide transparent, explainable, and instantaneous snow day probability estimates. We combine numerical liquid-to-snow conversion algorithms, morning commute timing windows (6:00 AM – 9:00 AM), road freeze dynamics, and wind gust vectors into a single intuitive 0–100% calculation.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <Zap size={24} style={{ color: '#38bdf8', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Deterministic Scoring</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Our algorithm uses transparent, rule-based meteorological mathematics with zero black-box AI hallucination.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <ShieldCheck size={24} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Zero Database & Privacy</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            We do not store your location, search history, or personal identifiers in any remote database. Everything runs server-side with in-memory caching.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <Globe2 size={24} style={{ color: '#f59e0b', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Multi-Provider Resilience</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Backed by national meteorological models from NOAA (US), MSC GeoMet (Canada), FMI (Finland), Met Office (UK), and MET Norway.
          </p>
        </div>
      </div>
    </div>
  );
}
