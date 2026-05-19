import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://sauatty.kz';
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/kiru`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/tirkelu`, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
