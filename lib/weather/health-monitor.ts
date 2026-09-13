import { ProviderId, PROVIDER_REGISTRY } from '@/config/weather-providers';
import { circuitBreaker, CircuitState } from './circuit-breaker';

export interface ProviderHealthMetrics {
  providerId: ProviderId;
  name: string;
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
  totalRequests: number;
  averageLatencyMs: number;
  lastLatencyMs?: number;
  lastSuccess?: string;
  lastFailure?: string;
  lastFailureReason?: string;
  circuitState: CircuitState;
  healthScore: number; // 0 to 100
}

interface InternalMetricsRecord {
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
  totalLatencyMs: number;
  latencySamples: number;
  lastLatencyMs?: number;
  lastSuccess?: number;
  lastFailure?: number;
  lastFailureReason?: string;
}

export class HealthMonitor {
  private metrics = new Map<ProviderId, InternalMetricsRecord>();

  private getOrCreateRecord(providerId: ProviderId): InternalMetricsRecord {
    let rec = this.metrics.get(providerId);
    if (!rec) {
      rec = {
        successCount: 0,
        failureCount: 0,
        consecutiveFailures: 0,
        totalLatencyMs: 0,
        latencySamples: 0,
      };
      this.metrics.set(providerId, rec);
    }
    return rec;
  }

  public recordSuccess(providerId: ProviderId, latencyMs: number): void {
    const rec = this.getOrCreateRecord(providerId);
    rec.successCount += 1;
    rec.consecutiveFailures = 0;
    rec.totalLatencyMs += latencyMs;
    rec.latencySamples += 1;
    rec.lastLatencyMs = latencyMs;
    rec.lastSuccess = Date.now();

    circuitBreaker.recordSuccess(providerId);
  }

  public recordFailure(providerId: ProviderId, reason: string): void {
    const rec = this.getOrCreateRecord(providerId);
    rec.failureCount += 1;
    rec.consecutiveFailures += 1;
    rec.lastFailure = Date.now();
    rec.lastFailureReason = reason;

    circuitBreaker.recordFailure(providerId);
  }

  public getMetrics(providerId: ProviderId): ProviderHealthMetrics {
    const config = PROVIDER_REGISTRY[providerId];
    const rec = this.getOrCreateRecord(providerId);
    const circuitState = circuitBreaker.getState(providerId);
    const totalRequests = rec.successCount + rec.failureCount;
    const avgLatency = rec.latencySamples > 0 ? Math.round(rec.totalLatencyMs / rec.latencySamples) : 0;

    // Calculate dynamic health score (0-100)
    let healthScore = 100;
    if (circuitState === 'OPEN') {
      healthScore = 0;
    } else if (circuitState === 'HALF_OPEN') {
      healthScore = 40;
    } else if (totalRequests > 0) {
      const successRate = (rec.successCount / totalRequests) * 100;
      healthScore = Math.round(successRate);
    }

    return {
      providerId,
      name: config?.name || providerId,
      successCount: rec.successCount,
      failureCount: rec.failureCount,
      consecutiveFailures: rec.consecutiveFailures,
      totalRequests,
      averageLatencyMs: avgLatency,
      lastLatencyMs: rec.lastLatencyMs,
      lastSuccess: rec.lastSuccess ? new Date(rec.lastSuccess).toISOString() : undefined,
      lastFailure: rec.lastFailure ? new Date(rec.lastFailure).toISOString() : undefined,
      lastFailureReason: rec.lastFailureReason,
      circuitState,
      healthScore,
    };
  }

  public getAllMetrics(): Record<ProviderId, ProviderHealthMetrics> {
    const result: Partial<Record<ProviderId, ProviderHealthMetrics>> = {};
    for (const key of Object.keys(PROVIDER_REGISTRY) as ProviderId[]) {
      result[key] = this.getMetrics(key);
    }
    return result as Record<ProviderId, ProviderHealthMetrics>;
  }
}

// Global HealthMonitor singleton
const globalForHealth = globalThis as unknown as { weatherHealthMonitor?: HealthMonitor };
export const healthMonitor = globalForHealth.weatherHealthMonitor ?? new HealthMonitor();
if (process.env.NODE_ENV !== 'production') globalForHealth.weatherHealthMonitor = healthMonitor;
