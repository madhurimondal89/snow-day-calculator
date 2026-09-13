'use client';

import React from 'react';
import { Snowflake, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import { SnowDayRiskLevel, ConfidenceLevel } from '@/lib/snow-day/types';

interface SnowDayGaugeProps {
  probability: number;
  riskLevel: SnowDayRiskLevel;
  riskLabel: string;
  confidence: ConfidenceLevel;
  confidenceLabel: string;
}

export const SnowDayGauge: React.FC<SnowDayGaugeProps> = ({
  probability,
  riskLevel,
  riskLabel,
  confidence,
  confidenceLabel,
}) => {
  // Determine color scheme based on risk
  let strokeColor = '#38bdf8';
  let badgeBg = 'rgba(56, 189, 248, 0.15)';
  let badgeBorder = 'rgba(56, 189, 248, 0.3)';

  if (riskLevel === 'very-high') {
    strokeColor = '#ef4444';
    badgeBg = 'rgba(239, 68, 68, 0.15)';
    badgeBorder = 'rgba(239, 68, 68, 0.3)';
  } else if (riskLevel === 'high') {
    strokeColor = '#f97316';
    badgeBg = 'rgba(249, 115, 22, 0.15)';
    badgeBorder = 'rgba(249, 115, 22, 0.3)';
  } else if (riskLevel === 'moderate') {
    strokeColor = '#f59e0b';
    badgeBg = 'rgba(245, 158, 11, 0.15)';
    badgeBorder = 'rgba(245, 158, 11, 0.3)';
  } else if (riskLevel === 'low') {
    strokeColor = '#0ea5e9';
    badgeBg = 'rgba(14, 165, 233, 0.15)';
    badgeBorder = 'rgba(14, 165, 233, 0.3)';
  }

  // Radial Gauge Geometry (SVG circumference = 2 * PI * r)
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probability / 100) * circumference;

  return (
    <div
      className="glass-card"
      style={{
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '260px',
          height: '260px',
          background: `radial-gradient(circle, ${strokeColor}22 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>
        <Snowflake size={16} color={strokeColor} />
        <span>Estimated Snow Day Probability</span>
      </div>

      {/* Radial Progress Gauge */}
      <div style={{ position: 'relative', width: '190px', height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="190" height="190" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle track (visible in both light & dark mode) */}
          <circle
            cx="95"
            cy="95"
            r={radius}
            fill="transparent"
            stroke="rgba(148, 163, 184, 0.3)"
            strokeWidth="12"
          />
          {/* Progress fill */}
          <circle
            cx="95"
            cy="95"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '3.2rem',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              lineHeight: 1,
              color: 'var(--text-primary)',
            }}
          >
            {probability}%
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: strokeColor,
              marginTop: '0.2rem',
              letterSpacing: '0.05em',
            }}
          >
            {riskLabel.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Risk Badge & Confidence Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div
          style={{
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: badgeBg,
            border: `1px solid ${badgeBorder}`,
            color: strokeColor,
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          {riskLabel} Probability
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
        >
          <CheckCircle size={13} color="#10b981" />
          <span>Confidence: <strong>{confidenceLabel}</strong></span>
        </div>
      </div>
    </div>
  );
};
