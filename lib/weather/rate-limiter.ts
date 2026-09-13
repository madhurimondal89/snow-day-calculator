import { ProviderId, PROVIDER_REGISTRY } from '@/config/weather-providers';

interface ProviderUsageCounters {
  minuteRequests: number[];
  hourRequests: number[];
  dayRequests: number[];
}

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
  usagePct: number;
  currentRpm: number;
  currentRph: number;
  currentRpd: number;
}

export class ProviderRateLimiter {
  private usage = new Map<ProviderId, ProviderUsageCounters>();

  private getOrCreateCounters(providerId: ProviderId): ProviderUsageCounters {
    let counters = this.usage.get(providerId);
    if (!counters) {
      counters = {
        minuteRequests: [],
        hourRequests: [],
        dayRequests: [],
      };
      this.usage.set(providerId, counters);
    }
    return counters;
  }

  private cleanOldTimestamps(timestamps: number[], windowMs: number, now: number): number[] {
    const cutoff = now - windowMs;
    return timestamps.filter((t) => t > cutoff);
  }

  /**
   * Check if the provider has remaining quota within rate limits
   */
  public checkLimit(providerId: ProviderId): RateLimitCheckResult {
    const config = PROVIDER_REGISTRY[providerId];
    if (!config || !config.rateLimits) {
      return { allowed: true, usagePct: 0, currentRpm: 0, currentRph: 0, currentRpd: 0 };
    }

    const now = Date.now();
    const counters = this.getOrCreateCounters(providerId);

    // Clean windows
    counters.minuteRequests = this.cleanOldTimestamps(counters.minuteRequests, 60 * 1000, now);
    counters.hourRequests = this.cleanOldTimestamps(counters.hourRequests, 60 * 60 * 1000, now);
    counters.dayRequests = this.cleanOldTimestamps(counters.dayRequests, 24 * 60 * 60 * 1000, now);

    const rpm = counters.minuteRequests.length;
    const rph = counters.hourRequests.length;
    const rpd = counters.dayRequests.length;

    const maxRpm = config.rateLimits.requestsPerMinute;
    const maxRph = config.rateLimits.requestsPerHour;
    const maxRpd = config.rateLimits.requestsPerDay;

    const rpmPct = (rpm / maxRpm) * 100;
    const rphPct = (rph / maxRph) * 100;
    const rpdPct = (rpd / maxRpd) * 100;

    const maxUsagePct = Math.max(rpmPct, rphPct, rpdPct);

    // Warning logging at 80% and 95% thresholds
    if (maxUsagePct >= 95 && maxUsagePct < 100) {
      console.warn(`[RateLimiter] CRITICAL: Provider ${providerId} is at ${maxUsagePct.toFixed(1)}% of rate limit quota!`);
    } else if (maxUsagePct >= 80 && maxUsagePct < 95) {
      console.warn(`[RateLimiter] WARNING: Provider ${providerId} is at ${maxUsagePct.toFixed(1)}% of rate limit quota.`);
    }

    if (rpm >= maxRpm) {
      return {
        allowed: false,
        reason: `Exceeded per-minute rate limit (${rpm}/${maxRpm} rpm)`,
        usagePct: 100,
        currentRpm: rpm,
        currentRph: rph,
        currentRpd: rpd,
      };
    }

    if (rph >= maxRph) {
      return {
        allowed: false,
        reason: `Exceeded per-hour rate limit (${rph}/${maxRph} rph)`,
        usagePct: 100,
        currentRpm: rpm,
        currentRph: rph,
        currentRpd: rpd,
      };
    }

    if (rpd >= maxRpd) {
      return {
        allowed: false,
        reason: `Exceeded per-day rate limit quota (${rpd}/${maxRpd} rpd)`,
        usagePct: 100,
        currentRpm: rpm,
        currentRph: rph,
        currentRpd: rpd,
      };
    }

    return {
      allowed: true,
      usagePct: Math.round(maxUsagePct),
      currentRpm: rpm,
      currentRph: rph,
      currentRpd: rpd,
    };
  }

  /**
   * Record a dispatched request
   */
  public recordRequest(providerId: ProviderId): void {
    const now = Date.now();
    const counters = this.getOrCreateCounters(providerId);

    counters.minuteRequests.push(now);
    counters.hourRequests.push(now);
    counters.dayRequests.push(now);
  }

  /**
   * Get current usage statistics for all providers
   */
  public getAllUsage(): Record<ProviderId, RateLimitCheckResult> {
    const result: Partial<Record<ProviderId, RateLimitCheckResult>> = {};
    for (const key of Object.keys(PROVIDER_REGISTRY) as ProviderId[]) {
      result[key] = this.checkLimit(key);
    }
    return result as Record<ProviderId, RateLimitCheckResult>;
  }
}

// Global ProviderRateLimiter singleton
const globalForLimiter = globalThis as unknown as { weatherRateLimiter?: ProviderRateLimiter };
export const providerRateLimiter = globalForLimiter.weatherRateLimiter ?? new ProviderRateLimiter();
if (process.env.NODE_ENV !== 'production') globalForLimiter.weatherRateLimiter = providerRateLimiter;
