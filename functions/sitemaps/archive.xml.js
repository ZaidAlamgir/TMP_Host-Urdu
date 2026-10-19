/**
 * Cloudflare Pages Function: Dynamic Archive Sitemap (Urdu)
 * Generates an XML sitemap of all archived articles from Cloudflare D1
 * Cached at the CDN edge for 24 hours (86400s)
 */

export async function onRequest(context) {
  const { env, request } = context;
  const db = env.DB_ARCHIVE || env.DB_UR || env.DB_1;
  const url = new URL(request.url);
  const siteOrigin = url.origin;

  const cacheKey = new Request(request.url, request);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  if (!db) {
    return new Response("Database not configured", { status: 500 });
  }

  let articles = [];
  try {
    const query = await db.prepare(
      "SELECT slug, category, date FROM articles ORDER BY date DESC"
    ).all();
    articles = query.results || [];
  } catch (err) {
    console.error("Archive sitemap D1 error:", err);
  }

  const xmlEntries = articles.map(a => {
    const loc = a.category ? `${siteOrigin}/news/${a.category}/${a.slug}/` : `${siteOrigin}/news/${a.slug}/`;
    const lastmod = a.date ? (new Date(a.date).toISOString().split('T')[0] || '') : '';
    return `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;

  const response = new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400"
    }
  });

  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
