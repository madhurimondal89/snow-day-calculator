'use client';

import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const SnowDayDisclaimer: React.FC = () => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        background: 'rgba(245, 158, 11, 0.05)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
      }}
    >
      <AlertCircle size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.15rem' }} />
      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
        <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '0.2rem' }}>
          Important Notice & Accuracy Disclaimer:
        </strong>
        This calculator provides a <strong>weather-based estimate only</strong>. Actual school cancellations and schedule changes depend on individual school board districts, municipal plowing resources, student bus route conditions, temperature thresholds, and administrative policies. <strong>Weather Hub is not an official school closure notification service.</strong> Always check with your local school district or municipality for official closure announcements.
      </div>
    </div>
  );
};
