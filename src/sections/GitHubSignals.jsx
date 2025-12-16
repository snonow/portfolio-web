import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6);

  const chartData = topRepos.map(r => ({
    name: r.name,
    stars: r.stargazers_count,
  }));

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

      <div className="h-[260px] bg-white border rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="stars"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default GitHubSignals;