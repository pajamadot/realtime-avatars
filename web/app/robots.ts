import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/presenter-script-6f2a9c17/'],
    },
    sitemap: 'https://realtime-avatars.vercel.app/sitemap.xml',
  };
}
