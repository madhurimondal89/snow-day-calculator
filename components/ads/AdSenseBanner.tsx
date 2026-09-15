'use client';

import React, { useEffect, useRef } from 'react';

interface AdSenseBannerProps {
  /**
   * AdSense Ad Slot ID from your Google AdSense Dashboard.
   * If not provided or left blank, it will default to responsive display ad.
   */
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slot = '7021668643', // Weather Ad Unit Slot ID
  format = 'auto',
  responsive = true,
  className = '',
  style = {},
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    // Only execute on browser side and once per component lifecycle
    if (typeof window === 'undefined' || isLoadedRef.current) return;

    try {
      // Check if adsbygoogle exists or initialize array
      const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || [];
      adsbygoogle.push({});
      (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = adsbygoogle;
      isLoadedRef.current = true;
    } catch (error) {
      // AdSense might throw if already loaded or blocked by ad blocker
      console.warn('[AdSense] Failed to push ad unit:', error);
    }
  }, []);

  return (
    <div
      className={`adsense-container ${className}`}
      style={{
        margin: '2rem auto',
        width: '100%',
        maxWidth: '970px',
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '0.75rem 0.5rem',
        minHeight: '110px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        backdropFilter: 'blur(8px)',
        ...style,
      }}
    >
      {/* Non-intrusive tiny disclaimer label required by Google policy */}
      <span
        style={{
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted, #94a3b8)',
          marginBottom: '0.4rem',
          display: 'block',
          userSelect: 'none',
          opacity: 0.75,
        }}
      >
        Advertisement
      </span>

      {/* AdSense Unit Box */}
      <div style={{ width: '100%', overflow: 'hidden', minHeight: '90px' }}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
          }}
          data-ad-client="ca-pub-8732458645979427"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
};
