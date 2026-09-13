import { CITY_MAP } from './cities';
import { LocationInfo } from '../weather/types/weather';
import { geocodingProvider, generateLocationSlug } from '../geocoding/geocoding-provider';

export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolves a URL slug (e.g. "kolkata", "new-york", "london", or coordinates "22.57,88.36") to a verified LocationInfo
 */
export async function resolveLocationFromSlug(slug: string): Promise<LocationInfo | null> {
  if (!slug || !slug.trim()) return null;

  const raw = decodeURIComponent(slug).trim();

  // 1. Try parsing raw coordinate slugs like "22.5726,88.3639", "22.57_88.36", "lat-22.57-lon-88.36", "loc-22.57-88.36"
  const directCoordMatch = raw.match(/^(-?\d+(?:\.\d+)?)[,_ ](-?\d+(?:\.\d+)?)$/);
  if (directCoordMatch) {
    const lat = parseFloat(directCoordMatch[1]);
    const lon = parseFloat(directCoordMatch[2]);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      const rev = await geocodingProvider.reverseGeocode(lat, lon);
      return rev;
    }
  }

  const prefixedCoordMatch = raw.match(/^(?:lat|loc)-?(-?\d+(?:\.\d+)?)-(?:lon-)?(-?\d+(?:\.\d+)?)$/i);
  if (prefixedCoordMatch) {
    const lat = parseFloat(prefixedCoordMatch[1]);
    const lon = parseFloat(prefixedCoordMatch[2]);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      const rev = await geocodingProvider.reverseGeocode(lat, lon);
      return rev;
    }
  }

  const normalized = normalizeSlug(raw);
  if (!normalized) return null;

  // 2. Check curated high-performance database
  const predefined = CITY_MAP.get(normalized);
  if (predefined) {
    return predefined;
  }

  // 3. Fallback to geocoding search using the slug formatted as query
  const query = normalized.replace(/-/g, ' ');
  const searchResults = await geocodingProvider.searchLocations(query, 1);
  if (searchResults.length > 0) {
    return {
      ...searchResults[0],
      slug: normalized,
    };
  }

  return null;
}

export function getLocationCanonicalUrl(slug: string, siteUrl?: string): string {
  const base = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://weatherhub.example.com';
  const cleanBase = base.replace(/\/+$/, '');
  const cleanSlug = encodeURIComponent(slug.trim());
  return `${cleanBase}/weather/${cleanSlug}`;
}
