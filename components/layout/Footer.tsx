import React from 'react';
import Link from 'next/link';
import {
  Snowflake,
  ShieldCheck,
  Database,
  FileText,
  Mail,
  Info,
  Map,
  Compass,
  CloudSnow,
  ExternalLink,
  Calculator,
  Activity,
  Wrench,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        padding: '3.5rem 0 2rem 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Snowflake size={18} color="#ffffff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem' }}>
                SNOW DAY CALCULATOR
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Free deterministic winter storm prediction engine. Calculate your estimated chance of a snow day or school closure based on real-time meteorological models.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} color="var(--brand-emerald)" />
              <span>Zero-tracker & privacy-first architecture</span>
            </div>
          </div>

          {/* Snow Day Calculators */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Snow Day Calculators
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>
                <Link href="/snow-day-calculator" style={{ color: '#38bdf8', fontWeight: 600 }}>
                  ❄️ Free Snow Day Calculator
                </Link>
              </li>
              <li>
                <Link href="/snow-day-predictor">
                  ✨ Snow Day Predictor
                </Link>
              </li>
              <li>
                <Link href="/snow-day-calculator/boston">Boston Snow Day %</Link>
              </li>
              <li>
                <Link href="/snow-day-calculator/chicago">Chicago Snow Day %</Link>
              </li>
              <li>
                <Link href="/snow-day-calculator/new-york">New York Snow Day %</Link>
              </li>
              <li>
                <Link href="/snow-day-calculator/denver">Denver Snow Day %</Link>
              </li>
              <li>
                <Link href="/snow-day-calculator/toronto">Toronto Snow Day %</Link>
              </li>
            </ul>
          </div>

          {/* Meteorological Tools */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Weather & Radar Tools
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>
                <Link href="/snow-forecast" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CloudSnow size={13} color="#38bdf8" /> Snow Forecast & Accumulation
                </Link>
              </li>
              <li>
                <Link href="/maps" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Map size={13} color="#10b981" /> Live Weather Map & Radar
                </Link>
              </li>
              <li>
                <Link href="/weather" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Compass size={13} color="#818cf8" /> City Weather Forecasts
                </Link>
              </li>
              <li>
                <Link href="/internal/provider-status">
                  Routing & Provider Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Data Transparency */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Transparency & Legal
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>
                <Link href="/data-sources" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Database size={13} /> Data Sources & Attribution
                </Link>
              </li>
              <li>
                <Link href="/about" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Info size={13} /> About Our Prediction Engine
                </Link>
              </li>
              <li>
                <Link href="/privacy" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={13} /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={13} /> Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={13} /> Contact & Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Free Calculator Network Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            padding: '1.75rem 0',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Calculator size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Our Free Calculator Network</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Explore specialized precision calculators across finance, health, and engineering.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <a
                href="https://financialhub.calculatorfree.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-color)',
                }}
              >
                <Calculator size={14} color="#38bdf8" />
                <span style={{ fontWeight: 600 }}>Financial Hub</span>
                <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
              </a>

              <a
                href="https://health-hub.calculatorfree.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-color)',
                }}
              >
                <Activity size={14} color="#10b981" />
                <span style={{ fontWeight: 600 }}>Health Hub</span>
                <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
              </a>

              <a
                href="https://engineering.calculatorfree.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-color)',
                }}
              >
                <Wrench size={14} color="#a855f7" />
                <span style={{ fontWeight: 600 }}>Engineering Hub</span>
                <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {new Date().getFullYear()} <strong>Snow Day Calculator Free</strong> (snowdaycalculatorfree.com). Weather estimates only; not an official school closure service.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/data-sources">Attribution</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
