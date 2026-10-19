/**
 * Cloudflare Pages Function: Dynamic Archive Search API (Urdu)
 * Queries historical articles archived in Cloudflare D1
 * Edge Cached for 5 minutes (300s)
 */

export async function onRequest(context) {
  const { env, request } = context;
  const db = env.DB_ARCHIVE || env.DB_UR || env.DB_1;
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim();

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300, s-maxage=600"
  };

  if (!query || query.length < 2) {
    return new Response(JSON.stringify({ query, count: 0, results: [] }), { headers });
  }

  if (!db) {
    return new Response(JSON.stringify({ query, count: 0, results: [], error: "D1 database binding not configured" }), {
      headers,
      status: 200
    });
  }

  try {
    const searchPattern = `%${query}%`;
    const sql = `
      SELECT slug, title, subheadline, category, date, image, image_desc, tags
      FROM articles
      WHERE title LIKE ? OR subheadline LIKE ? OR tags LIKE ?
      ORDER BY date DESC
      LIMIT 50
    `;
    const { results } = await db.prepare(sql).bind(searchPattern, searchPattern, searchPattern).all();

    const formatted = (results || []).map(row => {
      const articleUrl = row.category
        ? `/news/${row.category}/${row.slug}/`
        : `/news/${row.slug}/`;
      return {
        title: row.title,
        url: articleUrl,
        date: row.date,
        tags: row.tags,
        subheadline: row.subheadline || "",
        image: row.image || "",
        image_description: row.image_desc || "",
        is_archive: true
      };
    });

    return new Response(JSON.stringify({
      query,
      count: formatted.length,
      results: formatted
    }), { headers });

  } catch (err) {
    console.error("D1 search error:", err);
    return new Response(JSON.stringify({ query, count: 0, results: [], error: err.message }), {
      headers,
      status: 200
    });
  }
}
