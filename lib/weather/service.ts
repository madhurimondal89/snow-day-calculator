import { providerRouter } from './router';
import { healthMonitor } from './health-monitor';
import { providerRateLimiter } from './rate-limiter';
import { weatherCache } from './cache';
import { AirQualityProvider } from './providers/air-quality';
import { WeatherData, LocationInfo } from './types/weather';
import { PROVIDER_REGISTRY } from '@/config/weather-providers';

export class WeatherService {
  private airQualityProvider: AirQualityProvider;
  private cacheTtlSeconds: number;

  constructor() {
    this.airQualityProvider = new AirQualityProvider();
    this.cacheTtlSeconds = Number(process.env.WEATHER_CACHE_SECONDS || 900);
  }

  public validateCoordinates(lat: number, lon: number): { valid: boolean; error?: string } {
    if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
      return { valid: false, error: 'Coordinates must be valid numbers' };
    }
    if (lat < -90 || lat > 90) {
      return { valid: false, error: 'Latitude must be between -90 and 90' };
    }
    if (lon < -180 || lon > 180) {
      return { valid: false, error: 'Longitude must be between -180 and 180' };
    }
    return { valid: true };
  }

  /**
   * Validate essential weather response quality before accepting provider data
   */
  private validateResponseQuality(data: WeatherData | null | undefined): boolean {
    if (!data || !data.current || !data.location) {
      return false;
    }
    if (typeof data.current.temp !== 'number' || isNaN(data.current.temp)) {
      return false;
    }
    if (!data.current.condition || !data.current.time) {
      return false;
    }
    if (!data.hourly || data.hourly.length === 0) {
      return false;
    }
    return true;
  }

  /**
   * Main unified entry point with routing, priority, health monitoring, circuit breakers, rate limits, and fallback
   */
  public async getWeather(
    lat: number,
    lon: number,
    locationInfo?: Partial<LocationInfo>,
    debug = false
  ): Promise<WeatherData> {
    const validation = this.validateCoordinates(lat, lon);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid coordinates');
    }

    // Standardize coordinate precision to 3 decimals for cache hit optimization (~100m)
    const cacheKey = `weather:${lat.toFixed(3)}:${lon.toFixed(3)}:forecast`;

    // 1. Check Fresh Cache
    const cached = weatherCache.get<WeatherData>(cacheKey);
    if (cached) {
      if (locationInfo?.name && locationInfo.name !== cached.location.name) {
        return {
          ...cached,
          location: { ...cached.location, ...locationInfo },
        };
      }
      if (debug) {
        cached.metadata.debugInfo = {
          selectedProvider: cached.metadata.providerId || cached.metadata.providerName,
          latencyMs: 0,
          cacheHit: true,
          isFallback: cached.metadata.isFallback,
        };
      }
      return cached;
    }

    // 2. Select eligible candidate providers from ProviderRouter
    const countryCode = locationInfo?.countryCode;
    const candidates = providerRouter.selectCandidateProviders({
      latitude: lat,
      longitude: lon,
      countryCode,
      dataType: 'forecast',
    });

    if (candidates.length === 0) {
      console.warn(`[WeatherService] No eligible providers configured for country: ${countryCode || 'GLOBAL'}`);
      // Try stale cache before failing
      const stale = weatherCache.getStale<WeatherData>(cacheKey);
      if (stale) {
        return {
          ...stale.data,
          metadata: {
            ...stale.data.metadata,
            isStale: true,
            staleCachedAt: stale.cachedAt,
          },
        };
      }
      throw new Error('No weather provider is currently eligible for the requested region and commercial policy.');
    }

    let weatherData: WeatherData | null = null;
    let selectedProviderId = '';
    let usedFallback = false;
    let initialProviderId = candidates[0].providerId;
    let requestDurationMs = 0;

    // 3. Attempt candidates in priority order (1 attempt per provider)
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const provider = candidate.providerInstance;
      if (!provider) continue;

      const startTime = Date.now();
      try {
        // Record local rate limiter count
        providerRateLimiter.recordRequest(candidate.providerId);

        // Fetch data with provider timeout
        const result = await provider.getWeatherData(lat, lon, locationInfo);
        requestDurationMs = Date.now() - startTime;

        // Validate response quality
        if (!this.validateResponseQuality(result)) {
          throw new Error(`Provider ${candidate.providerId} returned incomplete or invalid weather schema`);
        }

        // Record health monitor success
        healthMonitor.recordSuccess(candidate.providerId, requestDurationMs);

        weatherData = result;
        selectedProviderId = candidate.providerId;
        usedFallback = i > 0;

        weatherData.metadata.providerId = candidate.providerId;
        weatherData.metadata.isFallback = usedFallback;
        if (usedFallback) {
          weatherData.metadata.fallbackFrom = initialProviderId;
        }

        // Structured observability log
        console.log(
          JSON.stringify({
            level: 'INFO',
            type: 'weather_fetch',
            provider: candidate.providerId,
            success: true,
            durationMs: requestDurationMs,
            fallbackUsed: usedFallback,
            fallbackFrom: usedFallback ? initialProviderId : undefined,
            cacheHit: false,
            countryCode: countryCode || 'GLOBAL',
          })
        );

        break; // Successfully obtained weather data
      } catch (providerError: unknown) {
        requestDurationMs = Date.now() - startTime;
        const errorMessage = providerError instanceof Error ? providerError.message : String(providerError);

        // Record health monitor failure & trip circuit if threshold exceeded
        healthMonitor.recordFailure(candidate.providerId, errorMessage);

        console.warn(
          JSON.stringify({
            level: 'WARN',
            type: 'weather_provider_failure',
            provider: candidate.providerId,
            durationMs: requestDurationMs,
            error: errorMessage,
            countryCode: countryCode || 'GLOBAL',
          })
        );

        // Continue to next candidate
      }
    }

    // 4. If all candidates fail, attempt Stale Cache fallback
    if (!weatherData) {
      const stale = weatherCache.getStale<WeatherData>(cacheKey);
      if (stale) {
        console.warn(`[WeatherService] All live providers failed. Serving stale cached weather for ${cacheKey}.`);
        return {
          ...stale.data,
          metadata: {
            ...stale.data.metadata,
            isStale: true,
            staleCachedAt: stale.cachedAt,
          },
        };
      }

      throw new Error('Weather data is temporarily unavailable from all meteorological providers. Please try again in a few moments.');
    }

    // 5. Fetch Air Quality data non-blocking if not already provided
    if (!weatherData.airQuality) {
      try {
        const aqi = await this.airQualityProvider.getAirQuality(lat, lon);
        if (aqi) {
          weatherData.airQuality = aqi;
        }
      } catch (aqiErr) {
        console.warn('[WeatherService] Air quality fetch note:', aqiErr);
      }
    }

    // 6. Attach debug info if requested
    if (debug) {
      weatherData.metadata.debugInfo = {
        selectedProvider: selectedProviderId,
        latencyMs: requestDurationMs,
        cacheHit: false,
        isFallback: usedFallback,
      };
    }

    // 7. Store in in-memory Fresh Cache & 24h Stale Cache
    weatherCache.set(cacheKey, weatherData, this.cacheTtlSeconds, 86400);

    return weatherData;
  }
}

// Global weather service singleton
const globalForService = globalThis as unknown as { weatherService?: WeatherService };
export const weatherService = globalForService.weatherService ?? new WeatherService();
if (process.env.NODE_ENV !== 'production') globalForService.weatherService = weatherService;
