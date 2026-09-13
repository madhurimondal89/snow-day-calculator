import { NextRequest, NextResponse } from 'next/server';
import { weatherService } from '@/lib/weather/service';
import { resolveLocationFromSlug } from '@/lib/location/slugs';
import { LocationInfo } from '@/lib/weather/types/weather';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const locationParam = searchParams.get('location') || searchParams.get('q');

    let lat: number | null = null;
    let lon: number | null = null;
    let locationInfo: Partial<LocationInfo> | undefined;

    if (latParam && lonParam) {
      lat = parseFloat(latParam);
      lon = parseFloat(lonParam);
      if (searchParams.get('name')) {
        locationInfo = {
          name: searchParams.get('name') || undefined,
          region: searchParams.get('region') || undefined,
          country: searchParams.get('country') || undefined,
          countryCode: searchParams.get('countryCode') || undefined,
          timezone: searchParams.get('timezone') || undefined,
          slug: searchParams.get('slug') || undefined,
        };
      }
    } else if (locationParam) {
      const resolved = await resolveLocationFromSlug(locationParam);
      if (!resolved) {
        return NextResponse.json(
          { error: `Location "${locationParam}" could not be resolved.` },
          { status: 404 }
        );
      }
      lat = resolved.lat;
      lon = resolved.lon;
      locationInfo = resolved;
    } else {
      return NextResponse.json(
        { error: 'Missing required query parameters: Provide either (lat, lon) or location/q' },
        { status: 400 }
      );
    }

    if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude provided' },
        { status: 400 }
      );
    }

    const debugParam = searchParams.get('debugWeather') === 'true';

    if (latParam && lonParam && !locationInfo && searchParams.get('countryCode')) {
      locationInfo = {
        countryCode: searchParams.get('countryCode') || undefined,
        name: searchParams.get('name') || undefined,
      };
    }

    const data = await weatherService.getWeather(lat, lon, locationInfo, debugParam);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        'X-Weather-Provider': data.metadata.providerName,
      },
    });
  } catch (error: unknown) {
    console.error('[API /api/weather] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
