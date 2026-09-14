import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Snow Day Calculator Free — School Closure & Winter Predictor',
    short_name: 'SnowDayCalc',
    description: 'Calculate snow day probability, school cancellation forecasts, snowfall accumulation, and winter weather risk.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f19',
    theme_color: '#0284c7',
    categories: ['weather', 'education', 'utilities', 'productivity'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Calculate Snow Day',
        short_name: 'Snow Day',
        description: 'Calculate snow day probability for your city or ZIP',
        url: '/snow-day-calculator',
        icons: [{ src: '/icon.svg', sizes: 'any' }],
      },
      {
        name: 'Live Snow Radar & Maps',
        short_name: 'Snow Radar',
        description: 'View real-time precipitation and snow radar maps',
        url: '/snow-forecast',
        icons: [{ src: '/icon.svg', sizes: 'any' }],
      },
      {
        name: 'Snow Day Predictor',
        short_name: 'Predictor',
        description: 'Winter storm cancellation analytics',
        url: '/snow-day-predictor',
        icons: [{ src: '/icon.svg', sizes: 'any' }],
      },
    ],
  };
}

