import { LocationInfo } from '../weather/types/weather';

export interface CityLocation extends LocationInfo {
  slug: string;
  population?: number;
  popular?: boolean;
  snowBelt?: boolean;
}

export const POPULAR_CITIES: CityLocation[] = [
  // --- US Northeast & Mid-Atlantic ---
  { slug: 'new-york', name: 'New York', region: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'buffalo', name: 'Buffalo', region: 'New York', country: 'United States', countryCode: 'US', lat: 42.8864, lon: -78.8784, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'rochester', name: 'Rochester', region: 'New York', country: 'United States', countryCode: 'US', lat: 43.1566, lon: -77.6088, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'syracuse', name: 'Syracuse', region: 'New York', country: 'United States', countryCode: 'US', lat: 43.0481, lon: -76.1474, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'albany', name: 'Albany', region: 'New York', country: 'United States', countryCode: 'US', lat: 42.6526, lon: -73.7562, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'boston', name: 'Boston', region: 'Massachusetts', country: 'United States', countryCode: 'US', lat: 42.3601, lon: -71.0589, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'worcester', name: 'Worcester', region: 'Massachusetts', country: 'United States', countryCode: 'US', lat: 42.2626, lon: -71.8023, timezone: 'America/New_York', popular: false, snowBelt: true },
  { slug: 'hartford', name: 'Hartford', region: 'Connecticut', country: 'United States', countryCode: 'US', lat: 41.7658, lon: -72.6734, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'providence', name: 'Providence', region: 'Rhode Island', country: 'United States', countryCode: 'US', lat: 41.8240, lon: -71.4128, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'philadelphia', name: 'Philadelphia', region: 'Pennsylvania', country: 'United States', countryCode: 'US', lat: 39.9526, lon: -75.1652, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'pittsburgh', name: 'Pittsburgh', region: 'Pennsylvania', country: 'United States', countryCode: 'US', lat: 40.4406, lon: -79.9959, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'allentown', name: 'Allentown', region: 'Pennsylvania', country: 'United States', countryCode: 'US', lat: 40.6084, lon: -75.4902, timezone: 'America/New_York', popular: false, snowBelt: true },
  { slug: 'erie', name: 'Erie', region: 'Pennsylvania', country: 'United States', countryCode: 'US', lat: 42.1292, lon: -80.0851, timezone: 'America/New_York', popular: false, snowBelt: true },
  { slug: 'newark', name: 'Newark', region: 'New Jersey', country: 'United States', countryCode: 'US', lat: 40.7357, lon: -74.1724, timezone: 'America/New_York', popular: false, snowBelt: true },
  { slug: 'baltimore', name: 'Baltimore', region: 'Maryland', country: 'United States', countryCode: 'US', lat: 39.2904, lon: -76.6122, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'washington-dc', name: 'Washington', region: 'District of Columbia', country: 'United States', countryCode: 'US', lat: 38.9072, lon: -77.0369, timezone: 'America/New_York', popular: true, snowBelt: true },

  // --- US Midwest & Great Lakes ---
  { slug: 'chicago', name: 'Chicago', region: 'Illinois', country: 'United States', countryCode: 'US', lat: 41.8781, lon: -87.6298, timezone: 'America/Chicago', popular: true, snowBelt: true },
  { slug: 'detroit', name: 'Detroit', region: 'Michigan', country: 'United States', countryCode: 'US', lat: 42.3314, lon: -83.0458, timezone: 'America/Detroit', popular: true, snowBelt: true },
  { slug: 'grand-rapids', name: 'Grand Rapids', region: 'Michigan', country: 'United States', countryCode: 'US', lat: 42.9634, lon: -85.6681, timezone: 'America/Detroit', popular: true, snowBelt: true },
  { slug: 'minneapolis', name: 'Minneapolis', region: 'Minnesota', country: 'United States', countryCode: 'US', lat: 44.9778, lon: -93.2650, timezone: 'America/Chicago', popular: true, snowBelt: true },
  { slug: 'saint-paul', name: 'Saint Paul', region: 'Minnesota', country: 'United States', countryCode: 'US', lat: 44.9537, lon: -93.0900, timezone: 'America/Chicago', popular: false, snowBelt: true },
  { slug: 'duluth', name: 'Duluth', region: 'Minnesota', country: 'United States', countryCode: 'US', lat: 46.7867, lon: -92.1005, timezone: 'America/Chicago', popular: false, snowBelt: true },
  { slug: 'cleveland', name: 'Cleveland', region: 'Ohio', country: 'United States', countryCode: 'US', lat: 41.4993, lon: -81.6944, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'columbus', name: 'Columbus', region: 'Ohio', country: 'United States', countryCode: 'US', lat: 39.9612, lon: -82.9988, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'cincinnati', name: 'Cincinnati', region: 'Ohio', country: 'United States', countryCode: 'US', lat: 39.1031, lon: -84.5120, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'milwaukee', name: 'Milwaukee', region: 'Wisconsin', country: 'United States', countryCode: 'US', lat: 43.0389, lon: -87.9065, timezone: 'America/Chicago', popular: true, snowBelt: true },
  { slug: 'madison', name: 'Madison', region: 'Wisconsin', country: 'United States', countryCode: 'US', lat: 43.0731, lon: -89.4012, timezone: 'America/Chicago', popular: true, snowBelt: true },
  { slug: 'green-bay', name: 'Green Bay', region: 'Wisconsin', country: 'United States', countryCode: 'US', lat: 44.5192, lon: -88.0198, timezone: 'America/Chicago', popular: false, snowBelt: true },
  { slug: 'indianapolis', name: 'Indianapolis', region: 'Indiana', country: 'United States', countryCode: 'US', lat: 39.7684, lon: -86.1581, timezone: 'America/Indiana/Indianapolis', popular: true, snowBelt: true },
  { slug: 'st-louis', name: 'St. Louis', region: 'Missouri', country: 'United States', countryCode: 'US', lat: 38.6270, lon: -90.1994, timezone: 'America/Chicago', popular: true, snowBelt: true },
  { slug: 'kansas-city', name: 'Kansas City', region: 'Missouri', country: 'United States', countryCode: 'US', lat: 39.0997, lon: -94.5786, timezone: 'America/Chicago', popular: true, snowBelt: true },
  { slug: 'omaha', name: 'Omaha', region: 'Nebraska', country: 'United States', countryCode: 'US', lat: 41.2565, lon: -95.9345, timezone: 'America/Chicago', popular: true, snowBelt: true },
  { slug: 'des-moines', name: 'Des Moines', region: 'Iowa', country: 'United States', countryCode: 'US', lat: 41.5868, lon: -93.6250, timezone: 'America/Chicago', popular: true, snowBelt: true },
  { slug: 'fargo', name: 'Fargo', region: 'North Dakota', country: 'United States', countryCode: 'US', lat: 46.8772, lon: -96.7898, timezone: 'America/Chicago', popular: false, snowBelt: true },
  { slug: 'sioux-falls', name: 'Sioux Falls', region: 'South Dakota', country: 'United States', countryCode: 'US', lat: 43.5460, lon: -96.7313, timezone: 'America/Chicago', popular: false, snowBelt: true },

  // --- US Mountain West & Northwest ---
  { slug: 'denver', name: 'Denver', region: 'Colorado', country: 'United States', countryCode: 'US', lat: 39.7392, lon: -104.9903, timezone: 'America/Denver', popular: true, snowBelt: true },
  { slug: 'colorado-springs', name: 'Colorado Springs', region: 'Colorado', country: 'United States', countryCode: 'US', lat: 38.8339, lon: -104.8214, timezone: 'America/Denver', popular: false, snowBelt: true },
  { slug: 'salt-lake-city', name: 'Salt Lake City', region: 'Utah', country: 'United States', countryCode: 'US', lat: 40.7608, lon: -111.8910, timezone: 'America/Denver', popular: true, snowBelt: true },
  { slug: 'boise', name: 'Boise', region: 'Idaho', country: 'United States', countryCode: 'US', lat: 43.6150, lon: -116.2023, timezone: 'America/Boise', popular: true, snowBelt: true },
  { slug: 'seattle', name: 'Seattle', region: 'Washington', country: 'United States', countryCode: 'US', lat: 47.6062, lon: -122.3321, timezone: 'America/Los_Angeles', popular: true, snowBelt: true },
  { slug: 'spokane', name: 'Spokane', region: 'Washington', country: 'United States', countryCode: 'US', lat: 47.6588, lon: -117.4260, timezone: 'America/Los_Angeles', popular: false, snowBelt: true },
  { slug: 'portland', name: 'Portland', region: 'Oregon', country: 'United States', countryCode: 'US', lat: 45.5152, lon: -122.6784, timezone: 'America/Los_Angeles', popular: true, snowBelt: true },
  { slug: 'anchorage', name: 'Anchorage', region: 'Alaska', country: 'United States', countryCode: 'US', lat: 61.2181, lon: -149.9003, timezone: 'America/Anchorage', popular: true, snowBelt: true },

  // --- Canada ---
  { slug: 'toronto', name: 'Toronto', region: 'Ontario', country: 'Canada', countryCode: 'CA', lat: 43.6532, lon: -79.3832, timezone: 'America/Toronto', popular: true, snowBelt: true },
  { slug: 'montreal', name: 'Montreal', region: 'Quebec', country: 'Canada', countryCode: 'CA', lat: 45.5017, lon: -73.5673, timezone: 'America/Toronto', popular: true, snowBelt: true },
  { slug: 'ottawa', name: 'Ottawa', region: 'Ontario', country: 'Canada', countryCode: 'CA', lat: 45.4215, lon: -75.6972, timezone: 'America/Toronto', popular: true, snowBelt: true },
  { slug: 'calgary', name: 'Calgary', region: 'Alberta', country: 'Canada', countryCode: 'CA', lat: 51.0447, lon: -114.0719, timezone: 'America/Edmonton', popular: true, snowBelt: true },
  { slug: 'edmonton', name: 'Edmonton', region: 'Alberta', country: 'Canada', countryCode: 'CA', lat: 53.5461, lon: -113.4938, timezone: 'America/Edmonton', popular: true, snowBelt: true },
  { slug: 'winnipeg', name: 'Winnipeg', region: 'Manitoba', country: 'Canada', countryCode: 'CA', lat: 49.8951, lon: -97.1384, timezone: 'America/Winnipeg', popular: true, snowBelt: true },
  { slug: 'quebec-city', name: 'Quebec City', region: 'Quebec', country: 'Canada', countryCode: 'CA', lat: 46.8139, lon: -71.2080, timezone: 'America/Toronto', popular: false, snowBelt: true },
  { slug: 'vancouver', name: 'Vancouver', region: 'British Columbia', country: 'Canada', countryCode: 'CA', lat: 49.2827, lon: -123.1207, timezone: 'America/Vancouver', popular: true, snowBelt: true },
  { slug: 'halifax', name: 'Halifax', region: 'Nova Scotia', country: 'Canada', countryCode: 'CA', lat: 44.6488, lon: -63.5752, timezone: 'America/Halifax', popular: false, snowBelt: true },

  // --- UK & Europe ---
  { slug: 'london', name: 'London', region: 'England', country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London', popular: true, snowBelt: true },
  { slug: 'manchester', name: 'Manchester', region: 'England', country: 'United Kingdom', countryCode: 'GB', lat: 53.4808, lon: -2.2426, timezone: 'Europe/London', popular: true, snowBelt: true },
  { slug: 'edinburgh', name: 'Edinburgh', region: 'Scotland', country: 'United Kingdom', countryCode: 'GB', lat: 55.9533, lon: -3.1883, timezone: 'Europe/London', popular: true, snowBelt: true },
  { slug: 'glasgow', name: 'Glasgow', region: 'Scotland', country: 'United Kingdom', countryCode: 'GB', lat: 55.8642, lon: -4.2518, timezone: 'Europe/London', popular: false, snowBelt: true },
  { slug: 'oslo', name: 'Oslo', region: 'Oslo', country: 'Norway', countryCode: 'NO', lat: 59.9139, lon: 10.7522, timezone: 'Europe/Oslo', popular: true, snowBelt: true },
  { slug: 'stockholm', name: 'Stockholm', region: 'Stockholm County', country: 'Sweden', countryCode: 'SE', lat: 59.3293, lon: 18.0686, timezone: 'Europe/Stockholm', popular: true, snowBelt: true },
  { slug: 'helsinki', name: 'Helsinki', region: 'Uusimaa', country: 'Finland', countryCode: 'FI', lat: 60.1699, lon: 24.9384, timezone: 'Europe/Helsinki', popular: true, snowBelt: true },
  { slug: 'copenhagen', name: 'Copenhagen', region: 'Capital Region', country: 'Denmark', countryCode: 'DK', lat: 55.6761, lon: 12.5683, timezone: 'Europe/Copenhagen', popular: true, snowBelt: true },
  { slug: 'zurich', name: 'Zurich', region: 'Zurich', country: 'Switzerland', countryCode: 'CH', lat: 47.3769, lon: 8.5417, timezone: 'Europe/Zurich', popular: true, snowBelt: true },
  { slug: 'vienna', name: 'Vienna', region: 'Vienna', country: 'Austria', countryCode: 'AT', lat: 48.2082, lon: 16.3738, timezone: 'Europe/Vienna', popular: true, snowBelt: true },
  { slug: 'berlin', name: 'Berlin', region: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.5200, lon: 13.4050, timezone: 'Europe/Berlin', popular: true, snowBelt: true },
  { slug: 'munich', name: 'Munich', region: 'Bavaria', country: 'Germany', countryCode: 'DE', lat: 48.1351, lon: 11.5820, timezone: 'Europe/Berlin', popular: true, snowBelt: true },
  { slug: 'paris', name: 'Paris', region: 'Île-de-France', country: 'France', countryCode: 'FR', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris', popular: true },
  { slug: 'tokyo', name: 'Tokyo', region: 'Kanto', country: 'Japan', countryCode: 'JP', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo', popular: true, snowBelt: true },
  { slug: 'sapporo', name: 'Sapporo', region: 'Hokkaido', country: 'Japan', countryCode: 'JP', lat: 43.0618, lon: 141.3545, timezone: 'Asia/Tokyo', popular: true, snowBelt: true },

  // --- Major Global Metropolitan Hubs ---
  { slug: 'los-angeles', name: 'Los Angeles', region: 'California', country: 'United States', countryCode: 'US', lat: 34.0522, lon: -118.2437, timezone: 'America/Los_Angeles', popular: true },
  { slug: 'san-francisco', name: 'San Francisco', region: 'California', country: 'United States', countryCode: 'US', lat: 37.7749, lon: -122.4194, timezone: 'America/Los_Angeles', popular: true },
  { slug: 'miami', name: 'Miami', region: 'Florida', country: 'United States', countryCode: 'US', lat: 25.7617, lon: -80.1918, timezone: 'America/New_York' },
  { slug: 'dallas', name: 'Dallas', region: 'Texas', country: 'United States', countryCode: 'US', lat: 32.7767, lon: -96.7970, timezone: 'America/Chicago', popular: true, snowBelt: true },
  { slug: 'atlanta', name: 'Atlanta', region: 'Georgia', country: 'United States', countryCode: 'US', lat: 33.7490, lon: -84.3880, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'nashville', name: 'Nashville', region: 'Tennessee', country: 'United States', countryCode: 'US', lat: 36.1627, lon: -86.7816, timezone: 'America/Chicago', popular: true, snowBelt: true },
  { slug: 'charlotte', name: 'Charlotte', region: 'North Carolina', country: 'United States', countryCode: 'US', lat: 35.2271, lon: -80.8431, timezone: 'America/New_York', popular: true, snowBelt: true },
  { slug: 'raleigh', name: 'Raleigh', region: 'North Carolina', country: 'United States', countryCode: 'US', lat: 35.7796, lon: -78.6382, timezone: 'America/New_York', popular: false, snowBelt: true },
  { slug: 'sydney', name: 'Sydney', region: 'New South Wales', country: 'Australia', countryCode: 'AU', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney', popular: true },
  { slug: 'melbourne', name: 'Melbourne', region: 'Victoria', country: 'Australia', countryCode: 'AU', lat: -37.8136, lon: 144.9631, timezone: 'Australia/Melbourne', popular: true },
  { slug: 'dubai', name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai', popular: true },
  { slug: 'singapore', name: 'Singapore', region: 'Central Region', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore', popular: true },
  { slug: 'bangkok', name: 'Bangkok', region: 'Central Thailand', country: 'Thailand', countryCode: 'TH', lat: 13.7563, lon: 100.5018, timezone: 'Asia/Bangkok', popular: true },
  { slug: 'seoul', name: 'Seoul', region: 'Capital Area', country: 'South Korea', countryCode: 'KR', lat: 37.5665, lon: 126.9780, timezone: 'Asia/Seoul', popular: true, snowBelt: true },
  { slug: 'hong-kong', name: 'Hong Kong', region: 'Hong Kong', country: 'China', countryCode: 'HK', lat: 22.3193, lon: 114.1694, timezone: 'Asia/Hong_Kong', popular: true },
  { slug: 'rome', name: 'Rome', region: 'Lazio', country: 'Italy', countryCode: 'IT', lat: 41.9028, lon: 12.4964, timezone: 'Europe/Rome', popular: true },
  { slug: 'madrid', name: 'Madrid', region: 'Community of Madrid', country: 'Spain', countryCode: 'ES', lat: 40.4168, lon: -3.7038, timezone: 'Europe/Madrid', popular: true },
  { slug: 'amsterdam', name: 'Amsterdam', region: 'North Holland', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lon: 4.9041, timezone: 'Europe/Amsterdam', popular: true },
  { slug: 'kolkata', name: 'Kolkata', region: 'West Bengal', country: 'India', countryCode: 'IN', lat: 22.5726, lon: 88.3639, timezone: 'Asia/Kolkata', popular: true },
  { slug: 'delhi', name: 'Delhi', region: 'National Capital Territory', country: 'India', countryCode: 'IN', lat: 28.6139, lon: 77.2090, timezone: 'Asia/Kolkata', popular: true },
  { slug: 'mumbai', name: 'Mumbai', region: 'Maharashtra', country: 'India', countryCode: 'IN', lat: 19.0760, lon: 72.8777, timezone: 'Asia/Kolkata', popular: true },
  { slug: 'bengaluru', name: 'Bengaluru', region: 'Karnataka', country: 'India', countryCode: 'IN', lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata', popular: true },
];

export const SNOW_BELT_CITIES = POPULAR_CITIES.filter((c) => c.snowBelt);

export const CITY_MAP = new Map<string, CityLocation>(
  POPULAR_CITIES.map((city) => [city.slug.toLowerCase(), city])
);
