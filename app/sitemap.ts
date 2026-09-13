import { MetadataRoute } from 'next';
import { POPULAR_CITIES } from '@/lib/location/cities';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://snowdaycalculatorfree.com').replace(/\/+$/, '');
  const now = new Date();

  // Core static pages (Snow Day First)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/snow-day-calculator`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/snow-day-predictor`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/snow-forecast`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/maps`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/weather`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/data-sources`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // High-value programmatic city snow day calculator pages
  const snowDayCities = [
    'new-york', 'chicago', 'boston', 'denver', 'toronto', 'montreal',
    'minneapolis', 'london', 'buffalo', 'oslo', 'helsinki', 'stockholm',
    'tokyo', 'seattle', 'detroit', 'philadelphia', 'pittsburgh', 'cleveland',
    'calgary', 'vancouver'
  ];

  const snowDayRoutes: MetadataRoute.Sitemap = snowDayCities.map((slug) => ({
    url: `${baseUrl}/snow-day-calculator/${slug}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.85,
  }));

  // General city weather pages
  const cityRoutes: MetadataRoute.Sitemap = POPULAR_CITIES.map((city) => ({
    url: `${baseUrl}/weather/${city.slug}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: city.popular ? 0.75 : 0.65,
  }));

  return [...staticRoutes, ...snowDayRoutes, ...cityRoutes];
}
