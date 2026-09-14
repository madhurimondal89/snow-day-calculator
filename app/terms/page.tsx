import React from 'react';
import { Metadata } from 'next';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.snowdaycalculatorfree.com').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Terms of Service | Snow Day Calculator Free',
  description: 'Terms of Service and non-binding meteorological disclaimer for Snow Day Calculator Free.',
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem', maxWidth: '820px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
          Last updated: September 2026
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using Weather Hub, you acknowledge and agree to these Terms of Service. If you disagree with any portion of these terms, please discontinue use of the website.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            2. Informational & Non-Critical Usage
          </h2>
          <p>
            Weather data, forecasts, radar layers, and Air Quality Indexes provided on Weather Hub are intended solely for general informational and planning purposes. Meteorological forecasts are inherently probabilistic. Do not rely on Weather Hub for life-critical decisions, extreme emergency alerts, marine navigation, or aviation planning. Always consult your national meteorological emergency services during severe weather events.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            3. Disclaimer of Warranties
          </h2>
          <p>
            Weather Hub is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express or implied, including accuracy, fitness for a particular purpose, or uninterrupted availability.
          </p>
        </section>
      </div>
    </div>
  );
}
