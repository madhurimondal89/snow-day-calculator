import { ProviderId } from '@/config/weather-providers';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Consecutive failures before OPEN (default: 5)
  cooldownMs?: number; // Time in ms before transitioning from OPEN to HALF_OPEN (default: 60000)
}

interface ProviderCircuitRecord {
  state: CircuitState;
  consecutiveFailures: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  nextAttemptAllowedAt: number;
}

export class CircuitBreaker {
  private failureThreshold: number;
  private cooldownMs: number;
  private circuits = new Map<ProviderId, ProviderCircuitRecord>();

  constructor(options?: CircuitBreakerOptions) {
    this.failureThreshold = options?.failureThreshold || 5;
    this.cooldownMs = options?.cooldownMs || 60000;
  }

  private getOrCreateRecord(providerId: ProviderId): ProviderCircuitRecord {
    let record = this.circuits.get(providerId);
    if (!record) {
      record = {
        state: 'CLOSED',
        consecutiveFailures: 0,
        lastFailureTime: 0,
        lastSuccessTime: 0,
        nextAttemptAllowedAt: 0,
      };
      this.circuits.set(providerId, record);
    }
    return record;
  }

  /**
   * Check if a request is permitted for the given provider
   */
  public canExecute(providerId: ProviderId): boolean {
    const record = this.getOrCreateRecord(providerId);
    const now = Date.now();

    if (record.state === 'CLOSED') {
      return true;
    }

    if (record.state === 'OPEN') {
      if (now >= record.nextAttemptAllowedAt) {
        // Cooldown period passed, allow single probe in HALF_OPEN state
        record.state = 'HALF_OPEN';
        return true;
      }
      return false; // Circuit is still open, reject execution
    }

    if (record.state === 'HALF_OPEN') {
      return true;
    }

    return true;
  }

  /**
   * Record a successful response from the provider
   */
  public recordSuccess(providerId: ProviderId): void {
    const record = this.getOrCreateRecord(providerId);
    record.state = 'CLOSED';
    record.consecutiveFailures = 0;
    record.lastSuccessTime = Date.now();
    record.nextAttemptAllowedAt = 0;
  }

  /**
   * Record a failed response from the provider
   */
  public recordFailure(providerId: ProviderId): void {
    const record = this.getOrCreateRecord(providerId);
    const now = Date.now();

    record.consecutiveFailures += 1;
    record.lastFailureTime = now;

    if (record.state === 'HALF_OPEN') {
      // Failed probe in HALF_OPEN immediately re-opens the circuit with exponential/standard cooldown
      record.state = 'OPEN';
      record.nextAttemptAllowedAt = now + this.cooldownMs;
    } else if (record.consecutiveFailures >= this.failureThreshold) {
      // Tripped failure threshold
      record.state = 'OPEN';
      record.nextAttemptAllowedAt = now + this.cooldownMs;
    }
  }

  /**
   * Get the current circuit state
   */
  public getState(providerId: ProviderId): CircuitState {
    const record = this.getOrCreateRecord(providerId);
    const now = Date.now();

    if (record.state === 'OPEN' && now >= record.nextAttemptAllowedAt) {
      return 'HALF_OPEN';
    }
    return record.state;
  }

  /**
   * Manually reset a circuit for a provider
   */
  public reset(providerId: ProviderId): void {
    const record = this.getOrCreateRecord(providerId);
    record.state = 'CLOSED';
    record.consecutiveFailures = 0;
    record.nextAttemptAllowedAt = 0;
  }

  /**
   * Get all circuit statuses
   */
  public getAllStatus(): Record<ProviderId, { state: CircuitState; consecutiveFailures: number; nextAttemptAllowedAt: number }> {
    const result: Partial<Record<ProviderId, { state: CircuitState; consecutiveFailures: number; nextAttemptAllowedAt: number }>> = {};
    for (const [id, rec] of this.circuits.entries()) {
      result[id] = {
        state: this.getState(id),
        consecutiveFailures: rec.consecutiveFailures,
        nextAttemptAllowedAt: rec.nextAttemptAllowedAt,
      };
    }
    return result as Record<ProviderId, { state: CircuitState; consecutiveFailures: number; nextAttemptAllowedAt: number }>;
  }
}

// Global CircuitBreaker singleton
const globalForCircuit = globalThis as unknown as { weatherCircuitBreaker?: CircuitBreaker };
export const circuitBreaker = globalForCircuit.weatherCircuitBreaker ?? new CircuitBreaker();
if (process.env.NODE_ENV !== 'production') globalForCircuit.weatherCircuitBreaker = circuitBreaker;
