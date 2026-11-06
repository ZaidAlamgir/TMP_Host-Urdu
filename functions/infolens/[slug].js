/**
 * Cloudflare Pages Function: On-Demand Edge SSR Fallback for InfoLens (/infolens/:slug)
 * Fallback route when requested infographic does not exist in pre-built _site (> 60 days)
 *
 * Edge Cache TTL: 1 Year (s-maxage=31536000, immutable)
 */

export async function onRequestGet(context) {
  const { request, env, params, next } = context;

  // 1. First serve static file if pre-rendered by Jekyll
  const staticResponse = await next();
  if (staticResponse && staticResponse.status !== 404) {
    return staticResponse;
  }

  const rawSlug = params.slug || "";
  const cleanSlug = rawSlug.replace(/\.html$/, "").trim();
  if (!cleanSlug || cleanSlug === "index") {
    return staticResponse;
  }

  // 2. Check Cloudflare Edge Cache
  const cacheKey = new Request(request.url, request);
  const cache = caches.default;
  let cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  // 3. Query D1 for archived infographic
  const db = env.DB_INFOLENS;
  if (!db) {
    return staticResponse;
  }

  let row = null;
  try {
    const slugWithoutDate = cleanSlug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
    row = await db.prepare(
      "SELECT * FROM infographics WHERE slug = ? OR id = ? OR slug = ? LIMIT 1"
    ).bind(cleanSlug, cleanSlug, slugWithoutDate).first();
  } catch (err) {
    console.error("D1 InfoLens query error:", err);
    return staticResponse;
  }

  if (!row) {
    return staticResponse;
  }

  // 4. Parse Takeaways & Format Display Data
  let takeaways = [];
  try {
    takeaways = row.takeaways_json ? JSON.parse(row.takeaways_json) : [];
  } catch (_) {
    takeaways = [];
  }

  const url = new URL(request.url);
  const siteOrigin = url.origin;
  const canonicalUrl = `${siteOrigin}/infolens/${row.slug}/`;
  const categoryLabel = row.category_label || row.category || "Visual Journalism";
  const publishedDate = row.published_date || "";

  const takeawaysHtml = takeaways.map(t => `
    <li style="display:flex; align-items:flex-start; gap:0.75rem; font-size:0.95rem; line-height:1.5; color:#334155;">
      <svg style="width:18px; height:18px; flex-shrink:0; margin-top:2px; fill:#0284c7;" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
      </svg>
      <span>${escapeHtml(t)}</span>
    </li>
  `).join("");

  const isRtl = (row.language || "").toLowerCase() === "ur";

  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(row.language || 'en')}" ${isRtl ? 'dir="rtl"' : ''}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(row.title)} - TMP InfoLens</title>
  <meta name="description" content="${escapeHtml(row.description || row.title)}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- OpenGraph & Twitter Cards -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(row.title)}">
  <meta property="og:description" content="${escapeHtml(row.description || row.title)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="The Muslim Post - InfoLens">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(row.title)}">
  <meta name="twitter:description" content="${escapeHtml(row.description || row.title)}">

  <link rel="stylesheet" href="/assets/style/infolens.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    body { margin:0; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background:#f8fafc; color:#0f172a; }
    .infolens-ssr-nav { padding:1rem 1.5rem; background:#ffffff; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; }
    .infolens-ssr-back { font-weight:700; color:#0284c7; text-decoration:none; display:inline-flex; align-items:center; gap:0.5rem; }
    .infolens-ssr-back:hover { text-decoration:underline; }
    .infolens-ssr-container { max-width:960px; margin:2rem auto; padding:0 1.25rem; }
    .infolens-ssr-badge { display:inline-block; padding:4px 12px; background:#e0f2fe; color:#0369a1; border-radius:9999px; font-weight:800; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; }
    .infolens-ssr-title { font-size:clamp(1.5rem, 3.5vw, 2.25rem); font-weight:900; line-height:1.25; margin:0.85rem 0 0.5rem; color:#0f172a; }
    .infolens-ssr-date { font-size:0.9rem; color:#64748b; margin-bottom:1.5rem; }
    .infolens-ssr-svg-stage { background:#0f172a; padding:1.75rem; border-radius:16px; margin-bottom:2rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.15); display:flex; justify-content:center; align-items:center; overflow:hidden; }
    .infolens-ssr-svg-stage svg { max-width:100%; height:auto; display:block; }
    .infolens-ssr-desc { font-size:1.05rem; line-height:1.65; color:#334155; margin-bottom:2rem; }
    .infolens-ssr-takeaways { background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); }
    .infolens-ssr-takeaways h3 { margin:0 0 1rem; font-size:1.1rem; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:0.5rem; }
    .infolens-ssr-takeaways ul { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.85rem; }
    .infolens-ssr-btn-article { display:inline-flex; align-items:center; gap:0.5rem; padding:12px 24px; background:#0284c7; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:700; transition:background 0.2s; }
    .infolens-ssr-btn-article:hover { background:#0369a1; }
  </style>
</head>
<body>
  <header class="infolens-ssr-nav">
    <a href="/infolens/" class="infolens-ssr-back">&larr; Back to InfoLens Hub</a>
    <span style="font-weight:800; font-size:0.85rem; color:#64748b; letter-spacing:0.05em;">TMP INFOLENS ARCHIVE</span>
  </header>

  <main class="infolens-ssr-container">
    <span class="infolens-ssr-badge">${escapeHtml(categoryLabel)}</span>
    <h1 class="infolens-ssr-title">${escapeHtml(row.title)}</h1>
    <div class="infolens-ssr-date">Published on ${escapeHtml(publishedDate)}</div>

    <div class="infolens-ssr-svg-stage">
      ${row.svg_content}
    </div>

    ${row.description ? `<p class="infolens-ssr-desc">${escapeHtml(row.description)}</p>` : ""}

    ${takeaways.length ? `
    <div class="infolens-ssr-takeaways">
      <h3><i class="fas fa-bolt" style="color:#f59e0b;"></i> Key Data Takeaways</h3>
      <ul>
        ${takeawaysHtml}
      </ul>
    </div>` : ""}

    ${row.related_article_url ? `
    <div style="margin-top:2.5rem; text-align:center;">
      <a href="${escapeHtml(row.related_article_url)}" class="infolens-ssr-btn-article">
        <i class="fas fa-newspaper"></i> Read Full Investigative Article &rarr;
      </a>
    </div>` : ""}
  </main>
</body>
</html>`;

  const renderedResponse = new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
      "X-Render-Engine": "D1-InfoLens-Edge-SSR"
    }
  });

  context.waitUntil(cache.put(cacheKey, renderedResponse.clone()));
  return renderedResponse;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
