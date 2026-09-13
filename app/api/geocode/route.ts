import { NextRequest, NextResponse } from 'next/server';
import { geocodingProvider } from '@/lib/geocoding/geocoding-provider';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query');
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const count = parseInt(searchParams.get('count') || '8', 10);

    if (latParam && lonParam) {
      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
      }
      const location = await geocodingProvider.reverseGeocode(lat, lon);
      return NextResponse.json({ location }, { status: 200 });
    }

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const results = await geocodingProvider.searchLocations(query, count);

    return NextResponse.json(
      { results },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        },
      }
    );
  } catch (error: unknown) {
    console.error('[API /api/geocode] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
