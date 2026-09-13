'use client';

import React from 'react';
import { HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface SnowDayExplanationProps {
  reasons: string[];
  riskLabel: string;
}

export const SnowDayExplanation: React.FC<SnowDayExplanationProps> = ({ reasons, riskLabel }) => {
  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <HelpCircle size={18} style={{ color: 'var(--accent-primary)' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          Why is the Snow Day probability {riskLabel}?
        </h3>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {reasons.map((reason, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              color: 'var(--text-primary)',
            }}
          >
            <div style={{ marginTop: '0.2rem', flexShrink: 0 }}>
              <CheckCircle2 size={15} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
