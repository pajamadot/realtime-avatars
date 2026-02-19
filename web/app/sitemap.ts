import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://realtime-avatars.vercel.app';
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/learn`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/learn/end-to-end`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/learn/gaussian-splatting`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/learn/metahuman`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/learn/metahuman/architecture`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/learn/video-generation`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/gaussian-video-wall`, lastModified, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/slides`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/presenter-script`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/rapport`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/livekit`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
  ];
}
