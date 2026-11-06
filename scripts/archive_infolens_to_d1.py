#!/usr/bin/env python3
"""
Production InfoLens SVG Infographics Archival & Cloudflare D1 Ingestion Script

Features:
- Scans markdown files in source directory (e.g. posts/)
- Extracts YAML frontmatter and embedded <svg> vector figures
- Identifies infographics older than cutoff (default 60 days)
- Upserts records into Cloudflare D1 via Cloudflare REST API
- Moves archived markdown files to archive/ folder in Git
- Supports --dry-run for safe validation
"""

import os
import sys
import glob
import re
import json
import shutil
import argparse
from datetime import datetime, timezone, timedelta
import urllib.request
import urllib.error

FRONTMATTER_REGEX = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)
SVG_REGEX = re.compile(r'(<svg[\s\S]*?</svg>)', re.IGNORECASE)

def parse_simple_yaml(yaml_text):
    """
    Lightweight, robust YAML frontmatter parser avoiding external dependencies.
    """
    data = {}
    current_list_key = None

    for line in yaml_text.splitlines():
        line_strip = line.strip()
        if not line_strip or line_strip.startswith('#'):
            continue

        if line.startswith('  - ') or line.startswith('- '):
            if current_list_key:
                val = line_strip.lstrip('- ').strip()
                if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                    val = val[1:-1]
                data[current_list_key].append(val)
            continue

        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip()
            val = val.strip()

            if not val:
                current_list_key = key
                data[key] = []
            else:
                current_list_key = None
                if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                    val = val[1:-1]
                elif val.isdigit():
                    val = int(val)
                elif val.lower() == 'true':
                    val = True
                elif val.lower() == 'false':
                    val = False
                data[key] = val

    return data

def extract_infographic_data(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        fm_match = FRONTMATTER_REGEX.match(content)
        if not fm_match:
            return None

        meta = parse_simple_yaml(fm_match.group(1))

        body = content[fm_match.end():]
        svg_match = SVG_REGEX.search(body)
        if not svg_match:
            return None

        svg_content = svg_match.group(1).strip()
        # Normalize excessive whitespace in raw SVG
        svg_clean = re.sub(r'[\r\n\t]+', ' ', svg_content)
        svg_clean = re.sub(r'\s{2,}', ' ', svg_clean)

        filename = os.path.basename(file_path)
        default_slug = os.path.splitext(filename)[0]
        # Strip date prefix if present (YYYY-MM-DD-...)
        default_slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', default_slug)

        item_id = str(meta.get('id') or default_slug)
        slug = str(meta.get('slug') or item_id)
        title = str(meta.get('title') or default_slug.replace('-', ' ').title())
        category = str(meta.get('category') or 'general').lower()
        category_label = str(meta.get('categoryLabel') or meta.get('category_label') or category.title())
        date_str = str(meta.get('date') or '')
        aspect_ratio = str(meta.get('aspectRatio') or meta.get('aspect_ratio') or 'medium')
        description = str(meta.get('description') or '')
        takeaways = meta.get('takeaways') or []
        tags = meta.get('tags') or []
        likes = int(meta.get('likes') or 0)
        views = int(meta.get('views') or 0)
        related_article_url = str(meta.get('related_article_url') or meta.get('relatedArticleUrl') or '')
        language = str(meta.get('language') or 'en').lower()

        return {
            "id": item_id,
            "slug": slug,
            "title": title,
            "category": category,
            "category_label": category_label,
            "published_date": date_str,
            "aspect_ratio": aspect_ratio,
            "description": description,
            "takeaways_json": json.dumps(takeaways if isinstance(takeaways, list) else [takeaways], ensure_ascii=False),
            "tags_json": json.dumps(tags if isinstance(tags, list) else [tags], ensure_ascii=False),
            "likes": likes,
            "views": views,
            "related_article_url": related_article_url,
            "svg_content": svg_clean,
            "language": language,
            "filename": filename,
            "filepath": file_path
        }
    except Exception as ex:
        print(f"Warning: Failed parsing {file_path}: {ex}", file=sys.stderr)
        return None

def execute_d1_query(account_id, token, database_id, sql, params=None):
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database/{database_id}/query"
    payload = {"sql": sql}
    if params:
        payload["params"] = params

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if not data.get("success"):
                raise RuntimeError(f"D1 API error: {data.get('errors')}")
            return data
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        raise RuntimeError(f"D1 API HTTP {e.code}: {err_body}")

def ensure_d1_schema(account_id, token, database_id):
    schema_statements = [
        """CREATE TABLE IF NOT EXISTS infographics (
            id TEXT PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            category_label TEXT NOT NULL,
            published_date TEXT NOT NULL,
            aspect_ratio TEXT DEFAULT 'medium',
            description TEXT,
            takeaways_json TEXT,
            tags_json TEXT,
            likes INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            related_article_url TEXT,
            svg_content TEXT NOT NULL,
            language TEXT DEFAULT 'en',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );""",
        "CREATE INDEX IF NOT EXISTS idx_infolens_published_date ON infographics(language, published_date DESC);",
        "CREATE INDEX IF NOT EXISTS idx_infolens_category ON infographics(language, category, published_date DESC);",
        "CREATE INDEX IF NOT EXISTS idx_infolens_slug ON infographics(slug);",
        "CREATE INDEX IF NOT EXISTS idx_infolens_popular ON infographics(language, likes DESC, published_date DESC);"
    ]
    for stmt in schema_statements:
        execute_d1_query(account_id, token, database_id, stmt)

def main():
    parser = argparse.ArgumentParser(description="Archive older SVG infographics into Cloudflare D1")
    parser.add_argument("--src", required=True, help="Directory containing active infographic markdown files")
    parser.add_argument("--archive", required=True, help="Directory to store archived infographic files")
    parser.add_argument("--days", type=int, default=60, help="Age threshold in days for archival (default: 60)")
    parser.add_argument("--language", "--lang", dest="language", default=None, help="Default language override ('en', 'hi', 'ur')")
    parser.add_argument("--cf-account-id", default=os.getenv("CLOUDFLARE_ACCOUNT_ID"), help="Cloudflare Account ID")
    parser.add_argument("--cf-token", default=os.getenv("CLOUDFLARE_API_TOKEN") or os.getenv("CLOUDFLARE_API_KEY"), help="Cloudflare API Token")
    parser.add_argument("--db-id", default=os.getenv("D1_INFOLENS_DATABASE_ID") or os.getenv("D1_DATABASE_ID"), help="Cloudflare D1 Database ID")
    parser.add_argument("--dry-run", action="store_true", help="Simulate without writing to D1 or moving files")
    args = parser.parse_args()

    src_dir = os.path.abspath(args.src)
    archive_dir = os.path.abspath(args.archive)

    if not os.path.exists(src_dir):
        print(f"Error: Source directory not found at {src_dir}")
        sys.exit(1)

    cutoff_date = (datetime.now(timezone.utc) - timedelta(days=args.days)).strftime("%Y-%m-%d")

    print("=== TMP InfoLens SVG D1 Archival Engine ===")
    print(f"Source Directory:  {src_dir}")
    print(f"Archive Directory: {archive_dir}")
    print(f"Cutoff Threshold:  < {cutoff_date} (> {args.days} Days Old)")
    print(f"Dry Run Mode:      {args.dry_run}\n")

    if not args.dry_run:
        if not args.cf_account_id or not args.cf_token or not args.db_id:
            print("Error: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and D1_INFOLENS_DATABASE_ID are required when not running --dry-run.")
            sys.exit(1)
        os.makedirs(archive_dir, exist_ok=True)
        print("Ensuring Cloudflare D1 table schema and indexes...")
        ensure_d1_schema(args.cf_account_id, args.cf_token, args.db_id)

    upsert_sql = """
    INSERT INTO infographics (
        id, slug, title, category, category_label, published_date,
        aspect_ratio, description, takeaways_json, tags_json,
        likes, views, related_article_url, svg_content, language, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
        slug = excluded.slug,
        title = excluded.title,
        category = excluded.category,
        category_label = excluded.category_label,
        published_date = excluded.published_date,
        aspect_ratio = excluded.aspect_ratio,
        description = excluded.description,
        takeaways_json = excluded.takeaways_json,
        tags_json = excluded.tags_json,
        related_article_url = excluded.related_article_url,
        svg_content = excluded.svg_content,
        language = excluded.language,
        updated_at = CURRENT_TIMESTAMP;
    """

    md_files = sorted(glob.glob(os.path.join(src_dir, "*.md")))
    archived_count = 0
    active_count = 0

    for file_path in md_files:
        info = extract_infographic_data(file_path)
        if not info:
            continue

        item_date = info["published_date"]
        # If date is in YYYY-MM-DD prefix of filename
        if not item_date:
            date_match = re.match(r'^(\d{4}-\d{2}-\d{2})', info["filename"])
            if date_match:
                item_date = date_match.group(1)
                info["published_date"] = item_date

        if args.language:
            info["language"] = args.language

        # Compare with cutoff date (ISO format string comparison is valid for YYYY-MM-DD)
        if item_date and item_date < cutoff_date:
            params = [
                info["id"], info["slug"], info["title"], info["category"], info["category_label"],
                info["published_date"], info["aspect_ratio"], info["description"],
                info["takeaways_json"], info["tags_json"], info["likes"], info["views"],
                info["related_article_url"], info["svg_content"], info["language"]
            ]

            if args.dry_run:
                print(f"[DRY-RUN ARCHIVE] {info['filename']} (Date: {item_date}) -> D1 id: {info['id']}")
            else:
                try:
                    execute_d1_query(args.cf_account_id, args.cf_token, args.db_id, upsert_sql, params)
                    target_dest = os.path.join(archive_dir, info["filename"])
                    shutil.move(file_path, target_dest)
                    print(f"[ARCHIVED & MOVED] {info['filename']} -> archive/{info['filename']}")
                except Exception as ex:
                    print(f"Error archiving {info['filename']}: {ex}", file=sys.stderr)
                    continue

            archived_count += 1
        else:
            active_count += 1

    print("\n=== InfoLens Archival Summary ===")
    print(f"Total Infographics Evaluated: {len(md_files)}")
    print(f"Archived & Synced to D1:      {archived_count}")
    print(f"Active Infographics (< {args.days}d): {active_count}")

if __name__ == "__main__":
    main()
