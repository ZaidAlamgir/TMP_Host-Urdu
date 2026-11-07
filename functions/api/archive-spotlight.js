/**
 * Cloudflare Pages Function: Dynamic Archive Spotlight API (Urdu)
 * Returns 10 randomly selected evergreen articles from Cloudflare D1 (analysis & history only)
 * Edge Cache TTL: None (Fresh random picks on every request / refresh)
 */

export async function onRequest(context) {
  const { env } = context;
  const db = env.DB_ARCHIVE || env.DB_UR || env.DB_1;

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store, no-cache, must-revalidate"
  };

  if (!db) {
    return new Response(JSON.stringify({ error: "Database binding not found", posts: [] }), {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // 1. Primary query: Evergreen In-Depth, Analysis, History, Geopolitical Reports
    const query = `
      SELECT slug, title, category, date, image, tags
      FROM articles 
      WHERE image IS NOT NULL AND image != ''
        AND (
          LOWER(category) LIKE '%analysis%' 
          OR LOWER(category) LIKE '%history%'
          OR LOWER(category) LIKE '%strategic%'
          OR LOWER(category) LIKE '%defense%'
          OR LOWER(category) LIKE '%politics%'
          OR LOWER(category) LIKE '%war%'
          OR LOWER(category) LIKE '%economy%'
          OR (tags IS NOT NULL AND (LOWER(tags) LIKE '%analysis%' OR LOWER(tags) LIKE '%history%' OR LOWER(tags) LIKE '%breaking%'))
          OR LOWER(title) LIKE '%analysis%'
          OR LOWER(title) LIKE '%history%'
          OR LOWER(title) LIKE '%report%'
          OR LOWER(title) LIKE '%crisis%'
          OR LOWER(slug) LIKE '%analysis%'
          OR LOWER(slug) LIKE '%history%'
        )
      ORDER BY RANDOM() 
      LIMIT 10
    `;
    let { results } = await db.prepare(query).all();
    results = results || [];

    // 2. Always guarantee 10 cards: If database has fewer than 10 matching, fill with any archive articles
    if (results.length < 10) {
      const existingSlugs = new Set(results.map(r => r.slug));
      const needed = 10 - results.length;
      try {
        const fillRes = await db.prepare(`
          SELECT slug, title, category, date, image, tags
          FROM articles 
          WHERE image IS NOT NULL AND image != ''
          ORDER BY RANDOM()
          LIMIT ?
        `).bind(needed + 5).all();
        for (const row of (fillRes.results || [])) {
          if (!existingSlugs.has(row.slug)) {
            existingSlugs.add(row.slug);
            results.push(row);
            if (results.length >= 10) break;
          }
        }
      } catch (e) {
        console.warn("Could not fill archive spotlight:", e);
      }
    }

    const posts = results.map(a => {
      let catSlug = (a.category || '')
        .toLowerCase()
        .replace(/&/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (catSlug === '[]' || catSlug === '') catSlug = 'news';
      const url = `/news/${catSlug}/${a.slug}/`;
      const dateObj = new Date(a.date);
      const displayDate = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('ur-PK', { month: 'short', day: 'numeric', year: 'numeric' })
        : a.date;
      return {
        title: a.title,
        url: url,
        date: a.date,
        display_date: displayDate,
        image: a.image,
        category: a.category || 'تجزیہ',
        read_time: 5,
        is_local: false
      };
    });

    return new Response(JSON.stringify({ posts }), {
      headers: corsHeaders
    });
  } catch (err) {
    console.error("D1 archive-spotlight error:", err);
    return new Response(JSON.stringify({ error: err.message, posts: [] }), {
      status: 200,
      headers: corsHeaders
    });
  }
}
