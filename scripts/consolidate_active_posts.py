#!/usr/bin/env python3
"""
Production Active Post Consolidator (Option B: Pure Age Threshold > 60 Days)

Runs during GitHub Actions 'deploy.yml' Step 41.
Scans all checked-out category repos in ./_article_repos/
Copies ONLY articles published within the last 60 days into ./main_site/_posts.

Articles older than 60 days are skipped so Jekyll builds in 2-3 seconds,
and are served on-demand by Cloudflare Pages Functions from Cloudflare D1.
"""

import os
import re
import shutil
import argparse
from datetime import datetime, timezone, timedelta

FRONTMATTER_DATE_REGEX = re.compile(r'^date\s*:\s*["\']?([^"\']+)["\']?', re.MULTILINE)

def extract_article_date(file_path):
    filename = os.path.basename(file_path)
    # 1. Try filename date prefix (YYYY-MM-DD-...)
    m = re.match(r'^(\d{4}-\d{2}-\d{2})', filename)
    if m:
        return m.group(1)

    # 2. Try parsing frontmatter date
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            header = f.read(2048) # Read first 2KB
        fm_match = FRONTMATTER_DATE_REGEX.search(header)
        if fm_match:
            date_raw = fm_match.group(1).strip()
            dm = re.match(r'^(\d{4}-\d{2}-\d{2})', date_raw)
            if dm:
                return dm.group(1)
    except Exception:
        pass

    return None

def main():
    parser = argparse.ArgumentParser(description="Filter and consolidate active posts (< 60 days)")
    parser.add_argument("--src", default="./_article_repos", help="Path to checked out article repos")
    parser.add_argument("--dest", default="./main_site/_posts", help="Target _posts folder for Jekyll")
    parser.add_argument("--days", type=int, default=60, help="Max article age in days (default: 60)")
    args = parser.parse_args()

    cutoff_date = (datetime.now(timezone.utc) - timedelta(days=args.days)).strftime("%Y-%m-%d")
    print(f"=== Option B Active Post Consolidation ===")
    print(f"Cutoff Date (Last {args.days} Days): >= {cutoff_date}")
    print(f"Source: {args.src}")
    print(f"Destination: {args.dest}\n")

    os.makedirs(args.dest, exist_ok=True)

    if not os.path.exists(args.src):
        print(f"Warning: Source directory {args.src} does not exist.")
        return

    copied = 0
    skipped_older = 0

    # Walk through all directories in _article_repos recursively
    for root, dirs, files in os.walk(args.src):
        # We only care about files under a 'posts' or '_posts' directory
        parts = root.split(os.sep)
        if 'posts' not in parts and '_posts' not in parts:
            continue

        for fname in files:
            if not fname.endswith(".md"):
                continue

            file_path = os.path.join(root, fname)
            article_date = extract_article_date(file_path)

            target_file = os.path.join(args.dest, fname)

            if article_date is None or article_date >= cutoff_date:
                # Active post: copy to _posts for Jekyll compilation
                shutil.copy2(file_path, target_file)
                copied += 1
            else:
                # Older than 60 days: skip (served by D1 Edge Function)
                skipped_older += 1

    print(f"\n--- Consolidation Summary ---")
    print(f"Active posts copied to _posts (< {args.days}d): {copied}")
    print(f"Older posts skipped (served via D1 Edge):       {skipped_older}")

if __name__ == "__main__":
    main()
