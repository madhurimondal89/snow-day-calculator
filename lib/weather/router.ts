import { ProviderId, WeatherDataType, PROVIDER_REGISTRY, ProviderConfig } from '@/config/weather-providers';
import { circuitBreaker } from './circuit-breaker';
import { providerRateLimiter } from './rate-limiter';
import { WeatherProvider } from './providers/weather-provider.interface';
import { MetNorwayProvider } from './providers/met-norway';
import { NoaaProvider } from './providers/noaa';
import { WeatherApiProvider } from './providers/weatherapi';
import { VisualCrossingProvider } from './providers/visualcrossing';
import { WeatherMetroProvider } from './providers/weathermetro';
import { FmiProvider } from './providers/fmi';
import { MscGeometProvider } from './providers/msc-geomet';
import { MetOfficeProvider } from './providers/met-office';
import { OpenMeteoProvider } from './providers/open-meteo';

export interface RouteSelectionInput {
  latitude: number;
  longitude: number;
  countryCode?: string; // Target weather location country code (e.g. 'US', 'IN', 'CA', 'GB', 'NO', 'FI')
  dataType?: WeatherDataType; // default: 'forecast'
  siteCommercial?: boolean; // default: read from env SITE_COMMERCIAL
}

export interface CandidateEvaluationResult {
  providerId: ProviderId;
  config: ProviderConfig;
  priority: number;
  eligible: boolean;
  rejectionReason?: string;
  providerInstance?: WeatherProvider;
}

export class ProviderRouter {
  private instances = new Map<ProviderId, WeatherProvider>();

  constructor() {
    this.initProviders();
  }

  private initProviders() {
    this.instances.set('metno', new MetNorwayProvider());
    this.instances.set('noaa', new NoaaProvider());
    this.instances.set('weatherapi', new WeatherApiProvider());
    this.instances.set('visualcrossing', new VisualCrossingProvider());
    this.instances.set('weathermetro', new WeatherMetroProvider());
    this.instances.set('fmi', new FmiProvider());
    this.instances.set('msc_geomet', new MscGeometProvider());
    this.instances.set('metoffice', new MetOfficeProvider());
    this.instances.set('openmeteo', new OpenMeteoProvider());
  }

  public getProviderInstance(providerId: ProviderId): WeatherProvider | undefined {
    return this.instances.get(providerId);
  }

  /**
   * Check environment enable flag for provider
   */
  private isProviderEnabledInEnv(providerId: ProviderId): boolean {
    switch (providerId) {
      case 'metno':
        return process.env.METNO_ENABLED !== 'false';
      case 'noaa':
        return process.env.NOAA_ENABLED !== 'false';
      case 'weatherapi':
        return process.env.WEATHERAPI_ENABLED !== 'false';
      case 'weathermetro':
        return process.env.WEATHERMETRO_ENABLED === 'true';
      case 'visualcrossing':
        return process.env.VISUALCROSSING_ENABLED !== 'false';
      case 'metoffice':
        return process.env.METOFFICE_ENABLED !== 'false';
      case 'fmi':
        return process.env.FMI_ENABLED !== 'false';
      case 'msc_geomet':
        return process.env.MSC_GEOMET_ENABLED !== 'false';
      case 'openmeteo':
        return process.env.OPENMETEO_ENABLED === 'true';
      default:
        return true;
    }
  }

  /**
   * Check if required API key is present in environment
   */
  private hasRequiredApiKey(config: ProviderConfig): boolean {
    if (!config.requiresApiKey) return true;
    if (!config.apiKeyEnvVar) return true;
    const key = process.env[config.apiKeyEnvVar];
    return typeof key === 'string' && key.trim().length > 0;
  }

  /**
   * Determine priority score of provider for the given country
   */
  public getPriorityForLocation(providerId: ProviderId, countryCode?: string): number {
    const config = PROVIDER_REGISTRY[providerId];
    if (!config) return 999;

    const normalizedCountry = (countryCode || '').toUpperCase().trim();

    if (normalizedCountry && config.priorityByRegion[normalizedCountry] !== undefined) {
      return config.priorityByRegion[normalizedCountry];
    }

    if (config.priorityByRegion['GLOBAL'] !== undefined) {
      return config.priorityByRegion['GLOBAL'];
    }

    return config.defaultPriority;
  }

  /**
   * Check if provider supports the requested geographic region
   */
  public supportsRegion(config: ProviderConfig, countryCode?: string): boolean {
    if (config.regions.includes('GLOBAL')) return true;
    const normalizedCountry = (countryCode || '').toUpperCase().trim();
    if (!normalizedCountry) return false;
    return config.regions.includes(normalizedCountry);
  }

  /**
   * Evaluate all candidate providers and return eligible providers sorted by priority
   */
  public selectCandidateProviders(input: RouteSelectionInput): CandidateEvaluationResult[] {
    const { countryCode, dataType = 'forecast' } = input;
    const siteCommercial =
      input.siteCommercial !== undefined
        ? input.siteCommercial
        : process.env.SITE_COMMERCIAL === 'true';

    const normalizedCountry = (countryCode || '').toUpperCase().trim();
    const allProviderIds = Object.keys(PROVIDER_REGISTRY) as ProviderId[];

    const evaluations: CandidateEvaluationResult[] = allProviderIds.map((providerId) => {
      const config = PROVIDER_REGISTRY[providerId];
      const priority = this.getPriorityForLocation(providerId, normalizedCountry);

      // 1. Check enabled in environment
      if (!this.isProviderEnabledInEnv(providerId)) {
        return {
          providerId,
          config,
          priority,
          eligible: false,
          rejectionReason: 'Disabled via environment configuration',
        };
      }

      // 2. Check API key requirement
      if (!this.hasRequiredApiKey(config)) {
        return {
          providerId,
          config,
          priority,
          eligible: false,
          rejectionReason: `Missing required API key (${config.apiKeyEnvVar})`,
        };
      }

      // 3. Check commercial-use policy
      if (siteCommercial && !config.commercialAllowed) {
        // Special case for Open-Meteo: only allowed if mode is self-hosted or commercial
        if (providerId === 'openmeteo') {
          const openMeteoMode = process.env.OPENMETEO_MODE || 'public';
          if (openMeteoMode !== 'self-hosted' && openMeteoMode !== 'commercial') {
            return {
              providerId,
              config,
              priority,
              eligible: false,
              rejectionReason: 'Commercial mode enabled: Free public endpoint prohibited under current terms',
            };
          }
        } else {
          return {
            providerId,
            config,
            priority,
            eligible: false,
            rejectionReason: 'Commercial mode enabled: Provider does not permit commercial use on current tier',
          };
        }
      }

      // 4. Check regional coverage
      if (!this.supportsRegion(config, normalizedCountry)) {
        return {
          providerId,
          config,
          priority,
          eligible: false,
          rejectionReason: `Provider does not support target region (${normalizedCountry || 'UNKNOWN'})`,
        };
      }

      // 5. Check capability for data type
      if (!config.capabilities.includes(dataType)) {
        return {
          providerId,
          config,
          priority,
          eligible: false,
          rejectionReason: `Provider does not support requested data type (${dataType})`,
        };
      }

      // 6. Check Circuit Breaker state
      if (!circuitBreaker.canExecute(providerId)) {
        return {
          providerId,
          config,
          priority,
          eligible: false,
          rejectionReason: `Circuit breaker is OPEN (cooldown active)`,
        };
      }

      // 7. Check local rate limit
      const rateCheck = providerRateLimiter.checkLimit(providerId);
      if (!rateCheck.allowed) {
        return {
          providerId,
          config,
          priority,
          eligible: false,
          rejectionReason: `Local rate limit exceeded: ${rateCheck.reason}`,
        };
      }

      return {
        providerId,
        config,
        priority,
        eligible: true,
        providerInstance: this.instances.get(providerId),
      };
    });

    // Filter only eligible providers and sort strictly by regional priority ascending (1 is highest)
    const eligible = evaluations
      .filter((e) => e.eligible)
      .sort((a, b) => a.priority - b.priority);

    return eligible;
  }
}

// Global ProviderRouter singleton
const globalForRouter = globalThis as unknown as { weatherProviderRouter?: ProviderRouter };
export const providerRouter = globalForRouter.weatherProviderRouter ?? new ProviderRouter();
if (process.env.NODE_ENV !== 'production') globalForRouter.weatherProviderRouter = providerRouter;
