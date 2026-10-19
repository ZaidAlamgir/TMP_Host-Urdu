#!/usr/bin/env python3
"""
Reorganizes GitHub content repositories in TheMuslimPost:
Moves posts older than 60 days from posts/ (or _posts/) into archive/
using the GitHub Git Data API (atomic, zero content re-upload).
"""

import os
import sys
import json
import re
import argparse
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta

def get_headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "TMP-Repo-Reorganizer"
    }

def reorganize_repo(org, repo_name, token, cutoff_date, dry_run=False):
    headers = get_headers(token)
    base_url = f"https://api.github.com/repos/{org}/{repo_name}"

    # 1. Get branch ref
    ref_url = f"{base_url}/git/ref/heads/main"
    try:
        req = urllib.request.Request(ref_url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            ref_data = json.loads(resp.read().decode('utf-8'))
            latest_commit_sha = ref_data['object']['sha']
    except Exception as e:
        print(f"[{repo_name}] Could not get main ref: {e}")
        return 0

    # 2. Get tree
    tree_url = f"{base_url}/git/trees/{latest_commit_sha}?recursive=1"
    try:
        req = urllib.request.Request(tree_url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            tree_data = json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"[{repo_name}] Could not get tree: {e}")
        return 0

    tree_entries = tree_data.get('tree', [])
    moves = []
    for item in tree_entries:
        p = item['path']
        if (p.startswith('posts/') or p.startswith('_posts/')) and p.endswith('.md'):
            fname = p.split('/')[-1]
            m = re.match(r'^(\d{4}-\d{2}-\d{2})-(.*)\.md$', fname)
            if m:
                file_date = m.group(1)
                if file_date < cutoff_date:
                    if p.startswith('posts/'):
                        new_path = p.replace('posts/', 'archive/', 1)
                    else:
                        new_path = p.replace('_posts/', 'archive/', 1)
                    moves.append((p, new_path, item['sha'], item['mode']))

    if not moves:
        return 0

    print(f"[{repo_name}] Found {len(moves)} older posts to move to archive/...")

    if dry_run:
        for old_p, new_p, _, _ in moves[:3]:
            print(f"   [DRY RUN] {old_p} -> {new_p}")
        return len(moves)

    # 3. Create new tree entries
    # In GitHub API, to delete a path, specify sha: None (null)
    new_tree = []
    for old_p, new_p, blob_sha, mode in moves:
        # Delete old path
        new_tree.append({
            "path": old_p,
            "mode": mode,
            "type": "blob",
            "sha": None
        })
        # Add new path
        new_tree.append({
            "path": new_p,
            "mode": mode,
            "type": "blob",
            "sha": blob_sha
        })

    # POST new tree
    post_tree_url = f"{base_url}/git/trees"
    tree_payload = {
        "base_tree": tree_data['sha'],
        "tree": new_tree
    }
    req = urllib.request.Request(post_tree_url, data=json.dumps(tree_payload).encode('utf-8'), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            created_tree = json.loads(resp.read().decode('utf-8'))
            new_tree_sha = created_tree['sha']
    except urllib.error.HTTPError as e:
        print(f"[{repo_name}] Failed to create tree: {e.code} - {e.read().decode('utf-8')}", file=sys.stderr)
        return 0

    # 4. Create commit
    post_commit_url = f"{base_url}/git/commits"
    commit_payload = {
        "message": f"chore(archive): move {len(moves)} posts older than 60 days to archive/ [skip ci]",
        "tree": new_tree_sha,
        "parents": [latest_commit_sha]
    }
    req = urllib.request.Request(post_commit_url, data=json.dumps(commit_payload).encode('utf-8'), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            created_commit = json.loads(resp.read().decode('utf-8'))
            new_commit_sha = created_commit['sha']
    except urllib.error.HTTPError as e:
        print(f"[{repo_name}] Failed to create commit: {e.code} - {e.read().decode('utf-8')}", file=sys.stderr)
        return 0

    # 5. Update branch ref
    update_ref_url = f"{base_url}/git/refs/heads/main"
    ref_payload = {"sha": new_commit_sha}
    req = urllib.request.Request(update_ref_url, data=json.dumps(ref_payload).encode('utf-8'), headers=headers, method="PATCH")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"[{repo_name}] Successfully moved {len(moves)} posts to archive/ (commit {new_commit_sha[:7]})!")
            return len(moves)
    except urllib.error.HTTPError as e:
        print(f"[{repo_name}] Failed to update ref: {e.code} - {e.read().decode('utf-8')}", file=sys.stderr)
        return 0

def main():
    parser = argparse.ArgumentParser(description="Reorganize content repos into posts/ and archive/")
    parser.add_argument("--org", default="TheMuslimPost", help="GitHub Organization")
    parser.add_argument("--days", type=int, default=60, help="Cutoff days")
    parser.add_argument("--repo", default=None, help="Target specific repository only")
    parser.add_argument("--dry-run", action="store_true", help="Simulate moves without committing")
    args = parser.parse_args()

    token = os.getenv("GITHUB_PAT")
    if not token:
        # Try loading from .env
        env_path = "/media/alamgir-zk/debian13-hdd/alamgir-zk/TMP_news/TMP-writer-login/.env"
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    if line.startswith("GITHUB_PAT="):
                        token = line.strip().split("=", 1)[1].strip("\"'")
                        break

    if not token:
        print("Error: GITHUB_PAT not found.", file=sys.stderr)
        sys.exit(1)

    cutoff_date = (datetime.now(timezone.utc) - timedelta(days=args.days)).strftime("%Y-%m-%d")
    print(f"Target Org: {args.org}")
    print(f"Cutoff Date (< 60 Days): < {cutoff_date}")
    print(f"Dry Run: {args.dry_run}\n")

    headers = get_headers(token)

    if args.repo:
        repos = [{"name": args.repo}]
    else:
        # Fetch all repos
        repos = []
        page = 1
        while True:
            url = f"https://api.github.com/orgs/{args.org}/repos?per_page=100&page={page}"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if not data:
                    break
                repos.extend(data)
                page += 1

    total_moved = 0
    updated_repos = 0
    for r in repos:
        rname = r['name']
        moved = reorganize_repo(args.org, rname, token, cutoff_date, dry_run=args.dry_run)
        if moved > 0:
            total_moved += moved
            updated_repos += 1

    print(f"\n==========================================")
    print(f"Summary: Moved {total_moved} posts to archive/ across {updated_repos} repositories.")
    print(f"==========================================")

if __name__ == "__main__":
    main()
