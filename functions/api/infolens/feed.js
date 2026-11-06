/**
 * GET /api/infolens/feed?page=1&limit=20&category=all&lang=ur&search=
 * Cloudflare Pages Function: Paginated InfoLens Feed API (Urdu Edition)
 */

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const db = env.DB_INFOLENS;
  if (!db) {
    return new Response(JSON.stringify({ error: "DB_INFOLENS binding not configured" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;
  const category = url.searchParams.get("category") || "all";
  const lang = url.searchParams.get("lang") || "ur";
  const search = url.searchParams.get("search")?.trim();

  try {
    let query = `
      SELECT id, slug, title, category, category_label as categoryLabel,
             published_date as date, aspect_ratio as aspectRatio, description,
             takeaways_json, tags_json, likes, views,
             related_article_url as relatedArticleUrl, svg_content as svgContent
      FROM infographics
      WHERE 1=1
    `;
    const params = [];

    if (lang && lang !== "all") {
      query += " AND (language = ? OR language IS NULL OR language = '')";
      params.push(lang);
    }

    if (category && category !== "all") {
      query += " AND category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND (title LIKE ? OR description LIKE ? OR tags_json LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += " ORDER BY published_date DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const { results } = await db.prepare(query).bind(...params).all();

    const items = (results || []).map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category,
      categoryLabel: row.categoryLabel,
      date: row.date,
      aspectRatio: row.aspectRatio,
      description: row.description,
      takeaways: row.takeaways_json ? safeJsonParse(row.takeaways_json, []) : [],
      tags: row.tags_json ? safeJsonParse(row.tags_json, []) : [],
      likes: row.likes || 0,
      views: row.views || 0,
      relatedArticleUrl: row.relatedArticleUrl || "",
      svgContent: row.svgContent || ""
    }));

    return new Response(JSON.stringify({
      page,
      limit,
      count: items.length,
      items
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

function safeJsonParse(val, fallback) {
  try {
    return JSON.parse(val);
  } catch (_) {
    return fallback;
  }
}
