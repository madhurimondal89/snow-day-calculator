import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { WeatherPreferencesProvider } from '@/components/providers/WeatherPreferencesContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.snowdaycalculatorfree.com').replace(/\/+$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | Snow Day Calculator Free',
    default: 'Free Snow Day Calculator — Snow Day Predictor',
  },
  description:
    'Calculate your snow day probability using snowfall, temperature, ice, wind and winter weather forecasts. Free Snow Day Calculator and Snow Day Predictor.',
  keywords: [
    'snow day calculator',
    'free snow day calculator',
    'snow day predictor',
    'snow day prediction',
    'snow day probability',
    'will tomorrow be a snow day',
    'school snow day calculator',
    'school closing predictor',
    'will schools be closed tomorrow',
    'snow day calculator by zip code',
    'snow day forecast',
    'snowfall forecast',
    'winter weather prediction',
    'school closure forecast',
  ],
  authors: [{ name: 'Snow Day Calculator Free' }],
  creator: 'Snow Day Calculator Free',
  publisher: 'Snow Day Calculator Free',
  applicationName: 'Snow Day Calculator Free',
  category: 'Weather & Education',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Snow Day Calculator Free',
    title: 'Free Snow Day Calculator — Snow Day Predictor',
    description:
      'Calculate your snow day probability using snowfall, temperature, ice, wind and winter weather forecasts. Free Snow Day Calculator and Snow Day Predictor.',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Snow Day Calculator — Snow Day Predictor',
    description: 'Calculate your snow day probability based on real-time winter weather forecasts.',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
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
  const globalOrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Snow Day Calculator Free',
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description: 'Real-time meteorological snow day probability predictor and winter storm analytics platform.',
  };

  const globalWebApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Snow Day Calculator',
    url: siteUrl,
    applicationCategory: 'WeatherApplication',
    operatingSystem: 'All (Web, iOS, Android, macOS, Windows, Linux)',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    featureList: [
      'Real-time Snowfall Accumulation Calculator',
      'Morning Commute Temperature & Ice Risk Analysis',
      'Deterministic Meteorological Snow Day Scoring Engine',
      'City and ZIP Code School Cancellation Predictor',
      'Hourly Winter Weather Forecast & Live Radar Maps',
    ],
  };

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://tiles.openfreemap.org" />
        <link rel="preconnect" href="https://api.met.no" />
        <link rel="preconnect" href="https://api.open-meteo.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalOrganizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalWebApplicationSchema) }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8732458645979427"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
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

