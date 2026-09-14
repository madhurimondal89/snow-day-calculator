import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.snowdaycalculatorfree.com').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Privacy Policy | Snow Day Calculator Free',
  description: 'Snow Day Calculator Free privacy-first policy: zero tracking databases, privacy-preserving location requests, and client-side preferences.',
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem', maxWidth: '820px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
          Last updated: September 2026
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            1. Zero Personal Data Collection
          </h2>
          <p>
            Weather Hub is designed from the ground up as a privacy-first utility. We do not require accounts, passwords, email addresses, or phone numbers. We do not operate a user tracking database.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            2. Local Browser Storage (localStorage)
          </h2>
          <p>
            Your preferences (such as temperature unit °C/°F, dark/light theme choice, favorite locations, and recent search history) are stored entirely in your local browser&apos;s <code>localStorage</code>. This data never leaves your device and is never synchronized to our servers.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            3. Geolocation Data
          </h2>
          <p>
            When you click &ldquo;Near me&rdquo; or &ldquo;Use My Location&rdquo;, your browser will ask for your explicit permission to share coordinates. These coordinates are used exclusively in real-time to look up the corresponding localized weather report and are not permanently logged or tracked.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            4. Third-Party Meteorological Services
          </h2>
          <p>
            Weather requests are proxied through our server-side API layer to MET Norway and Open-Meteo to fetch atmospheric metrics. Your IP address is not directly forwarded to these external providers.
          </p>
        </section>
      </div>
    </div>
  );
}
