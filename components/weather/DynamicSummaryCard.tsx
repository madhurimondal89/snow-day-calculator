'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { WeatherData } from '@/lib/weather/types/weather';

interface DynamicSummaryCardProps {
  data: WeatherData;
}

export const DynamicSummaryCard: React.FC<DynamicSummaryCardProps> = ({ data }) => {
  const { dynamicSummary, location } = data;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <Sparkles size={18} style={{ color: '#38bdf8' }} />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          {location.name} Weather Outlook & Summary
        </h2>
      </div>
      <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
        {dynamicSummary}
      </p>
    </div>
  );
};
