#!/usr/bin/env python3
"""
Production Post Archival & Cloudflare D1 Ingestion Script (Option B: Pure Age Threshold > 60 Days)

Features:
- Scans posts in _posts/
- Identifies articles older than cutoff (default 60 days)
- Extracts frontmatter metadata & markdown content
- Upserts records into Cloudflare D1 via Cloudflare REST API in batches
- Moves archived markdown files to archive/ folder in Git
- Supports --dry-run for safe validation
"""

import os
import sys
import glob
import re
import json
import argparse
from datetime import datetime, timezone, timedelta
import urllib.request
import urllib.error

# Regex to parse frontmatter without external yaml dependencies
FRONTMATTER_REGEX = re.compile(r'^---\s*\n(.*?)\n---\s*\n(.*)$', re.DOTALL)

def parse_simple_yaml(yaml_text):
    data = {}
    lines = yaml_text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line or line.strip().startswith('#'):
            i += 1
            continue
        
        match = re.match(r'^([a-zA-Z0-9_\-]+)\s*:\s*(.*)$', line)
        if match:
            key, val = match.groups()
            key = key.strip()
            val = val.strip()

            # Check for inline list [a, b, c]
            if val.startswith('[') and val.endswith(']'):
                items = [x.strip().strip('"\'') for x in val[1:-1].split(',') if x.strip()]
                data[key] = items
            # Check for quoted string
            elif (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                data[key] = val[1:-1]
            elif val == '':
                # Might be a multiline list
                items = []
                j = i + 1
                while j < len(lines) and re.match(r'^\s*-\s+(.*)$', lines[j]):
                    item_val = re.match(r'^\s*-\s+(.*)$', lines[j]).group(1).strip().strip('"\'')
                    items.append(item_val)
                    j += 1
                if items:
                    data[key] = items
                    i = j - 1
                else:
                    data[key] = ''
            else:
                data[key] = val
        i += 1
    return data

def parse_article(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    match = FRONTMATTER_REGEX.match(content)
    if not match:
        return None, None

    fm_raw, body = match.groups()
    meta = parse_simple_yaml(fm_raw)
    return meta, body.strip()

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
            return data
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        raise RuntimeError(f"D1 API HTTP {e.code}: {err_body}")

def ensure_d1_schema(account_id, token, database_id):
    schema_sql = """
    CREATE TABLE IF NOT EXISTS articles (
        slug TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subheadline TEXT,
        author TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        image TEXT,
        image_description TEXT,
        tags TEXT,
        content TEXT NOT NULL,
        language TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(date);
    CREATE INDEX IF NOT EXISTS idx_articles_cat_date ON articles(category, date);
    """
    return execute_d1_query(account_id, token, database_id, schema_sql)

def main():
    parser = argparse.ArgumentParser(description="Archive Jekyll articles older than threshold into Cloudflare D1")
    parser.add_argument("--repo-dir", default=".", help="Root path of Jekyll repository")
    parser.add_argument("--posts-dir", default="_posts", help="Subdirectory containing active posts")
    parser.add_argument("--archive-dir", default="archive", help="Subdirectory to store archived posts")
    parser.add_argument("--days", type=int, default=60, help="Cutoff age in days (Option B: 60 days)")
    parser.add_argument("--language", choices=["en", "hi", "ur"], default=None, help="Language code")
    parser.add_argument("--cf-account-id", default=os.getenv("CLOUDFLARE_ACCOUNT_ID"), help="Cloudflare Account ID")
    parser.add_argument("--cf-token", default=os.getenv("CLOUDFLARE_API_TOKEN") or os.getenv("CLOUDFLARE_API_KEY"), help="Cloudflare API Token")
    parser.add_argument("--db-id", default=os.getenv("D1_DATABASE_ID"), help="Cloudflare D1 Database ID")
    parser.add_argument("--dry-run", action="store_true", help="Simulate without writing to D1 or moving files")
    args = parser.parse_args()

    repo_dir = os.path.abspath(args.repo_dir)
    posts_path = os.path.join(repo_dir, args.posts_dir)
    archive_path = os.path.join(repo_dir, args.archive_dir)

    if not os.path.exists(posts_path):
        print(f"Error: Posts directory not found at {posts_path}")
        sys.exit(1)

    # Detect language if not provided
    lang = args.language
    if not lang:
        repo_name = os.path.basename(repo_dir).lower()
        if "urdu" in repo_name:
            lang = "ur"
        elif "hindi" in repo_name:
            lang = "hi"
        else:
            lang = "en"

    cutoff_dt = datetime.now(timezone.utc) - timedelta(days=args.days)
    print(f"=== Option B: Pure Age Archival (Threshold > {args.days} Days) ===")
    print(f"Repository: {repo_dir}")
    print(f"Language:   {lang}")
    print(f"Cutoff:     {cutoff_dt.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"Dry Run:    {args.dry_run}\n")

    if not args.dry_run:
        if not args.cf_account_id or not args.cf_token or not args.db_id:
            print("Error: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and D1_DATABASE_ID must be provided when not running with --dry-run.")
            sys.exit(1)
        os.makedirs(archive_path, exist_ok=True)
        print("Ensuring D1 database table schema...")
        ensure_d1_schema(args.cf_account_id, args.cf_token, args.db_id)

    post_files = sorted(glob.glob(os.path.join(posts_path, "*.md")))
    archived_count = 0
    active_count = 0

    upsert_sql = """
    INSERT INTO articles (slug, title, subheadline, author, category, date, image, image_description, tags, content, language)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
        title=excluded.title,
        subheadline=excluded.subheadline,
        author=excluded.author,
        category=excluded.category,
        date=excluded.date,
        image=excluded.image,
        image_description=excluded.image_description,
        tags=excluded.tags,
        content=excluded.content,
        language=excluded.language;
    """

    for file_path in post_files:
        filename = os.path.basename(file_path)
        # Extract date from filename prefix (YYYY-MM-DD-...)
        date_prefix_match = re.match(r'^(\d{4}-\d{2}-\d{2})-(.*)\.md$', filename)
        if not date_prefix_match:
            continue

        file_date_str, default_slug = date_prefix_match.groups()
        try:
            post_dt = datetime.strptime(file_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError:
            continue

        if post_dt < cutoff_dt:
            # Qualifies for D1 Archival
            meta, body = parse_article(file_path)
            if not meta:
                continue

            slug = meta.get("slug") or default_slug
            title = meta.get("title") or default_slug.replace("-", " ").title()
            subheadline = meta.get("subheadline") or meta.get("description") or ""
            author = meta.get("author") or meta.get("writer") or "TMP Staff"
            
            categories = meta.get("categories") or meta.get("category") or "news"
            if isinstance(categories, list):
                category = categories[0] if categories else "news"
            else:
                category = str(categories)

            image = meta.get("image") or ""
            image_desc = meta.get("image_description") or ""
            tags = meta.get("tags") or []
            tags_json = json.dumps(tags if isinstance(tags, list) else [tags], ensure_ascii=False)
            
            # Post date ISO string
            pub_date = meta.get("date") or file_date_str
            if isinstance(pub_date, datetime):
                date_str = pub_date.isoformat()
            else:
                date_str = str(pub_date)

            params = [
                slug, title, subheadline, author, category,
                date_str, image, image_desc, tags_json, body, lang
            ]

            if args.dry_run:
                print(f"[DRY-RUN ARCHIVE] {filename} -> D1 (slug: {slug})")
            else:
                try:
                    execute_d1_query(args.cf_account_id, args.cf_token, args.db_id, upsert_sql, params)
                    # Move file to archive directory
                    target_dest = os.path.join(archive_path, filename)
                    os.rename(file_path, target_dest)
                    print(f"[ARCHIVED & MOVED] {filename} -> archive/{filename}")
                except Exception as ex:
                    print(f"Error archiving {filename}: {ex}", file=sys.stderr)
                    continue

            archived_count += 1
        else:
            active_count += 1

    print("\n=== Archival Summary ===")
    print(f"Total Posts Evaluated: {len(post_files)}")
    print(f"Moved to Archive / D1: {archived_count}")
    print(f"Remaining in _posts:   {active_count}")

if __name__ == "__main__":
    main()
