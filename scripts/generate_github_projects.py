import os
import json
import re
import requests
from datetime import datetime, timezone
from urllib.parse import quote, urlparse

USERNAME = "snonow"
API = "https://api.github.com"
RAW_BASE = "https://raw.githubusercontent.com"
# Badge services produce status chips, not screenshots — keep them out of the gallery.
BADGE_HOSTS = ("img.shields.io", "badgen.net", "badge.fury.io", "codecov.io")
MAX_IMAGES = 6
HEADERS = {
    "Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}",
    "Accept": "application/vnd.github+json",
}

def get(url):
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    return r.json()

def get_pinned_repos():
    # GitHub API does NOT expose pinned repos directly
    # We use the GraphQL API for that
    query = {
        "query": f"""
        {{
          user(login: "{USERNAME}") {{
            pinnedItems(first: 10, types: REPOSITORY) {{
              nodes {{
                ... on Repository {{
                  name
                  description
                  url
                  stargazerCount
                  primaryLanguage {{ name }}
                  defaultBranchRef {{ name }}
                  repositoryTopics(first: 10) {{
                    nodes {{ topic {{ name }} }}
                  }}
                }}
              }}
            }}
          }}
        }}
        """
    }

    r = requests.post(
        f"{API}/graphql",
        headers=HEADERS,
        json=query
    )
    r.raise_for_status()
    return r.json()["data"]["user"]["pinnedItems"]["nodes"]

def resolve_image_url(src, repo, branch):
    """Turn a README image reference into a browser-loadable URL (or None)."""
    src = src.strip()
    if '"' in src:  # markdown title form: ![alt](path "title")
        src = src.split('"')[0].strip()
    if not src or src.startswith("data:"):
        return None
    basename = src.rsplit("/", 1)[-1].lower()
    if re.search(r"favicon|logo|icon", basename):
        return None  # branding assets, not project screenshots
    parsed = urlparse(src)
    if parsed.scheme in ("http", "https"):
        host = parsed.netloc.lower()
        if any(b in host for b in BADGE_HOSTS) or parsed.path.lower().endswith(".svg"):
            return None
        if host == "github.com" and "/blob/" in parsed.path:
            return RAW_BASE + parsed.path.replace("/blob/", "/", 1)
        return src
    if src.lower().endswith(".svg"):
        return None
    # Relative path inside the repo → raw.githubusercontent.com
    path = quote(src.removeprefix("./").lstrip("/"), safe="/")
    return f"{RAW_BASE}/{USERNAME}/{repo}/{branch}/{path}"

def extract_readme_images(repo, branch):
    try:
        readme = get(f"{API}/repos/{USERNAME}/{repo}/readme")
        content = requests.get(readme["download_url"]).text
        srcs = re.findall(r"!\[[^\]]*\]\(([^)]+)\)", content)
        srcs += re.findall(r"<img[^>]+src=[\"']([^\"']+)[\"']", content)
        out = []
        for s in srcs:
            url = resolve_image_url(s, repo, branch)
            if url and url not in out:
                out.append(url)
        return out[:MAX_IMAGES]
    except Exception:
        return []

def get_releases(repo):
    try:
        releases = get(f"{API}/repos/{USERNAME}/{repo}/releases")
        out = []
        for r in releases[:3]:
            out.append({
                "tag": r["tag_name"],
                "date": r["published_at"],
                "notes": r["body"][:500] if r["body"] else "",
                "assets": [a["browser_download_url"] for a in r["assets"]],
            })
        return out
    except Exception:
        return []

def main():
    pinned = get_pinned_repos()
    projects = []

    for r in pinned:
        name = r["name"]
        branch = (r.get("defaultBranchRef") or {}).get("name") or "main"
        projects.append({
            "name": name,
            "description": r["description"],
            "url": r["url"],
            "stars": r["stargazerCount"],
            "language": r["primaryLanguage"]["name"] if r["primaryLanguage"] else None,
            "topics": [t["topic"]["name"] for t in r["repositoryTopics"]["nodes"]],
            "readme_images": extract_readme_images(name, branch),
            "releases": get_releases(name),
        })

    data = {
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "projects": projects,
    }

    os.makedirs("src/data", exist_ok=True)
    with open("src/data/github_projects.json", "w") as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    main()