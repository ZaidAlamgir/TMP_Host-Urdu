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
    const query = `
      SELECT slug, title, category, date, image 
      FROM articles 
      WHERE (LOWER(category) LIKE '%analysis%' OR LOWER(category) LIKE '%history%' OR category LIKE '%تاریخ%' OR category LIKE '%تجزیہ%')
        AND image IS NOT NULL AND image != ''
      ORDER BY RANDOM() 
      LIMIT 10
    `;
    const { results } = await db.prepare(query).all();

    const posts = (results || []).map(a => {
      const catSlug = (a.category || '')
        .toLowerCase()
        .replace(/&/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const url = catSlug ? `/news/${catSlug}/${a.slug}/` : `/news/${a.slug}/`;
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
        read_time: 5
      };
    });

    return new Response(JSON.stringify({ posts }), {
      headers: corsHeaders
    });
  } catch (err) {
    console.error("D1 Urdu archive-spotlight error:", err);
    return new Response(JSON.stringify({ error: err.message, posts: [] }), {
      status: 200,
      headers: corsHeaders
    });
  }
}
