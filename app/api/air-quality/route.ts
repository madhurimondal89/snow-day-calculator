import { NextRequest, NextResponse } from 'next/server';
import { AirQualityProvider } from '@/lib/weather/providers/air-quality';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');

    if (!latParam || !lonParam) {
      return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
    }

    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const aqiProvider = new AirQualityProvider();
    const data = await aqiProvider.getAirQuality(lat, lon);

    if (!data) {
      return NextResponse.json({ error: 'Air quality data unavailable for coordinates' }, { status: 404 });
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error: unknown) {
    console.error('[API /api/air-quality] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
