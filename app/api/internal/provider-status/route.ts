import { NextResponse } from 'next/server';
import { PROVIDER_REGISTRY, ProviderId } from '@/config/weather-providers';
import { healthMonitor } from '@/lib/weather/health-monitor';
import { circuitBreaker } from '@/lib/weather/circuit-breaker';
import { providerRateLimiter } from '@/lib/weather/rate-limiter';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteCommercial = process.env.SITE_COMMERCIAL === 'true';
  const allMetrics = healthMonitor.getAllMetrics();
  const allCircuits = circuitBreaker.getAllStatus();
  const allRateLimits = providerRateLimiter.getAllUsage();

  const providers = (Object.keys(PROVIDER_REGISTRY) as ProviderId[]).map((id) => {
    const config = PROVIDER_REGISTRY[id];
    const metrics = allMetrics[id];
    const circuit = allCircuits[id];
    const rate = allRateLimits[id];

    const hasKey = config.requiresApiKey
      ? Boolean(config.apiKeyEnvVar && process.env[config.apiKeyEnvVar])
      : true;

    return {
      id,
      name: config.name,
      regions: config.regions,
      defaultPriority: config.defaultPriority,
      capabilities: config.capabilities,
      requiresApiKey: config.requiresApiKey,
      isConfigured: hasKey,
      commercialAllowed: config.commercialAllowed,
      commercialEligible: siteCommercial ? config.commercialAllowed : true,
      circuitState: circuit?.state || 'CLOSED',
      consecutiveFailures: circuit?.consecutiveFailures || 0,
      healthScore: metrics?.healthScore ?? 100,
      successCount: metrics?.successCount ?? 0,
      failureCount: metrics?.failureCount ?? 0,
      totalRequests: metrics?.totalRequests ?? 0,
      averageLatencyMs: metrics?.averageLatencyMs ?? 0,
      lastLatencyMs: metrics?.lastLatencyMs,
      lastSuccess: metrics?.lastSuccess,
      lastFailure: metrics?.lastFailure,
      lastFailureReason: metrics?.lastFailureReason,
      rateLimitUsage: rate,
      rateLimits: config.rateLimits,
      attributionText: config.attributionText,
    };
  });

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      siteCommercial,
      providers,
    },
    { status: 200 }
  );
}
