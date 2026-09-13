import type { Metadata, Viewport } from 'next';
import './globals.css';
import { WeatherPreferencesProvider } from '@/components/providers/WeatherPreferencesContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    template: '%s | Snow Day Calculator Free',
    default: 'Snow Day Calculator — Free Snow Day Predictor & Probability',
  },
  description:
    'Find out your estimated snow day probability using snowfall accumulation, morning commute temperatures, freezing rain hazards, and winter weather forecasts. Free, instant, and accurate.',
  keywords: [
    'snow day calculator',
    'free snow day calculator',
    'snow day predictor',
    'snow day prediction',
    'snow day probability',
    'will tomorrow be a snow day',
    'snow day forecast',
    'school snow day calculator',
    'snowfall forecast',
    'winter weather prediction',
    'school closure forecast',
  ],
  authors: [{ name: 'Snow Day Calculator Free' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://snowdaycalculatorfree.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Snow Day Calculator Free',
    title: 'Snow Day Calculator Free — Will Tomorrow Be a Snow Day?',
    description:
      'Estimate your chance of a snow day with real-time snowfall accumulation, morning temperatures, ice hazards, and wind gust data.',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Snow Day Calculator Free — Will Tomorrow Be a Snow Day?',
    description: 'Calculate your snow day probability based on real-time winter weather forecasts.',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0b0f19',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://tiles.openfreemap.org" />
        <link rel="preconnect" href="https://api.met.no" />
        <link rel="preconnect" href="https://api.open-meteo.com" />
      </head>
      <body>
        <WeatherPreferencesProvider>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </WeatherPreferencesProvider>
      </body>
    </html>
  );
}
