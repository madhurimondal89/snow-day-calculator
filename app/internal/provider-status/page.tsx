'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, XCircle, Cpu, Zap } from 'lucide-react';

export default function ProviderStatusDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/internal/provider-status');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const getCircuitBadge = (state: string) => {
    switch (state) {
      case 'CLOSED':
        return (
          <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={12} /> CLOSED (Healthy)
          </span>
        );
      case 'HALF_OPEN':
        return (
          <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <AlertTriangle size={12} /> HALF-OPEN (Testing)
          </span>
        );
      case 'OPEN':
      default:
        return (
          <span style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <XCircle size={12} /> OPEN (Tripped)
          </span>
        );
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            <Cpu size={16} />
            <span>Internal Telemetry & Health</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Weather Provider Routing & Health Status</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Live circuit breaker states, request rate limits, latency metrics, and commercial eligibility.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStatus}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh ({lastRefreshed.toLocaleTimeString()})</span>
        </button>
      </div>

      {/* Commercial Policy Mode Indicator */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={20} color="var(--brand-emerald)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Commercial Mode: {data?.siteCommercial ? 'STRICT COMMERCIAL (SITE_COMMERCIAL=true)' : 'STANDARD / PERMISSIVE'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {data?.siteCommercial
                ? 'Providers with non-commercial license restrictions on free endpoints are automatically bypassed.'
                : 'All enabled providers evaluated by priority.'}
            </div>
          </div>
        </div>
      </div>

      {/* Provider Status Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {data?.providers?.map((p: any) => (
          <div
            key={p.id}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Top row: Name, ID, Circuit badge, Health score */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{p.name}</h2>
                <code style={{ fontSize: '0.75rem', background: 'var(--bg-glass)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
                  {p.id}
                </code>
                {getCircuitBadge(p.circuitState)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Health Score: </span>
                  <strong style={{ color: p.healthScore > 80 ? '#10b981' : p.healthScore > 50 ? '#f59e0b' : '#ef4444' }}>
                    {p.healthScore}%
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Avg Latency: </span>
                  <strong>{p.averageLatencyMs} ms</strong>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
                background: 'var(--bg-glass)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Regional Affinity</div>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{p.regions.join(', ')}</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)' }}>Key Configured</div>
                <div style={{ fontWeight: 600, marginTop: '0.2rem', color: p.isConfigured ? '#10b981' : '#f59e0b' }}>
                  {p.requiresApiKey ? (p.isConfigured ? 'API Key Active' : 'No Key Set (Skipped)') : 'No Key Required (Open)'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)' }}>Commercial Free</div>
                <div style={{ fontWeight: 600, marginTop: '0.2rem', color: p.commercialAllowed ? '#10b981' : '#ef4444' }}>
                  {p.commercialAllowed ? 'Permitted' : 'Prohibited on Free Tier'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)' }}>Requests / Successes</div>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>
                  {p.totalRequests} req ({p.successCount} OK / {p.failureCount} Fail)
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)' }}>Rate Limit Usage</div>
                <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>
                  {p.rateLimitUsage?.currentRpm || 0} / {p.rateLimits?.requestsPerMinute} rpm
                </div>
              </div>
            </div>

            {/* Last failure note if any */}
            {p.lastFailureReason && (
              <div style={{ fontSize: '0.75rem', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                Last failure ({p.lastFailure ? new Date(p.lastFailure).toLocaleTimeString() : ''}): {p.lastFailureReason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
