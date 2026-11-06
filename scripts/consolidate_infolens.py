#!/usr/bin/env python3
"""
InfoLens SVG Infographics Consolidator & Indexer

Scans ./_article_repos/infolens/posts/ (or active infolens markdown files),
extracts YAML frontmatter and embedded <svg> vector figures,
and generates:
  1. main_site/infolens.json (for client-side Pinterest masonry, search, filters & zoom)
  2. main_site/_infolens/ (for Jekyll standalone static pages & sitemap.xml SEO)

Can be run locally during development or automatically during GitHub Actions deploy.yml.
"""

import os
import re
import json
import shutil
import argparse
from datetime import datetime, timezone, timedelta

FRONTMATTER_REGEX = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)
SVG_REGEX = re.compile(r'(<svg[\s\S]*?</svg>)', re.IGNORECASE)

def parse_simple_yaml(yaml_text):
    """
    Lightweight, robust YAML frontmatter parser for InfoLens metadata.
    Avoids external pyyaml dependency on lean GitHub runner environments.
    """
    data = {}
    current_list_key = None

    for line in yaml_text.splitlines():
        line_strip = line.strip()
        if not line_strip or line_strip.startswith('#'):
            continue

        # Check for list items under a key
        if line.startswith('  - ') or line.startswith('- '):
            if current_list_key:
                val = line_strip.lstrip('- ').strip()
                if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                    val = val[1:-1]
                data[current_list_key].append(val)
            continue

        # Check for key: value
        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip()
            val = val.strip()

            if not val: # Start of a list
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

def extract_infographic(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        fm_match = FRONTMATTER_REGEX.match(content)
        if not fm_match:
            return None

        frontmatter_raw = fm_match.group(1)
        meta = parse_simple_yaml(frontmatter_raw)

        body = content[fm_match.end():]
        svg_match = SVG_REGEX.search(body)
        if not svg_match:
            return None

        svg_content = svg_match.group(1).strip()
        # Clean SVG content (normalize whitespace)
        svg_clean = re.sub(r'[\r\n\t]+', ' ', svg_content)
        svg_clean = re.sub(r'\s{2,}', ' ', svg_clean)

        item_id = meta.get('id')
        if not item_id:
            basename = os.path.splitext(os.path.basename(file_path))[0]
            # Strip date prefix if present
            item_id = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', basename)

        return {
            "id": item_id,
            "title": meta.get("title", "Untitled Infographic"),
            "category": meta.get("category", "general"),
            "categoryLabel": meta.get("categoryLabel", meta.get("category", "General")),
            "date": str(meta.get("date", "")),
            "aspectRatio": meta.get("aspectRatio", "medium"),
            "description": meta.get("description", ""),
            "takeaways": meta.get("takeaways", []),
            "tags": meta.get("tags", []),
            "likes": int(meta.get("likes", 120)),
            "views": int(meta.get("views", 1500)),
            "relatedArticleUrl": (meta.get("related_article_url") or meta.get("relatedArticleUrl") or "").strip(),
            "svgContent": svg_clean,
            "_source_path": file_path
        }
    except Exception as e:
        print(f"Error extracting infographic from {file_path}: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Consolidate active InfoLens SVG infographics")
    parser.add_argument("--src", default="./_article_repos/infolens/posts", help="Source folder for infolens md files")
    parser.add_argument("--dest-json", default="./infolens.json", help="Path to write infolens.json")
    parser.add_argument("--dest-site-json", default="./_site/infolens.json", help="Path to write _site/infolens.json if present")
    parser.add_argument("--dest-collection", default="./_infolens", help="Jekyll _infolens collection directory")
    parser.add_argument("--days", type=int, default=60, help="Max infographic age in days (default: 60)")
    args = parser.parse_args()

    cutoff_date = (datetime.now(timezone.utc) - timedelta(days=args.days)).strftime("%Y-%m-%d")
    print("=== TMP InfoLens SVG Infographics Consolidator ===")
    print(f"Cutoff Date (Last {args.days} Days): >= {cutoff_date}")
    print(f"Source: {args.src}")
    print(f"Destination JSON: {args.dest_json}")

    infographics = []

    if os.path.exists(args.src):
        for root, dirs, files in os.walk(args.src):
            # Exclude archive directory
            if 'archive' in root.split(os.sep):
                continue

            for fname in files:
                if not fname.endswith('.md'):
                    continue

                fpath = os.path.join(root, fname)
                info = extract_infographic(fpath)
                if not info:
                    continue

                # Filter by age threshold
                item_date = info.get("date", "")
                if item_date and item_date < cutoff_date:
                    print(f"Skipping older infographic (> {args.days}d): {fname} ({item_date})")
                    continue

                infographics.append(info)

    print(f"Total active infographics extracted: {len(infographics)}")

    # Sort descending by date (or title if equal)
    infographics.sort(key=lambda x: (x.get("date", ""), x.get("id", "")), reverse=True)

    # If copying to Jekyll collection
    if args.dest_collection:
        os.makedirs(args.dest_collection, exist_ok=True)
        # Clear previous active files in collection
        for existing in os.listdir(args.dest_collection):
            if existing.endswith('.md'):
                os.remove(os.path.join(args.dest_collection, existing))

        for item in infographics:
            src_path = item.get("_source_path")
            if src_path and os.path.exists(src_path):
                dest_path = os.path.join(args.dest_collection, os.path.basename(src_path))
                shutil.copy2(src_path, dest_path)

    # Remove internal _source_path before writing JSON
    output_items = []
    for item in infographics:
        cleaned = {k: v for k, v in item.items() if not k.startswith('_')}
        output_items.append(cleaned)

    # Write to main destination JSON
    os.makedirs(os.path.dirname(os.path.abspath(args.dest_json)), exist_ok=True)
    with open(args.dest_json, 'w', encoding='utf-8') as f:
        json.dump(output_items, f, ensure_ascii=False, indent=2)
    print(f"Successfully generated {args.dest_json} ({len(output_items)} items)")

    # Also write to _site if it exists
    if args.dest_site_json:
        site_dir = os.path.dirname(os.path.abspath(args.dest_site_json))
        if os.path.exists(site_dir):
            with open(args.dest_site_json, 'w', encoding='utf-8') as f:
                json.dump(output_items, f, ensure_ascii=False, indent=2)
            print(f"Also updated {args.dest_site_json}")

if __name__ == "__main__":
    main()
