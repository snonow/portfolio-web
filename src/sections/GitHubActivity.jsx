import { useEffect, useState } from "react";
import { Activity, GitBranch, Clock } from "lucide-react";

import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { GITHUB_USERNAME } from "../data/github";

const T = {
  en: {
    title: "Live GitHub activity",
    served: "Served live from a Cloudflare Function",
    servedFallback: "Fetched live from the GitHub API",
    contributions: "contributions in the last year",
    repos: "public repositories",
    lastPush: "last pushed",
    languages: "Most-used languages",
    unavailable: "Live GitHub data is momentarily unavailable.",
    today: "today",
    daysAgo: (n) => `${n} day${n === 1 ? "" : "s"} ago`,
  },
  fr: {
    title: "Activité GitHub en direct",
    served: "Servi en direct par une Cloudflare Function",
    servedFallback: "Récupéré en direct via l'API GitHub",
    contributions: "contributions sur les 12 derniers mois",
    repos: "dépôts publics",
    lastPush: "dernier push",
    languages: "Langages les plus utilisés",
    unavailable: "Les données GitHub en direct sont momentanément indisponibles.",
    today: "aujourd'hui",
    daysAgo: (n) => `il y a ${n} jour${n === 1 ? "" : "s"}`,
  },
};

const daysSince = (iso) => {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
};

const GitHubActivity = ({ locale = "en" }) => {
  const t = T[locale] ?? T.en;
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

  const lastPushDays = data ? daysSince(data.lastPushedAt) : null;
  const lastPushLabel =
    lastPushDays == null ? null : lastPushDays === 0 ? t.today : t.daysAgo(lastPushDays);

  return (
    <section className="mb-24">
      <Reveal>
        <SectionHeading className="mb-2">{t.title}</SectionHeading>
        {data && (
          <p className="text-xs text-slate-400 mb-8 pl-5">
            {source === "function" ? t.served : t.servedFallback}
          </p>
        )}
      </Reveal>

      {failed && <p className="text-sm text-slate-500 pl-5">{t.unavailable}</p>}

      {data && (
        <div className="space-y-8">
          {/* Headline numbers — only render what's meaningful */}
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {data.totalContributions != null && (
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Activity size={18} />
                </span>
                <span>
                  <span className="text-2xl font-bold text-slate-900">{data.totalContributions.toLocaleString()}</span>{" "}
                  <span className="text-sm text-slate-500">{t.contributions}</span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <GitBranch size={18} />
              </span>
              <span>
                <span className="text-2xl font-bold text-slate-900">{data.repoCount}</span>{" "}
                <span className="text-sm text-slate-500">{t.repos}</span>
              </span>
            </div>
            {lastPushLabel && (
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock size={18} />
                </span>
                <span>
                  <span className="text-sm text-slate-500">{t.lastPush} </span>
                  <span className="font-semibold text-slate-900">{lastPushLabel}</span>
                </span>
              </div>
            )}
          </div>

          {/* Contribution calendar — only when the Function provides it */}
          {data.calendar && (
            <div className="overflow-x-auto pb-1">
              <div className="grid grid-flow-col grid-rows-7 gap-[3px] w-max">
                {data.calendar.map((d) => (
                  <span
                    key={d.date}
                    title={`${d.date}: ${d.count}`}
                    className="w-[10px] h-[10px] rounded-[2px]"
                    style={{ backgroundColor: d.count === 0 ? "#ebedf0" : d.color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Language mix */}
          {data.languages?.length > 0 && (
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">{t.languages}</div>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100 mb-3">
                {data.languages.map((l, i) => (
                  <span
                    key={l.name}
                    style={{ width: `${l.pct}%`, backgroundColor: l.color || `hsl(${210 + i * 24} 60% 55%)` }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                {data.languages.map((l, i) => (
                  <span key={l.name} className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: l.color || `hsl(${210 + i * 24} 60% 55%)` }}
                    />
                    {l.name} <span className="text-slate-400">{l.pct}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default GitHubActivity;
