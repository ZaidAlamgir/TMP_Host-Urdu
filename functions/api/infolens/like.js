/**
 * POST /api/infolens/like
 * Body: { id: "brics-vs-g7-gdp-2026" }
 * Cloudflare Pages Function: Atomic Like Counter
 */

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

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

  try {
    const body = await request.json().catch(() => ({}));
    const id = (body?.id || "").trim();

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing infographic ID" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // Atomic increment with SQLite RETURNING
    let likes = 0;
    try {
      const stmt = db.prepare(
        "UPDATE infographics SET likes = likes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING likes"
      );
      const res = await stmt.bind(id).first();
      likes = res?.likes ?? 0;
    } catch (_) {
      // Fallback for drivers where RETURNING is constrained
      await db.prepare("UPDATE infographics SET likes = likes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(id).run();
      const readRes = await db.prepare("SELECT likes FROM infographics WHERE id = ?").bind(id).first();
      likes = readRes?.likes ?? 0;
    }

    return new Response(JSON.stringify({ success: true, id, likes }), {
      headers: {
        "Content-Type": "application/json",
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
