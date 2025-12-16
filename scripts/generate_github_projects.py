import os
import json
import re
import requests
from datetime import datetime

USERNAME = "snonow"
API = "https://api.github.com"
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

def extract_readme_images(repo):
    try:
        readme = get(f"{API}/repos/{USERNAME}/{repo}/readme")
        content = requests.get(readme["download_url"]).text
        return re.findall(r"!\[.*?\]\((.*?)\)", content)
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
        projects.append({
            "name": name,
            "description": r["description"],
            "url": r["url"],
            "stars": r["stargazerCount"],
            "language": r["primaryLanguage"]["name"] if r["primaryLanguage"] else None,
            "topics": [t["topic"]["name"] for t in r["repositoryTopics"]["nodes"]],
            "readme_images": extract_readme_images(name),
            "releases": get_releases(name),
        })

    data = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "projects": projects,
    }

    os.makedirs("src/data", exist_ok=True)
    with open("src/data/github_projects.json", "w") as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    main()