import React from 'react';
import { Metadata } from 'next';
import { Mail, MessageSquare, Globe, Heart } from 'lucide-react';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.snowdaycalculatorfree.com').replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Contact & Inquiries | Snow Day Calculator Free',
  description: 'Get in touch with the Snow Day Calculator Free maintainers and meteorological contributors.',
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem', maxWidth: '780px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Contact & Inquiries</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>
          Have feedback, feature requests, or meteorological data inquiries?
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <Mail size={24} style={{ color: 'var(--accent-primary)', marginBottom: '0.75rem' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Direct Inquiries</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            For general correspondence, bug reports, and data inquiries:
          </p>
          <a
            href="mailto:contact@weatherhub.local"
            style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.9rem' }}
          >
            contact@weatherhub.local
          </a>
        </div>

        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <MessageSquare size={24} style={{ color: 'var(--brand-emerald)', marginBottom: '0.75rem' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Community & GitHub</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
            Submit issues, pull requests, or provider adapters on GitHub repository.
          </p>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Open Source Repository</span>
        </div>
      </div>
    </div>
  );
}
