import { useEffect, useState } from "react";
import { Database, Award, Globe } from "lucide-react";

import KpiCard from "../components/KpiCard";
import { GITHUB_USERNAME } from "../data/github";

const GitHubSignals = () => {
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchGithub = async () => {
      try {
        setLoading(true);

        const [profileRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`
          ),
        ]);

        if (!profileRes.ok || !reposRes.ok) {
          throw new Error("GitHub API error");
        }

        const profileData = await profileRes.json();
        const reposData = await reposRes.json();

        if (cancelled) return;

        setProfile(profileData);
        setRepos(Array.isArray(reposData) ? reposData : []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGithub();
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = repos.reduce(
    (acc, r) => {
      acc.stars += r.stargazers_count || 0;
      acc.forks += r.forks_count || 0;
      return acc;
    },
    { stars: 0, forks: 0 }
  );

  const topRepos = repos
    .filter(r => !r.fork)
    .sort((a, b) => (b.stargazers_count - a.stargazers_count) || new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 6);

  return (
    <section className="mb-20">
      <h2 className="text-2xl font-bold mb-6">GitHub Signals</h2>

      {error && (
        <div className="mb-4 text-sm text-red-600">
          GitHub data unavailable
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KpiCard
          icon={<Database size={20} />}
          title="Public Repositories"
          value={loading ? "…" : profile?.public_repos ?? "—"}
          color="bg-indigo-50 text-indigo-900"
        />
        <KpiCard
          icon={<Award size={20} />}
          title="Total Stars"
          value={loading ? "…" : totals.stars}
          color="bg-emerald-50 text-emerald-900"
        />
        <KpiCard
          icon={<Globe size={20} />}
          title="Followers"
          value={loading ? "…" : profile?.followers ?? "—"}
          color="bg-amber-50 text-amber-900"
        />
      </div>

      {!loading && topRepos.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topRepos.map((r) => (
            <li key={r.id} className="bg-white border rounded-xl p-4 hover:border-blue-300 transition">
              <a href={r.html_url} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 hover:text-blue-700">
                {r.name}
              </a>
              {r.description && (
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{r.description}</p>
              )}
              <div className="flex gap-3 text-xs text-slate-500 mt-2">
                {r.language && <span>{r.language}</span>}
                <span>★ {r.stargazers_count}</span>
                <span>Updated {new Date(r.pushed_at).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default GitHubSignals;