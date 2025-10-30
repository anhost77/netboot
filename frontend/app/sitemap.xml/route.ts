import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://bettracker.io';
  const currentDate = new Date().toISOString().split('T')[0];

  // Pages statiques
  const staticPages = [
    '',
    '/calendrier-courses',
    '/pronostics',
    '/blog',
    '/hippodromes',
    '/register',
    '/login',
    '/fonctionnalites',
    '/tarifs',
  ];

  // Générer le XML du sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page === '' || page === '/calendrier-courses' || page === '/pronostics' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : page.startsWith('/calendrier') || page.startsWith('/pronostics') ? '0.9' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
