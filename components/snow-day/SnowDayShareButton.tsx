'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { LocationInfo } from '@/lib/weather/types/weather';

interface SnowDayShareButtonProps {
  location: LocationInfo;
  probability: number;
}

export const SnowDayShareButton: React.FC<SnowDayShareButtonProps> = ({ location, probability }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const title = `Snow Day Calculator: ${probability}% chance for ${location.name}`;
    const text = `Forecast probability of a snow day in ${location.name}: ${probability}%. Check the detailed breakdown on Weather Hub!`;
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.55rem 1.1rem',
        borderRadius: 'var(--radius-full)',
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background var(--transition-fast), border-color var(--transition-fast)',
      }}
    >
      {copied ? (
        <>
          <Check size={14} color="#10b981" />
          <span style={{ color: '#10b981' }}>Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>Share Result</span>
        </>
      )}
    </button>
  );
};
