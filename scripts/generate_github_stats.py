"""Nightly coding-activity aggregate over the last 12 months, all owned repos.

Writes src/data/github_stats.json with totals only — commits, lines added and
deleted, number of repositories touched (and how many are private). Private
repository names never leave this script.

Needs STATS_TOKEN: a fine-grained PAT owned by the profile, "All repositories",
Contents + Metadata read-only. Without it the script exits and the existing
file is left untouched (the site then simply hides the line).
"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone

import requests

USERNAME = "snonow"
API = "https://api.github.com/graphql"
OUT = "src/data/github_stats.json"
# Commits this large are almost always generated or vendored files (lockfiles,
# data dumps, bulk imports) and would drown the signal.
MAX_LINES_PER_COMMIT = 5000

TOKEN = os.environ.get("STATS_TOKEN")
if not TOKEN:
    print("STATS_TOKEN not set — skipping coding-activity stats.")
    sys.exit(0)

HEADERS = {"Authorization": f"Bearer {TOKEN}", "User-Agent": "arno-wilhelm.dev"}


def gql(query, **variables):
    r = requests.post(API, headers=HEADERS, json={"query": query, "variables": variables}, timeout=30)
    r.raise_for_status()
    body = r.json()
    if body.get("errors"):
        raise RuntimeError(body["errors"])
    return body["data"]


def owned_repos():
    query = """
    query($login: String!, $after: String) {
      user(login: $login) {
        id
        repositories(first: 100, after: $after, ownerAffiliations: OWNER, isFork: false) {
          pageInfo { hasNextPage endCursor }
          nodes { name isPrivate defaultBranchRef { name } }
        }
      }
    }"""
    after, repos, user_id = None, [], None
    while True:
        user = gql(query, login=USERNAME, after=after)["user"]
        user_id = user["id"]
        page = user["repositories"]
        repos += [r for r in page["nodes"] if r["defaultBranchRef"]]
        if not page["pageInfo"]["hasNextPage"]:
            return user_id, repos
        after = page["pageInfo"]["endCursor"]


def commits_since(repo, user_id, since):
    query = """
    query($owner: String!, $name: String!, $author: ID!, $since: GitTimestamp!, $after: String) {
      repository(owner: $owner, name: $name) {
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 100, after: $after, since: $since, author: { id: $author }) {
                pageInfo { hasNextPage endCursor }
                nodes { additions deletions }
              }
            }
          }
        }
      }
    }"""
    after = None
    while True:
        data = gql(query, owner=USERNAME, name=repo, author=user_id, since=since, after=after)
        history = data["repository"]["defaultBranchRef"]["target"]["history"]
        yield from history["nodes"]
        if not history["pageInfo"]["hasNextPage"]:
            return
        after = history["pageInfo"]["endCursor"]


def main():
    since = (datetime.now(timezone.utc) - timedelta(days=365)).strftime("%Y-%m-%dT%H:%M:%SZ")
    user_id, repos = owned_repos()

    commits = additions = deletions = 0
    touched = touched_private = 0
    for repo in repos:
        n = 0
        for c in commits_since(repo["name"], user_id, since):
            n += 1
            if c["additions"] + c["deletions"] > MAX_LINES_PER_COMMIT:
                continue
            additions += c["additions"]
            deletions += c["deletions"]
        if n:
            commits += n
            touched += 1
            touched_private += repo["isPrivate"]

    stats = {
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "period_days": 365,
        "commits": commits,
        "additions": additions,
        "deletions": deletions,
        "repos": touched,
        "private_repos": touched_private,
    }
    with open(OUT, "w") as f:
        json.dump(stats, f, indent=2)
    print(f"{commits} commits, +{additions}/-{deletions} lines across {touched} repos ({touched_private} private)")


if __name__ == "__main__":
    main()
