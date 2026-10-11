// Cloudflare Pages Function — GET /api/github
// Server-side proxy to the GitHub GraphQL API. Runs on Cloudflare's edge so the
// token never reaches the browser. Returns the contribution calendar, yearly
// contribution count and aggregated language mix for the configured user.
//
// Private repositories and contributions are included when the token belongs
// to the profile owner and can read them (fine-grained PAT, all repositories,
// "Contents: read" + "Metadata: read"). Only aggregate counts are returned.
//
// Setup: add a read-only GitHub token as the `STATS_TOKEN` secret
// in the Cloudflare Pages project (Settings → Variables and Secrets). A classic
// PAT with no scopes (or fine-grained, public read) is enough for public data.
// Without it, this returns { available: false } and the front-end falls back to
// the unauthenticated REST API for the basics.

// Keep in sync with GITHUB_USERNAME in src/data/github.js (this file is
// bundled separately by Cloudflare Pages and cannot import app source).
const LOGIN = "snonow";

const QUERY = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date contributionCount color weekday }
        }
      }
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: { field: PUSHED_AT, direction: DESC }) {
      totalCount
      nodes {
        name
        isPrivate
        pushedAt
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

const json = (body, status = 200, maxAge = 3600) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${maxAge}`,
      "access-control-allow-origin": "*",
    },
  });

export const onRequestGet = async ({ env }) => {
  // STATS_TOKEN: same name as the Actions secret (GitHub forbids GITHUB_*
  // there). GITHUB_TOKEN still accepted for existing Pages setups.
  const token = env.STATS_TOKEN ?? env.GITHUB_TOKEN;
  if (!token) return json({ available: false, reason: "no-token" });

  let payload;
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "user-agent": "arno-wilhelm.dev",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
    });
    if (!res.ok) return json({ available: false, reason: `github-${res.status}` }, 200, 300);
    payload = await res.json();
  } catch {
    return json({ available: false, reason: "fetch-failed" }, 200, 300);
  }

  const user = payload?.data?.user;
  if (!user) return json({ available: false, reason: "no-data" }, 200, 300);

  // Flatten the contribution calendar into a single day array.
  const calendar = user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      color: d.color,
      weekday: d.weekday,
    }))
  );

  // Aggregate language byte sizes across repos into percentages.
  const byLang = new Map();
  let totalBytes = 0;
  for (const repo of user.repositories.nodes) {
    for (const edge of repo.languages.edges) {
      const { name, color } = edge.node;
      totalBytes += edge.size;
      const prev = byLang.get(name) || { name, color, bytes: 0 };
      prev.bytes += edge.size;
      byLang.set(name, prev);
    }
  }
  const languages = [...byLang.values()]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 6)
    .map((l) => ({ name: l.name, color: l.color, pct: totalBytes ? Math.round((l.bytes / totalBytes) * 100) : 0 }));

  const lastPushedAt = user.repositories.nodes[0]?.pushedAt ?? null;

  // Streaks over the calendar (oldest → newest). The current streak may end
  // yesterday: today simply has no contribution yet.
  let longestStreak = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longestStreak = Math.max(longestStreak, run);
  }
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) currentStreak++;
    else if (i < days.length - 1 || currentStreak > 0) break;
  }

  // Counts only: private repository names never leave this function.
  const cc = user.contributionsCollection;
  const privateRepoCount = user.repositories.nodes.filter((r) => r.isPrivate).length;

  return json({
    available: true,
    totalContributions: calendar.totalContributions,
    calendar: days,
    languages,
    repoCount: user.repositories.totalCount,
    privateRepoCount,
    lastPushedAt,
    commits: cc.totalCommitContributions,
    pullRequests: cc.totalPullRequestContributions,
    reviews: cc.totalPullRequestReviewContributions,
    activeDays: days.filter((d) => d.count > 0).length,
    currentStreak,
    longestStreak,
  });
};
