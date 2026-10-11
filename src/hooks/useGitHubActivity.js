import { useEffect, useState } from "react";

import { GITHUB_USERNAME } from "../data/github";

// Loads live GitHub stats: prefers the token-backed Cloudflare Function
// (/api/github), falls back to the unauthenticated REST API. The response
// shape { available, totalContributions, calendar, languages, repoCount,
// lastPushedAt } is a contract with functions/api/github.js — do not rename.
const useGitHubActivity = () => {
  const [data, setData] = useState(null);
  const [source, setSource] = useState(null); // "function" | "rest"
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Preferred: our Cloudflare Function (token-backed → contribution calendar).
      try {
        const res = await fetch("/api/github");
        if (res.ok) {
          const json = await res.json();
          if (json.available) {
            if (!cancelled) {
              setData(json);
              setSource("function");
            }
            return;
          }
        }
      } catch {
        /* fall through to REST */
      }

      // Fallback: unauthenticated REST — language mix + repo count, no calendar.
      try {
        const [profileRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed`),
        ]);
        if (!profileRes.ok || !reposRes.ok) throw new Error("rest");
        const profile = await profileRes.json();
        const repos = await reposRes.json();

        const counts = new Map();
        for (const r of repos) {
          if (r.fork || !r.language) continue;
          counts.set(r.language, (counts.get(r.language) || 0) + 1);
        }
        const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
        const languages = [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, n]) => ({ name, color: null, pct: Math.round((n / total) * 100) }));

        if (!cancelled) {
          setData({
            available: true,
            totalContributions: null,
            calendar: null,
            languages,
            repoCount: profile.public_repos,
            lastPushedAt: repos[0]?.pushed_at ?? null,
          });
          setSource("rest");
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, source, failed };
};

export default useGitHubActivity;
