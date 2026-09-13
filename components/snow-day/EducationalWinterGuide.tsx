'use client';

import React from 'react';
import {
  BookOpen,
  Snowflake,
  Thermometer,
  ShieldAlert,
  Clock,
  Wind,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const EducationalWinterGuide: React.FC = () => {
  return (
    <section style={{ marginTop: '3.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
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
            marginBottom: '0.75rem',
          }}
        >
          <BookOpen size={14} color="#38bdf8" />
          <span>Meteorological Knowledge Base</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800 }}>
          How Snow Day Predictions Work
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Understanding the science, weather models, and road safety thresholds behind winter school cancellation estimates.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Card 1: How does the calculation work? */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Snowflake size={20} color="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            How is Snow Day Probability Calculated?
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Our deterministic prediction algorithm analyzes numerical weather forecast data across five core meteorological dimensions: liquid-to-snow accumulation equivalent, timing relative to the 6:00 AM – 9:00 AM student commute, pavement freezing temperatures, ice/freezing rain hazards, and peak wind gusts.
          </p>
        </div>

        {/* Card 2: How much snow causes a snow day? */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Layers size={20} color="#10b981" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            How Much Snow Usually Causes a Snow Day?
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Snowfall thresholds vary dramatically by geography. In northern states with extensive snowplow fleets (like Minnesota, New York, or Maine), 15+ cm (6+ inches) is often required. In southern or coastal regions with limited clearing equipment, as little as 2.5 to 5 cm (1 to 2 inches) can prompt county-wide closures.
          </p>
        </div>

        {/* Card 3: Freezing rain impact */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <ShieldAlert size={20} color="#ef4444" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Does Freezing Rain Increase Probability?
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Yes, significantly. Freezing rain forms invisible black ice on bridges and asphalt, causing hazardous friction loss that standard snow chains and plows cannot immediately mitigate. Even 1 to 2 mm of ice accumulation will often prompt school districts to cancel sessions immediately.
          </p>
        </div>

        {/* Card 4: Temperature effects */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Thermometer size={20} color="#f59e0b" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Does Extreme Cold Trigger Closures?
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Sub-zero temperatures below -15°C (5°F) or severe wind chill advisories frequently cause school delays or cancellations due to diesel bus fuel gelling, mechanical failure, and the danger of frostbite for children waiting at bus stops.
          </p>
        </div>

        {/* Card 5: Timing is everything */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Clock size={20} color="#818cf8" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Why Timing Matters More Than Total Snow
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Snow that falls at 2:00 PM the previous day gives municipal road crews over 12 hours to salt and plow routes. However, intense snowfall starting at 5:00 AM immediately before bus departures is the single highest predictor of unexpected morning school cancellations.
          </p>
        </div>

        {/* Card 6: Official vs Estimated */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <HelpCircle size={20} color="#06b6d4" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Why Actual Decisions May Differ
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            While our model computes meteorological risk, superintendents also consider driver availability, building heating reliability, rural road topography, and remote learning alternatives. Always consult your official school district portal for binding closure notices.
          </p>
        </div>
      </div>
    </section>
  );
};
