#!/usr/bin/env python3
"""
InfoLens SVG Infographics Consolidator & Indexer (Dual-Source Edition)

Scans:
  1. Standalone InfoLens infographics from ./_article_repos/infolens/posts/
  2. Embedded editorial <svg> graphics from active article posts (e.g. ./main_site/_posts/ or ./_posts/)

Generates:
  1. main_site/infolens.json (for client-side Pinterest masonry, search, filters & zoom)
  2. main_site/_infolens/ (for Jekyll standalone static pages & sitemap.xml SEO & D1 archival)

Features:
  - 100% namespace isolated: Article SVGs use 'art-svg-{slug}' prefix (zero ID/D1 collisions)
  - Automatic article linking: 'relatedArticleUrl' points directly to the published article
  - Instant (0ms delay) & zero extra GitHub Action workflows
"""

import os
import re
import json
import shutil
import argparse
from datetime import datetime, timezone, timedelta

FRONTMATTER_REGEX = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)
SVG_REGEX = re.compile(r'(<svg[\s\S]*?</svg>)', re.IGNORECASE)

# Mapping from article categories to InfoLens 8 canonical categories
CATEGORY_MAP = {
    'defense': ('defense', 'Defense & Security'),
    'world-politics': ('geopolitics', 'Geopolitics & Alliances'),
    'indian-politics': ('geopolitics', 'Geopolitics & Alliances'),
    'muslim-world': ('geopolitics', 'Geopolitics & Alliances'),
    'global-economy': ('economy', 'Economy & Trade'),
    'technology': ('technology', 'Technology & AI'),
    'climate': ('climate', 'Climate & Energy'),
    'weather': ('climate', 'Climate & Energy'),
    'space': ('space', 'Space & Science'),
    'medical-science': ('technology', 'Technology & Medical Science'),
    'history': ('geopolitics', 'History & Geopolitics'),
    'indian-muslims': ('human-rights', 'Human Rights & Society'),
    'speeches-press-conference': ('geopolitics', 'Geopolitics & Speeches'),
    'war': ('defense', 'Defense & Conflict'),
    'crime-alert': ('human-rights', 'Society & Law Enforcement'),
    'art-culture': ('general', 'Culture & Society'),
    'sports': ('general', 'Sports & Analytics'),
    'national-news': ('geopolitics', 'National Affairs'),
    'international-news': ('geopolitics', 'International Affairs')
}

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

def extract_infographic(file_path):
    """
    Extracts standalone infographic from the dedicated infolens repository.
    """
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
        svg_clean = re.sub(r'[\r\n\t]+', ' ', svg_content)
        svg_clean = re.sub(r'\s{2,}', ' ', svg_clean)

        item_id = meta.get('id')
        if not item_id:
            basename = os.path.splitext(os.path.basename(file_path))[0]
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
            "_source_path": file_path,
            "_is_article_svg": False
        }
    except Exception as e:
        print(f"Error extracting infographic from {file_path}: {e}")
        return None

def extract_svgs_from_article(file_path, cutoff_date=""):
    """
    Scans an article markdown post. If an embedded <svg> is found, extracts the graphic,
    maps category and metadata, and sets relatedArticleUrl back to the original article.
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Fast pre-check: skip immediately if no <svg> tag is present
        if '<svg' not in content.lower():
            return []

        fm_match = FRONTMATTER_REGEX.match(content)
        if not fm_match:
            return []

        frontmatter_raw = fm_match.group(1)
        meta = parse_simple_yaml(frontmatter_raw)
        body = content[fm_match.end():]

        # Standalone InfoLens infographics have categoryLabel or aspectRatio
        # which normal editorial news articles never possess. Skip them if encountered in article paths.
        if 'categoryLabel' in meta or 'aspectRatio' in meta:
            return []

        # Article date and cutoff check
        basename = os.path.splitext(os.path.basename(file_path))[0]
        date_str = str(meta.get('date', ''))[:10]
        if not date_str or not re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
            date_match = re.match(r'^(\d{4}-\d{2}-\d{2})', basename)
            date_str = date_match.group(1) if date_match else ""

        if cutoff_date and date_str and date_str < cutoff_date:
            return []

        # Article slug and URL
        slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', basename)
        raw_cat = meta.get('category') or meta.get('categories') or 'general'
        if isinstance(raw_cat, list) and len(raw_cat) > 0:
            article_category = str(raw_cat[0]).strip()
        else:
            article_category = str(raw_cat).strip()

        cat_slug = re.sub(r'[^a-z0-9]+', '-', article_category.lower()).strip('-')
        related_article_url = f"/news/{cat_slug}/{slug}/" if cat_slug else f"/news/{slug}/"

        # Map to InfoLens 8-category taxonomy
        infolens_cat, infolens_label = CATEGORY_MAP.get(cat_slug, ('general', 'General Visual Journalism'))
        if infolens_cat == 'general':
            # Fallback heuristic
            for k, (c, l) in CATEGORY_MAP.items():
                if k in cat_slug:
                    infolens_cat, infolens_label = c, l
                    break

        article_title = meta.get('title', 'Editorial Article')
        subheadline = str(meta.get('subheadline') or '').strip()
        description = subheadline if subheadline else article_title

        takeaways = meta.get('takeaways') or []
        if not takeaways and subheadline:
            takeaways = [subheadline]

        tags = meta.get('tags') or [cat_slug]
        if isinstance(tags, str):
            tags = [tags]

        # Scan for <figure class="tmp-editorial-svg-figure"> or standalone <svg>
        figure_pattern = re.compile(
            r'(<figure[^>]*class=[\'"][^\'"]*tmp-editorial-svg-figure[^\'"]*[\'"][^>]*>[\s\S]*?</figure>)|(<svg[\s\S]*?</svg>)',
            re.IGNORECASE
        )

        matches = figure_pattern.findall(body)
        results = []
        svg_index = 0

        for fig_match, standalone_svg in matches:
            block = fig_match if fig_match else standalone_svg
            svg_inner = SVG_REGEX.search(block)
            if not svg_inner:
                continue

            svg_content = svg_inner.group(1).strip()
            # Clean whitespace
            svg_clean = re.sub(r'[\r\n\t]+', ' ', svg_content)
            svg_clean = re.sub(r'\s{2,}', ' ', svg_clean)

            # Skip tiny SVG icons (< 400 bytes)
            if len(svg_clean) < 400:
                continue

            svg_index += 1
            # Guaranteed unique namespace: 'art-svg-{slug}'
            item_id = f"art-svg-{slug}" if svg_index == 1 else f"art-svg-{slug}-{svg_index}"

            # Extract graphic title
            graphic_title = article_title
            title_attr_m = re.search(r'data-svg-title=[\'"]([^\'"]+)[\'"]', block, re.IGNORECASE)
            if title_attr_m:
                graphic_title = title_attr_m.group(1).strip()
            else:
                caption_m = re.search(r'class=[\'"][^\'"]*tmp-svg-caption-title[^\'"]*[\'"][^>]*>([\s\S]*?)</', block, re.IGNORECASE)
                if caption_m:
                    clean_cap = re.sub(r'<[^>]+>', '', caption_m.group(1)).strip()
                    if clean_cap:
                        graphic_title = clean_cap

            # Aspect ratio from viewBox
            aspect_ratio = "tall"
            viewbox_m = re.search(r'viewBox=[\'"]0\s+0\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)[\'"]', svg_content, re.IGNORECASE)
            if viewbox_m:
                w, h = float(viewbox_m.group(1)), float(viewbox_m.group(2))
                ratio = w / h if h > 0 else 1.0
                if ratio > 1.3:
                    aspect_ratio = "wide"
                elif ratio < 0.8:
                    aspect_ratio = "tall"
                else:
                    aspect_ratio = "medium"

            results.append({
                "id": item_id,
                "title": graphic_title,
                "category": infolens_cat,
                "categoryLabel": infolens_label,
                "date": date_str,
                "aspectRatio": aspect_ratio,
                "description": description,
                "takeaways": takeaways,
                "tags": tags,
                "likes": int(meta.get("likes", 120)),
                "views": int(meta.get("views", 1500)),
                "relatedArticleUrl": related_article_url,
                "svgContent": svg_clean,
                "_source_path": file_path,
                "_is_article_svg": True
            })

        return results
    except Exception as e:
        print(f"Error scanning article {file_path} for SVGs: {e}")
        return []

def write_article_svg_markdown(item, dest_path):
    """
    Writes a standalone markdown file for an extracted article SVG inside _infolens/
    so the 24h archival sync automatically ingests it into Cloudflare D1.
    """
    try:
        takeaways_yaml = "\n".join([f'  - "{t}"' for t in item.get('takeaways', [])])
        tags_yaml = "\n".join([f'  - "{t}"' for t in item.get('tags', [])])
        escaped_title = item['title'].replace('"', '\\"')
        escaped_desc = item.get('description', '').replace('"', '\\"')

        md_content = f"""---
id: "{item['id']}"
title: "{escaped_title}"
category: "{item['category']}"
categoryLabel: "{item['categoryLabel']}"
date: "{item['date']}"
aspectRatio: "{item['aspectRatio']}"
description: "{escaped_desc}"
language: "en"
tags:
{tags_yaml}
takeaways:
{takeaways_yaml}
likes: {item.get('likes', 120)}
views: {item.get('views', 1500)}
related_article_url: "{item.get('relatedArticleUrl', '')}"
---

<figure class="tmp-editorial-svg-figure">
{item['svgContent']}
</figure>
"""
        with open(dest_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
    except Exception as e:
        print(f"Failed to write article SVG markdown to {dest_path}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Consolidate active InfoLens SVG infographics (Standalone + Article SVGs)")
    parser.add_argument("--src", default="./_article_repos/infolens/posts", help="Source folder for infolens md files")
    parser.add_argument("--posts-src", default="./main_site/_posts", help="Source folder for article posts containing embedded SVGs")
    parser.add_argument("--dest-json", default="./infolens.json", help="Path to write infolens.json")
    parser.add_argument("--dest-site-json", default="./_site/infolens.json", help="Path to write _site/infolens.json if present")
    parser.add_argument("--dest-collection", default="./_infolens", help="Jekyll _infolens collection directory")
    parser.add_argument("--days", type=int, default=60, help="Max infographic age in days (default: 60)")
    args = parser.parse_args()

    cutoff_date = (datetime.now(timezone.utc) - timedelta(days=args.days)).strftime("%Y-%m-%d")
    print("=== TMP InfoLens SVG Infographics Consolidator (Dual Source) ===")
    print(f"Cutoff Date (Last {args.days} Days): >= {cutoff_date}")
    print(f"Standalone SVG Source: {args.src}")
    print(f"Article Posts Source:  {args.posts_src}")
    print(f"Destination JSON:      {args.dest_json}")

    infographics = []
    seen_ids = set()
    seen_slugs = set()
    seen_titles = set()
    seen_svg_hashes = set()

    def normalize_title(t):
        return re.sub(r'[^a-z0-9]', '', str(t).lower())

    def svg_hash(s):
        import hashlib
        clean = re.sub(r'\s+', '', str(s).lower())
        return hashlib.md5(clean.encode('utf-8')).hexdigest()

    # 1. Ingest standalone infographics from dedicated SVG repository
    if os.path.exists(args.src):
        for root, dirs, files in os.walk(args.src):
            if 'archive' in root.split(os.sep):
                continue

            for fname in files:
                if not fname.endswith('.md'):
                    continue

                fpath = os.path.join(root, fname)
                info = extract_infographic(fpath)
                if not info:
                    continue

                item_date = info.get("date", "")
                if item_date and item_date < cutoff_date:
                    continue

                info_id = str(info["id"]).strip()
                if info_id not in seen_ids:
                    seen_ids.add(info_id)
                    seen_slugs.add(info_id.lower())
                    seen_titles.add(normalize_title(info.get("title", "")))
                    seen_svg_hashes.add(svg_hash(info.get("svgContent", "")))
                    infographics.append(info)

    standalone_count = len(infographics)
    print(f"Standalone infographics ingested: {standalone_count}")

    # 2. Ingest embedded SVGs from article posts
    # Check fallback paths if default not found (e.g. running locally from TMP_Host)
    posts_dir = args.posts_src
    if not os.path.exists(posts_dir):
        if os.path.exists("./_posts"):
            posts_dir = "./_posts"
        elif os.path.exists("../_posts"):
            posts_dir = "../_posts"

    article_svg_count = 0
    if os.path.exists(posts_dir):
        for root, dirs, files in os.walk(posts_dir):
            parts = root.split(os.sep)
            # Never scan standalone infolens repo directories or _infolens collection
            if 'infolens' in parts or '_infolens' in parts or 'archive' in parts:
                continue

            for fname in files:
                if not fname.endswith('.md'):
                    continue

                # Strip date to get core slug
                base_slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', os.path.splitext(fname)[0]).lower()
                if base_slug in seen_slugs or base_slug in seen_ids:
                    continue

                fpath = os.path.join(root, fname)
                article_svgs = extract_svgs_from_article(fpath, cutoff_date)
                for svg_item in article_svgs:
                    raw_id = svg_item["id"]
                    core_id = re.sub(r'^art-svg-', '', raw_id).lower()
                    norm_title = normalize_title(svg_item.get("title", ""))
                    s_hash = svg_hash(svg_item.get("svgContent", ""))

                    # Deduplication guard: ignore if core_id, title, or SVG content already exists
                    if (raw_id in seen_ids or
                        core_id in seen_slugs or
                        core_id in seen_ids or
                        norm_title in seen_titles or
                        s_hash in seen_svg_hashes):
                        continue

                    seen_ids.add(raw_id)
                    seen_slugs.add(core_id)
                    seen_titles.add(norm_title)
                    seen_svg_hashes.add(s_hash)
                    infographics.append(svg_item)
                    article_svg_count += 1
                    print(f"  + Extracted SVG: '{svg_item['title']}' from {fname}")

    print(f"Article embedded SVGs extracted: {article_svg_count}")
    print(f"Total combined infographics:     {len(infographics)}")

    # 3. Sort descending by date (most recent first)
    infographics.sort(key=lambda x: (x.get("date", ""), x.get("id", "")), reverse=True)

    # 4. Copy / Write to Jekyll collection directory (_infolens)
    if args.dest_collection:
        os.makedirs(args.dest_collection, exist_ok=True)
        for existing in os.listdir(args.dest_collection):
            if existing.endswith('.md'):
                os.remove(os.path.join(args.dest_collection, existing))

        for item in infographics:
            if item.get("_is_article_svg"):
                dest_path = os.path.join(args.dest_collection, f"{item['date']}-{item['id']}.md")
                write_article_svg_markdown(item, dest_path)
            else:
                src_path = item.get("_source_path")
                if src_path and os.path.exists(src_path):
                    dest_path = os.path.join(args.dest_collection, os.path.basename(src_path))
                    shutil.copy2(src_path, dest_path)

    # 5. Write to infolens.json (for client-side masonry grid)
    output_items = []
    for item in infographics:
        cleaned = {k: v for k, v in item.items() if not k.startswith('_')}
        output_items.append(cleaned)

    os.makedirs(os.path.dirname(os.path.abspath(args.dest_json)), exist_ok=True)
    with open(args.dest_json, 'w', encoding='utf-8') as f:
        json.dump(output_items, f, ensure_ascii=False, indent=2)
    print(f"Successfully generated {args.dest_json} ({len(output_items)} items)")

    if args.dest_site_json:
        site_dir = os.path.dirname(os.path.abspath(args.dest_site_json))
        if os.path.exists(site_dir):
            with open(args.dest_site_json, 'w', encoding='utf-8') as f:
                json.dump(output_items, f, ensure_ascii=False, indent=2)
            print(f"Also updated {args.dest_site_json}")

if __name__ == "__main__":
    main()
