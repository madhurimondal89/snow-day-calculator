'use client';

import React from 'react';
import Link from 'next/link';
import { Snowflake, Map, Sun, Moon, Sparkles, Compass, CloudSnow, ArrowRight } from 'lucide-react';
import { SearchBar } from '../weather/SearchBar';
import { useWeatherPreferences } from '../providers/WeatherPreferencesContext';

export const Header: React.FC = () => {
  const { unit, toggleUnit, theme, toggleTheme } = useWeatherPreferences();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 0',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Logo & Brand: Snow Day Calculator Free */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)',
            }}
          >
            <Snowflake size={22} color="#ffffff" />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.2rem',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(to right, #38bdf8, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              SNOW DAY CALCULATOR
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
              Free Prediction Engine
            </span>
          </div>
        </Link>

        {/* Global Search Bar in Header */}
        <div style={{ flex: 1, maxWidth: '380px', display: 'none' }} className="header-search-desktop">
          <SearchBar placeholder="Search city or ZIP code..." />
        </div>

        {/* Nav actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Link
            href="/snow-day-calculator"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'background var(--transition-fast)',
            }}
          >
            <Snowflake size={14} style={{ color: '#38bdf8' }} />
            <span className="nav-text-desktop">Calculator</span>
          </Link>

          <Link
            href="/snow-day-predictor"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 500,
              transition: 'background var(--transition-fast)',
            }}
          >
            <Sparkles size={14} style={{ color: '#f59e0b' }} />
            <span className="nav-text-desktop">Predictor</span>
          </Link>

          <Link
            href="/snow-forecast"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 500,
              transition: 'background var(--transition-fast)',
            }}
          >
            <CloudSnow size={14} style={{ color: '#06b6d4' }} />
            <span className="nav-text-desktop">Snow Forecast</span>
          </Link>

          <Link
            href="/maps"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 500,
              transition: 'background var(--transition-fast)',
            }}
          >
            <Map size={14} style={{ color: '#10b981' }} />
            <span className="nav-text-desktop">Maps</span>
          </Link>

          <Link
            href="/weather"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 500,
              transition: 'background var(--transition-fast)',
            }}
          >
            <Compass size={14} style={{ color: '#818cf8' }} />
            <span className="nav-text-desktop">Weather</span>
          </Link>

          {/* Primary CTA: Calculate Snow Day */}
          <Link
            href="/snow-day-calculator"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              transition: 'transform var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            <span>Calculate</span>
            <ArrowRight size={13} />
          </Link>

          {/* Unit Switcher */}
          <button
            type="button"
            onClick={toggleUnit}
            aria-label={`Switch temperature unit, currently ${unit.toUpperCase()}`}
            style={{
              padding: '0.42rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.15rem',
              transition: 'background var(--transition-fast)',
            }}
          >
            <span style={{ color: unit === 'c' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>°C</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>/</span>
            <span style={{ color: unit === 'f' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>°F</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Toggle theme, currently ${theme}`}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background var(--transition-fast)',
              flexShrink: 0,
            }}
          >
            {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#6366f1" />}
          </button>
        </div>
      </div>
    </header>
  );
};
