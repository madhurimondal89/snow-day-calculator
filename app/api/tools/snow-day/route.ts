import { NextRequest, NextResponse } from 'next/server';
import { weatherService } from '@/lib/weather/service';
import { geocodingProvider } from '@/lib/geocoding/geocoding-provider';
import { resolveLocationFromSlug } from '@/lib/location/slugs';
import { SnowDayPredictionEngine } from '@/lib/snow-day/engine';
import { weatherCache } from '@/lib/weather/cache';
import { LocationInfo } from '@/lib/weather/types/weather';
import { UnitSystem } from '@/lib/weather/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const queryParam = searchParams.get('q');
    const dateParam = searchParams.get('date') || undefined;
    const unitsParam = (searchParams.get('units') === 'f' ? 'f' : 'c') as UnitSystem;

    let location: LocationInfo | null = null;

    // 1. Resolve Location
    if (latParam && lonParam) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        location = await geocodingProvider.reverseGeocode(lat, lon);
      }
    } else if (queryParam) {
      location = await resolveLocationFromSlug(queryParam);
      if (!location) {
        const searchResults = await geocodingProvider.searchLocations(queryParam, 1);
        if (searchResults.length > 0) {
          location = searchResults[0];
        }
      }
    }

    // Default fallback: New York
    if (!location) {
      location = {
        name: 'New York',
        region: 'New York',
        country: 'United States',
        countryCode: 'US',
        lat: 40.7128,
        lon: -74.006,
        timezone: 'America/New_York',
        slug: 'new-york',
      };
    }

    const latKey = location.lat.toFixed(3);
    const lonKey = location.lon.toFixed(3);
    const dateKey = dateParam || 'tomorrow';
    const cacheKey = `snowday:${latKey}:${lonKey}:${dateKey}:${unitsParam}`;

    // 2. Check Cache
    const cachedPrediction = weatherCache.get(cacheKey);
    if (cachedPrediction) {
      return NextResponse.json(
        {
          success: true,
          data: cachedPrediction,
          cached: true,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
          },
        }
      );
    }

    // 3. Fetch Weather Data through Router & Service
    const weatherData = await weatherService.getWeather(location.lat, location.lon, location);

    // 4. Run Deterministic Snow Day Prediction Engine
    const prediction = SnowDayPredictionEngine.calculate(weatherData, dateParam, unitsParam);

    // 5. Cache calculation for 15 minutes
    weatherCache.set(cacheKey, prediction, 900);

    return NextResponse.json(
      {
        success: true,
        data: prediction,
        cached: false,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        },
      }
    );
  } catch (error) {
    console.error('[API /api/tools/snow-day] Error calculating snow day:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to calculate snow day prediction for the requested location at this time.',
      },
      { status: 500 }
    );
  }
}
