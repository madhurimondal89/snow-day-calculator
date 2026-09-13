export type ProviderId =
  | 'metno'
  | 'noaa'
  | 'weatherapi'
  | 'weathermetro'
  | 'visualcrossing'
  | 'metoffice'
  | 'fmi'
  | 'msc_geomet'
  | 'openmeteo';

export type WeatherDataType = 'current' | 'hourly' | 'forecast' | 'alerts' | 'airQuality' | 'historical';

export interface ProviderRateLimits {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  description: string;
  regions: string[]; // ISO country codes or 'GLOBAL'
  priorityByRegion: Record<string, number>; // Region -> Priority (1 is highest)
  defaultPriority: number; // Fallback priority if region not matched
  capabilities: WeatherDataType[];
  requiresApiKey: boolean;
  apiKeyEnvVar?: string;
  commercialAllowed: boolean; // Is commercial use permitted on the public/free tier?
  rateLimits: ProviderRateLimits;
  timeoutMs: number;
  cacheTTL: number; // seconds
  attributionText: string;
  attributionUrl: string;
  docUrl: string;
  termsNotes: string;
}

export const PROVIDER_REGISTRY: Record<ProviderId, ProviderConfig> = {
  metno: {
    id: 'metno',
    name: 'MET Norway',
    description: 'Official Locationforecast 2.0 API from the Norwegian Meteorological Institute',
    regions: ['GLOBAL', 'NO', 'IN', 'US', 'CA', 'GB', 'FI'],
    priorityByRegion: {
      NO: 1,
      IN: 1,
      US: 2,
      CA: 2,
      GB: 2,
      FI: 2,
      GLOBAL: 1,
    },
    defaultPriority: 1,
    capabilities: ['current', 'hourly', 'forecast'],
    requiresApiKey: false,
    commercialAllowed: true, // MET Norway terms permit free access with valid User-Agent & caching
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 1200,
      requestsPerDay: 20000,
    },
    timeoutMs: 4000,
    cacheTTL: 900,
    attributionText: 'Weather forecast from MET Norway (api.met.no)',
    attributionUrl: 'https://api.met.no/',
    docUrl: 'https://api.met.no/doc/Locationforecast',
    termsNotes: 'Free for commercial and non-commercial use with custom User-Agent and HTTP header caching compliance.',
  },

  noaa: {
    id: 'noaa',
    name: 'NOAA / National Weather Service',
    description: 'National Oceanic and Atmospheric Administration Weather API (USA coverage)',
    regions: ['US'],
    priorityByRegion: {
      US: 1,
    },
    defaultPriority: 99,
    capabilities: ['current', 'hourly', 'forecast', 'alerts'],
    requiresApiKey: false,
    commercialAllowed: true, // US Public Domain data
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 2000,
      requestsPerDay: 30000,
    },
    timeoutMs: 4000,
    cacheTTL: 900,
    attributionText: 'Data provided by NOAA / National Weather Service (weather.gov)',
    attributionUrl: 'https://www.weather.gov/',
    docUrl: 'https://www.weather.gov/documentation/services-web-api',
    termsNotes: 'Public domain US government work. Free for commercial use with descriptive User-Agent.',
  },

  msc_geomet: {
    id: 'msc_geomet',
    name: 'Environment Canada / MSC GeoMet',
    description: 'Meteorological Service of Canada Open Data OGC API',
    regions: ['CA'],
    priorityByRegion: {
      CA: 1,
    },
    defaultPriority: 99,
    capabilities: ['current', 'hourly', 'forecast', 'alerts'],
    requiresApiKey: false,
    commercialAllowed: true, // Open Government Licence - Canada
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 1500,
      requestsPerDay: 25000,
    },
    timeoutMs: 4500,
    cacheTTL: 900,
    attributionText: 'Contains information licensed under Open Government Licence – Canada (MSC GeoMet)',
    attributionUrl: 'https://eccc-msc.github.io/open-data/msc-geomet/readme_en/',
    docUrl: 'https://api.weather.gc.ca/',
    termsNotes: 'Licensed under Open Government Licence - Canada. Commercial use permitted.',
  },

  fmi: {
    id: 'fmi',
    name: 'Finnish Meteorological Institute (FMI)',
    description: 'FMI Open Data WFS API for Finland & Nordic regions',
    regions: ['FI'],
    priorityByRegion: {
      FI: 1,
    },
    defaultPriority: 99,
    capabilities: ['current', 'hourly', 'forecast'],
    requiresApiKey: false,
    commercialAllowed: true, // Creative Commons Attribution 4.0
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 1200,
      requestsPerDay: 20000,
    },
    timeoutMs: 4500,
    cacheTTL: 900,
    attributionText: 'Meteorological data from Finnish Meteorological Institute (FMI)',
    attributionUrl: 'https://en.ilmatieteenlaitos.fi/open-data',
    docUrl: 'https://en.ilmatieteenlaitos.fi/open-data-manual',
    termsNotes: 'Open Data CC-BY 4.0. Free for commercial and non-commercial use.',
  },

  metoffice: {
    id: 'metoffice',
    name: 'UK Met Office',
    description: 'UK Met Office DataPoint API (UK & Global spot forecasts)',
    regions: ['GB', 'GLOBAL'],
    priorityByRegion: {
      GB: 1,
      GLOBAL: 5,
    },
    defaultPriority: 5,
    capabilities: ['current', 'hourly', 'forecast'],
    requiresApiKey: true,
    apiKeyEnvVar: 'METOFFICE_API_KEY',
    commercialAllowed: true,
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 600,
      requestsPerDay: 10000,
    },
    timeoutMs: 4000,
    cacheTTL: 1800,
    attributionText: 'Contains public sector information licensed under the Open Government Licence (UK Met Office)',
    attributionUrl: 'https://www.metoffice.gov.uk/services/data/datapoint',
    docUrl: 'https://www.metoffice.gov.uk/services/data/datapoint/api-reference',
    termsNotes: 'Requires API key. Open Government Licence allows commercial usage.',
  },

  weatherapi: {
    id: 'weatherapi',
    name: 'WeatherAPI',
    description: 'WeatherAPI.com Realtime & Forecast API',
    regions: ['GLOBAL', 'US', 'CA', 'NO', 'FI', 'GB', 'IN'],
    priorityByRegion: {
      GLOBAL: 2,
      US: 3,
      CA: 3,
      NO: 2,
      FI: 3,
      GB: 3,
      IN: 2,
    },
    defaultPriority: 2,
    capabilities: ['current', 'hourly', 'forecast', 'airQuality'],
    requiresApiKey: true,
    apiKeyEnvVar: 'WEATHERAPI_API_KEY',
    commercialAllowed: true,
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 30000,
    },
    timeoutMs: 4000,
    cacheTTL: 900,
    attributionText: 'Powered by WeatherAPI.com',
    attributionUrl: 'https://www.weatherapi.com/',
    docUrl: 'https://www.weatherapi.com/docs/',
    termsNotes: 'Requires API key. Free plan available with attribution.',
  },

  weathermetro: {
    id: 'weathermetro',
    name: 'WeatherMetro',
    description: 'Global multi-source meteorological aggregation endpoint',
    regions: ['GLOBAL', 'US', 'CA', 'NO', 'FI', 'GB', 'IN'],
    priorityByRegion: {
      GLOBAL: 3,
      US: 4,
      CA: 4,
      NO: 3,
      FI: 4,
      GB: 4,
      IN: 3,
    },
    defaultPriority: 3,
    capabilities: ['current', 'hourly', 'forecast'],
    requiresApiKey: true,
    apiKeyEnvVar: 'WEATHERMETRO_API_KEY',
    commercialAllowed: true,
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 20000,
    },
    timeoutMs: 4000,
    cacheTTL: 900,
    attributionText: 'Weather forecast data provided by WeatherMetro',
    attributionUrl: 'https://weathermetro.com/',
    docUrl: 'https://weathermetro.com/docs',
    termsNotes: 'Requires API key when enabled.',
  },

  visualcrossing: {
    id: 'visualcrossing',
    name: 'Visual Crossing',
    description: 'Visual Crossing Weather Timeline API',
    regions: ['GLOBAL', 'US', 'CA', 'IN'],
    priorityByRegion: {
      GLOBAL: 4,
      US: 5,
      CA: 5,
      IN: 4,
    },
    defaultPriority: 4,
    capabilities: ['current', 'hourly', 'forecast', 'historical'],
    requiresApiKey: true,
    apiKeyEnvVar: 'VISUALCROSSING_API_KEY',
    commercialAllowed: true,
    rateLimits: {
      requestsPerMinute: 30,
      requestsPerHour: 500,
      requestsPerDay: 1000, // 1000 free records per day
    },
    timeoutMs: 4500,
    cacheTTL: 1800,
    attributionText: 'Weather data by Visual Crossing',
    attributionUrl: 'https://www.visualcrossing.com/',
    docUrl: 'https://www.visualcrossing.com/resources/documentation/weather-api/timeline-weather-api/',
    termsNotes: 'Requires API key. Free tier allows 1000 records/day with attribution.',
  },

  openmeteo: {
    id: 'openmeteo',
    name: 'Open-Meteo',
    description: 'Open-Meteo Weather Forecast API',
    regions: ['GLOBAL'],
    priorityByRegion: {
      GLOBAL: 10, // Only used when explicitly enabled and eligible
    },
    defaultPriority: 10,
    capabilities: ['current', 'hourly', 'forecast', 'airQuality'],
    requiresApiKey: false,
    commercialAllowed: false, // Public non-commercial free endpoint terms
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 600,
      requestsPerDay: 10000,
    },
    timeoutMs: 4000,
    cacheTTL: 900,
    attributionText: 'Weather data by Open-Meteo.com (CC-BY 4.0)',
    attributionUrl: 'https://open-meteo.com/',
    docUrl: 'https://open-meteo.com/en/docs',
    termsNotes: 'Free endpoint is strictly non-commercial. In commercial mode, only eligible if self-hosted or commercial license key configured.',
  },
};
