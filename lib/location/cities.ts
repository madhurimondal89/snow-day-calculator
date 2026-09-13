import { LocationInfo } from '../weather/types/weather';

export interface CityLocation extends LocationInfo {
  slug: string;
  population?: number;
  popular?: boolean;
}

export const POPULAR_CITIES: CityLocation[] = [
  { slug: 'kolkata', name: 'Kolkata', region: 'West Bengal', country: 'India', countryCode: 'IN', lat: 22.5726, lon: 88.3639, timezone: 'Asia/Kolkata', popular: true },
  { slug: 'delhi', name: 'Delhi', region: 'National Capital Territory', country: 'India', countryCode: 'IN', lat: 28.6139, lon: 77.2090, timezone: 'Asia/Kolkata', popular: true },
  { slug: 'mumbai', name: 'Mumbai', region: 'Maharashtra', country: 'India', countryCode: 'IN', lat: 19.0760, lon: 72.8777, timezone: 'Asia/Kolkata', popular: true },
  { slug: 'bengaluru', name: 'Bengaluru', region: 'Karnataka', country: 'India', countryCode: 'IN', lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata', popular: true },
  { slug: 'chennai', name: 'Chennai', region: 'Tamil Nadu', country: 'India', countryCode: 'IN', lat: 13.0827, lon: 80.2707, timezone: 'Asia/Kolkata', popular: true },
  { slug: 'hyderabad', name: 'Hyderabad', region: 'Telangana', country: 'India', countryCode: 'IN', lat: 17.3850, lon: 78.4867, timezone: 'Asia/Kolkata', popular: true },
  { slug: 'london', name: 'London', region: 'England', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London', popular: true },
  { slug: 'new-york', name: 'New York', region: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York', popular: true },
  { slug: 'dubai', name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai', popular: true },
  { slug: 'singapore', name: 'Singapore', region: 'Central Region', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore', popular: true },
  { slug: 'tokyo', name: 'Tokyo', region: 'Kanto', country: 'Japan', countryCode: 'JP', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo', popular: true },
  { slug: 'paris', name: 'Paris', region: 'Île-de-France', country: 'France', countryCode: 'FR', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris', popular: true },
  { slug: 'sydney', name: 'Sydney', region: 'New South Wales', country: 'Australia', countryCode: 'AU', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney', popular: true },
  { slug: 'toronto', name: 'Toronto', region: 'Ontario', country: 'Canada', countryCode: 'CA', lat: 43.6532, lon: -79.3832, timezone: 'America/Toronto', popular: true },
  { slug: 'berlin', name: 'Berlin', region: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.5200, lon: 13.4050, timezone: 'Europe/Berlin', popular: true },
  { slug: 'los-angeles', name: 'Los Angeles', region: 'California', country: 'United States', countryCode: 'US', lat: 34.0522, lon: -118.2437, timezone: 'America/Los_Angeles', popular: true },
  { slug: 'chicago', name: 'Chicago', region: 'Illinois', country: 'United States', countryCode: 'US', lat: 41.8781, lon: -87.6298, timezone: 'America/Chicago', popular: true },
  { slug: 'san-francisco', name: 'San Francisco', region: 'California', country: 'United States', countryCode: 'US', lat: 37.7749, lon: -122.4194, timezone: 'America/Los_Angeles', popular: true },
  { slug: 'bangkok', name: 'Bangkok', region: 'Central Thailand', country: 'Thailand', countryCode: 'TH', lat: 13.7563, lon: 100.5018, timezone: 'Asia/Bangkok', popular: true },
  { slug: 'seoul', name: 'Seoul', region: 'Capital Area', country: 'South Korea', countryCode: 'KR', lat: 37.5665, lon: 126.9780, timezone: 'Asia/Seoul', popular: true },
  { slug: 'hong-kong', name: 'Hong Kong', region: 'Hong Kong', country: 'China', countryCode: 'HK', lat: 22.3193, lon: 114.1694, timezone: 'Asia/Hong_Kong', popular: true },
  { slug: 'rome', name: 'Rome', region: 'Lazio', country: 'Italy', countryCode: 'IT', lat: 41.9028, lon: 12.4964, timezone: 'Europe/Rome', popular: true },
  { slug: 'madrid', name: 'Madrid', region: 'Community of Madrid', country: 'Spain', countryCode: 'ES', lat: 40.4168, lon: -3.7038, timezone: 'Europe/Madrid', popular: true },
  { slug: 'amsterdam', name: 'Amsterdam', region: 'North Holland', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lon: 4.9041, timezone: 'Europe/Amsterdam', popular: true },
  { slug: 'cairo', name: 'Cairo', region: 'Cairo Governorate', country: 'Egypt', countryCode: 'EG', lat: 30.0444, lon: 31.2357, timezone: 'Africa/Cairo', popular: true },
  { slug: 'istanbul', name: 'Istanbul', region: 'Marmara', country: 'Turkey', countryCode: 'TR', lat: 41.0082, lon: 28.9784, timezone: 'Europe/Istanbul', popular: true },
  { slug: 'dhaka', name: 'Dhaka', region: 'Dhaka Division', country: 'Bangladesh', countryCode: 'BD', lat: 23.8103, lon: 90.4125, timezone: 'Asia/Dhaka', popular: true },
  { slug: 'karachi', name: 'Karachi', region: 'Sindh', country: 'Pakistan', countryCode: 'PK', lat: 24.8607, lon: 67.0011, timezone: 'Asia/Karachi', popular: true },
  { slug: 'lahore', name: 'Lahore', region: 'Punjab', country: 'Pakistan', countryCode: 'PK', lat: 31.5204, lon: 74.3587, timezone: 'Asia/Karachi', popular: true },
  { slug: 'buenos-aires', name: 'Buenos Aires', region: 'Federal Capital', country: 'Argentina', countryCode: 'AR', lat: -34.6037, lon: -58.3816, timezone: 'America/Argentina/Buenos_Aires', popular: true },
  { slug: 'sao-paulo', name: 'São Paulo', region: 'State of São Paulo', country: 'Brazil', countryCode: 'BR', lat: -23.5505, lon: -46.6333, timezone: 'America/Sao_Paulo', popular: true },
  { slug: 'mexico-city', name: 'Mexico City', region: 'CDMX', country: 'Mexico', countryCode: 'MX', lat: 19.4326, lon: -99.1332, timezone: 'America/Mexico_City', popular: true },
  { slug: 'vancouver', name: 'Vancouver', region: 'British Columbia', country: 'Canada', countryCode: 'CA', lat: 49.2827, lon: -123.1207, timezone: 'America/Vancouver', popular: true },
  { slug: 'melbourne', name: 'Melbourne', region: 'Victoria', country: 'Australia', countryCode: 'AU', lat: -37.8136, lon: 144.9631, timezone: 'Australia/Melbourne', popular: true },
  { slug: 'auckland', name: 'Auckland', region: 'Auckland', country: 'New Zealand', countryCode: 'NZ', lat: -36.8485, lon: 174.7633, timezone: 'Pacific/Auckland', popular: true },
  { slug: 'johannesburg', name: 'Johannesburg', region: 'Gauteng', country: 'South Africa', countryCode: 'ZA', lat: -26.2041, lon: 28.0473, timezone: 'Africa/Johannesburg', popular: true },
  { slug: 'cape-town', name: 'Cape Town', region: 'Western Cape', country: 'South Africa', countryCode: 'ZA', lat: -33.9249, lon: 18.4241, timezone: 'Africa/Johannesburg', popular: true },
  { slug: 'zurich', name: 'Zurich', region: 'Zurich', country: 'Switzerland', countryCode: 'CH', lat: 47.3769, lon: 8.5417, timezone: 'Europe/Zurich', popular: true },
  { slug: 'vienna', name: 'Vienna', region: 'Vienna', country: 'Austria', countryCode: 'AT', lat: 48.2082, lon: 16.3738, timezone: 'Europe/Vienna', popular: true },
  { slug: 'oslo', name: 'Oslo', region: 'Oslo', country: 'Norway', countryCode: 'NO', lat: 59.9139, lon: 10.7522, timezone: 'Europe/Oslo', popular: true },
  { slug: 'stockholm', name: 'Stockholm', region: 'Stockholm County', country: 'Sweden', countryCode: 'SE', lat: 59.3293, lon: 18.0686, timezone: 'Europe/Stockholm', popular: true },
  { slug: 'copenhagen', name: 'Copenhagen', region: 'Capital Region', country: 'Denmark', countryCode: 'DK', lat: 55.6761, lon: 12.5683, timezone: 'Europe/Copenhagen', popular: true },
  { slug: 'helsinki', name: 'Helsinki', region: 'Uusimaa', country: 'Finland', countryCode: 'FI', lat: 60.1699, lon: 24.9384, timezone: 'Europe/Helsinki', popular: true },
  { slug: 'ahmedabad', name: 'Ahmedabad', region: 'Gujarat', country: 'India', countryCode: 'IN', lat: 23.0225, lon: 72.5714, timezone: 'Asia/Kolkata' },
  { slug: 'pune', name: 'Pune', region: 'Maharashtra', country: 'India', countryCode: 'IN', lat: 18.5204, lon: 73.8567, timezone: 'Asia/Kolkata' },
  { slug: 'jaipur', name: 'Jaipur', region: 'Rajasthan', country: 'India', countryCode: 'IN', lat: 26.9124, lon: 75.7873, timezone: 'Asia/Kolkata' },
  { slug: 'lucknow', name: 'Lucknow', region: 'Uttar Pradesh', country: 'India', countryCode: 'IN', lat: 26.8467, lon: 80.9462, timezone: 'Asia/Kolkata' },
  { slug: 'patna', name: 'Patna', region: 'Bihar', country: 'India', countryCode: 'IN', lat: 25.5941, lon: 85.1376, timezone: 'Asia/Kolkata' },
  { slug: 'miami', name: 'Miami', region: 'Florida', country: 'United States', countryCode: 'US', lat: 25.7617, lon: -80.1918, timezone: 'America/New_York' },
  { slug: 'seattle', name: 'Seattle', region: 'Washington', country: 'United States', countryCode: 'US', lat: 47.6062, lon: -122.3321, timezone: 'America/Los_Angeles' },
  { slug: 'boston', name: 'Boston', region: 'Massachusetts', country: 'United States', countryCode: 'US', lat: 42.3601, lon: -71.0589, timezone: 'America/New_York' },
];

export const CITY_MAP = new Map<string, CityLocation>(
  POPULAR_CITIES.map((city) => [city.slug.toLowerCase(), city])
);
