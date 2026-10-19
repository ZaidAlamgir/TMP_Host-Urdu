/**
 * Cloudflare Pages Function: Dynamic On-Demand Archive Renderer (Urdu Edition)
 * Fallback route when requested article does not exist in pre-built _site (older than 60 days)
 *
 * Preserves 100% of original URLs (e.g. /news/:category/:slug/ or /news/:slug/)
 * Edge Cache TTL: 1 Year (s-maxage=31536000)
 */

export async function onRequest(context) {
  const { env, params, request } = context;
  const url = new URL(request.url);
  const siteOrigin = url.origin;

  // 1. Catchall Path Segments Parsing
  let segments = [];
  if (Array.isArray(params.catchall)) {
    segments = params.catchall;
  } else if (typeof params.catchall === 'string') {
    segments = params.catchall.split('/').filter(Boolean);
  }

  // If path is just /news/ without slug, pass through to static Jekyll
  if (!segments || segments.length === 0) {
    return context.next();
  }

  // Last segment is the article slug
  const rawSlug = segments[segments.length - 1];
  const cleanSlug = rawSlug.replace(/\.html$/, "").trim();
  const category = segments.length > 1 ? segments[0] : "";

  if (!cleanSlug) {
    return context.next();
  }

  // 2. Ignore reserved routes and static pages under /news/ (e.g. /news/hub/)
  const reservedSlugs = new Set(['hub', 'index', 'feed', 'search', 'category', 'tag']);
  if (reservedSlugs.has(cleanSlug.toLowerCase())) {
    return context.next();
  }

  const slugWithoutDate = cleanSlug.replace(/^\d{4}-\d{2}-\d{2}-/, '');

  // 3. Cloudflare Edge Cache Match
  const cacheKey = new Request(request.url, request);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  // 4. Database Query (Exact slug match only, no substring match)
  const db = env.DB_ARCHIVE || env.DB_UR || env.DB_1;
  if (!db) {
    console.error("D1 archive database binding not found");
    return context.next();
  }

  let post = null;
  try {
    post = await db.prepare(
      "SELECT * FROM articles WHERE slug = ? OR slug = ? LIMIT 1"
    ).bind(cleanSlug, slugWithoutDate).first();
  } catch (err) {
    console.error("D1 query error:", err);
    return context.next();
  }

  if (!post) {
    return context.next();
  }

  // 4. Fetch dynamic-template.html with caching
  const templateHtml = await fetchWithCache(`${siteOrigin}/dynamic-template.html`, context);
  if (!templateHtml) {
    return new Response("Template load failed", { status: 500 });
  }

  // 5. Format Metadata & Content
  const dateObj = new Date(post.date);
  const dateFormatted = !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('ur-PK', { month: 'long', day: 'numeric', year: 'numeric' })
    : post.date;
  const dateXml = !isNaN(dateObj.getTime()) ? dateObj.toISOString() : new Date().toISOString();

  const authorName = (post.author || 'ٹی ایم پی عملہ').replace(/^By\s+/i, '').trim();
  const authorSlug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const authorUrl = `${siteOrigin}/writer/?id=${authorSlug}&source=writer_db`;
  const cleanPath = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
  const articleUrl = `${siteOrigin}${cleanPath}`;
  const articleCategory = post.category || category || 'خبریں';
  const categorySlug = articleCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const postImage = post.image || `${siteOrigin}/android-chrome-512x512.png`;
  const postSubheadline = post.subheadline || '';
  const postImageCaption = post.image_description || (post.image ? post.title : '');
  const cleanExcerpt = (postSubheadline || post.content || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);

  // Markdown Body Rendering
  const renderedBody = renderMarkdown(post.content || '');

  // Full Article Markup matching Urdu post.html
  const articleMarkup = `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Noto+Sans+Arabic:wght@400;600;700&display=swap');
      .article-container { max-width: 1000px; margin: 0 auto; padding: 0.5rem 1rem 2rem 1rem; color: #111827; flex-grow: 1; direction: rtl; text-align: right; }
      .article-headline { font-family: 'Noto Nastaliq Urdu', 'Noto Sans Arabic', Tahoma, serif; font-weight: 700; font-size: 38px; line-height: 1.8; margin-bottom: 0.85rem; word-wrap: break-word; color: #111827; }
      .article-subheadline { font-family: 'Noto Sans Arabic', 'Noto Nastaliq Urdu', Tahoma, sans-serif; font-size: 20px; color: #4b5563; line-height: 1.8; margin-top: 0; margin-bottom: 1rem; font-weight: 400; }
      .article-meta { display: flex; flex-direction: row-reverse; align-items: center; justify-content: space-between; font-family: 'Noto Sans Arabic', Tahoma, sans-serif; font-size: 15px; color: #6b7280; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; margin-bottom: 1.5rem; }
      .article-meta .author-name { font-weight: 700; color: #111827; }
      .article-meta .publish-date { color: #6b7280; }
      .article-tags { margin-bottom: 0.75rem; text-align: right; }
      .article-tags .tag { display: inline-block; background-color: #fee2e2; color: #dc2626; font-size: 13px; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-family: 'Noto Sans Arabic', sans-serif; }
      .article-body { font-family: 'Noto Nastaliq Urdu', 'Noto Sans Arabic', Tahoma, serif; font-size: 20px; line-height: 2.2; color: #1f2937; direction: rtl; text-align: right; }
      .article-body p { margin-bottom: 1.5rem; }
      .article-body h2 { font-size: 26px; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #111827; }
      .article-body h3 { font-size: 22px; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.75rem; color: #111827; }
      .article-figure { max-width: 100%; margin: 0 auto 1.5rem auto; padding: 0; }
      .article-figure img { width: 100%; max-height: 520px; object-fit: cover; border-radius: 8px; display: block; margin: 0 auto; }
      .article-image-caption { font-family: 'Noto Sans Arabic', Tahoma, sans-serif; font-size: 14px; color: #6b7280; margin-top: 0.5rem; text-align: center; }
      .share-btn { background: #f3f4f6; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; color: #374151; font-size: 14px; transition: background 0.2s; }
      .share-btn:hover { background: #e5e7eb; }
      @media (max-width: 768px) {
        .article-headline { font-size: 26px; line-height: 1.7; }
        .article-subheadline { font-size: 17px; }
        .article-body { font-size: 18px; line-height: 2.0; }
      }
      html.dark-mode .article-headline { color: #f9fafb !important; }
      html.dark-mode .article-subheadline { color: #9ca3af !important; }
      html.dark-mode .article-body { color: #d1d5db !important; }
      html.dark-mode .article-meta { border-color: #374151 !important; color: #9ca3af !important; }
      html.dark-mode .article-meta .author-name { color: #f3f4f6 !important; }
      html.dark-mode .article-tags .tag { background-color: #7f1d1d !important; color: #fca5a5 !important; }
      html.dark-mode .share-btn { background: #374151 !important; color: #e5e7eb !important; }
    </style>

    <div class="article-container" dir="rtl">
      <article>
        <header>
          <div class="article-tags">
            <span class="tag">${escapeHtml(articleCategory)}</span>
          </div>
          <h1 class="article-headline">${escapeHtml(post.title)}</h1>
          ${postSubheadline ? `<div class="article-subheadline">${escapeHtml(postSubheadline)}</div>` : ''}
          <div class="article-meta">
            <div>
              <span class="author-name">تحریر: ${escapeHtml(authorName)}</span> • 
              <time class="publish-date" datetime="${dateXml}">${dateFormatted}</time>
            </div>
            <div>
              <button class="share-btn" onclick="navigator.clipboard.writeText(window.location.href); alert('لنک کاپی ہو گیا!');" title="شیئر کریں"><i class="fas fa-share-alt"></i></button>
            </div>
          </div>
        </header>

        <div class="article-body">
          ${post.image ? `
            <figure class="article-figure">
              <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" fetchpriority="high">
              ${postImageCaption ? `<figcaption class="article-image-caption">${escapeHtml(postImageCaption)}</figcaption>` : ''}
            </figure>
          ` : ''}
          ${renderedBody}
        </div>
      </article>
    </div>
  `;

  // 6. Schema.org Structured Data
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${articleUrl}#article`,
    "mainEntityOfPage": { "@type": "WebPage", "@id": articleUrl },
    "headline": post.title,
    "image": [postImage],
    "datePublished": dateXml,
    "dateModified": dateXml,
    "author": { "@type": "Person", "@id": `${authorUrl}#identity`, "name": authorName, "url": authorUrl },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "@id": `${siteOrigin}#publisher`,
      "name": "The Urdu Post",
      "logo": { "@type": "ImageObject", "url": `${siteOrigin}/android-chrome-512x512.png` }
    },
    "description": cleanExcerpt,
    "isAccessibleForFree": true
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "صفحہ اول", "item": siteOrigin },
      { "@type": "ListItem", "position": 2, "name": articleCategory, "item": `${siteOrigin}/news/${categorySlug}/` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": articleUrl }
    ]
  };

  const articleMetaTags = `
    <meta property="article:published_time" content="${dateXml}">
    <meta property="article:modified_time" content="${dateXml}">
    <meta property="article:section" content="${escapeHtml(articleCategory)}">
    <meta property="article:author" content="${authorUrl}">
    <script type="application/ld+json">${JSON.stringify(jsonLdArticle)}</script>
    <script type="application/ld+json">${JSON.stringify(jsonLdBreadcrumb)}</script>
  `;

  // 7. Assemble Full HTML Document
  let finalHtml = templateHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(post.title)} - دی مسلم پوسٹ</title>`)
    .replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${articleUrl}">`)
    .replace(/<meta property="og:type"[^>]*>/i, `<meta property="og:type" content="article">`)
    .replace(/<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(post.title)}">`)
    .replace(/<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(cleanExcerpt)}">`)
    .replace(/<meta property="og:image"[^>]*>/i, `<meta property="og:image" content="${escapeHtml(postImage)}">`)
    .replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${articleUrl}">`)
    .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(cleanExcerpt)}">`)
    .replace(/<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(post.title)}">`)
    .replace(/<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(cleanExcerpt)}">`)
    .replace(/<meta name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(postImage)}">`)
    .replace(/<meta name="twitter:url"[^>]*>/i, `<meta name="twitter:url" content="${articleUrl}">`)
    .replace('REPLACE_ME_CONTENT', articleMarkup)
    .replace(/<div[^>]*id="dynamic-title-holder"[^>]*>.*?<\/div>/i, '')
    .replace('</head>', `${articleMetaTags}</head>`);

  const response = new Response(finalHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, stale-while-revalidate=86400",
      "X-Render-Engine": "D1-Edge-OnDemand",
      "X-Archived-Post": cleanSlug
    }
  });

  // Store in Cloudflare Edge Cache
  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

async function fetchWithCache(url, context) {
  const cache = caches.default;
  const cacheKey = new Request(url);
  let response = await cache.match(cacheKey);
  if (!response) {
    try {
      response = await fetch(url);
      if (response.ok) {
        context.waitUntil(cache.put(cacheKey, response.clone()));
      }
    } catch (e) {
      return null;
    }
  }
  return await response.text();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarkdown(md) {
  if (!md) return '';
  let html = md.replace(/!\[(.*?)\]\((.*?)\)/g, '<figure class="article-figure"><img src="$2" alt="$1" loading="lazy" decoding="async"><figcaption class="article-image-caption">$1</figcaption></figure>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  return html
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      if (p.startsWith('### ')) return `<h3>${p.slice(4)}</h3>`;
      if (p.startsWith('## ')) return `<h2>${p.slice(3)}</h2>`;
      if (p.startsWith('# ')) return `<h2>${p.slice(2)}</h2>`;
      if (p.startsWith('> ')) return `<blockquote class="speech-box">${p.slice(2)}</blockquote>`;
      if (p.startsWith('<figure') || p.startsWith('<table') || p.startsWith('<div')) return p;
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}
