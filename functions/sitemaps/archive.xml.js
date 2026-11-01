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
  const isPurge = url.searchParams.has("purge") || url.searchParams.has("refresh");

  // Versioned cache key so updates immediately bypass older cached XML
  const cacheKey = new Request(`${siteOrigin}/sitemaps/archive.xml?v=20261101_v2`, {
    headers: { "Accept": "application/xml" }
  });
  const cache = caches.default;

  if (!isPurge) {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) return cachedResponse;
  }

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
    const categorySlug = sanitizeCategory(a.category);
    const slug = sanitizeSlug(a.slug);
    if (!slug) return "";

    const loc = categorySlug
      ? `${siteOrigin}/news/${categorySlug}/${slug}/`
      : `${siteOrigin}/news/${slug}/`;

    const lastmod = formatDate(a.date);

    return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).filter(Boolean).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;

  const response = new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Sitemap-Version": "20261101_v2"
    }
  });

  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

function sanitizeCategory(rawCategory) {
  if (!rawCategory) return "";
  let cat = String(rawCategory).trim();

  // Handle JSON array string e.g. "[]" or '["news"]'
  if (cat.startsWith("[") && cat.endsWith("]")) {
    try {
      const parsed = JSON.parse(cat);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cat = String(parsed[0] || "").trim();
      } else {
        return "";
      }
    } catch (_) {
      cat = cat.replace(/[\[\]"']/g, "").trim();
    }
  }

  if (!cat || cat === "[]" || cat.toLowerCase() === "null" || cat.toLowerCase() === "undefined") {
    return "";
  }

  // Convert to clean URL slug: e.g. "Art & Culture" -> "art-culture"
  return cat
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeSlug(rawSlug) {
  if (!rawSlug) return "";
  return String(rawSlug)
    .trim()
    .replace(/\.html$/, "")
    .replace(/^\/+|\/+$/g, "");
}

function xmlEscape(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(rawDate) {
  if (!rawDate) return "";
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  } catch (_) {}
  return "";
}
