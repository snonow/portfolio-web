// Cloudflare Pages Function — GET /api/github
// Server-side proxy to the GitHub GraphQL API. Runs on Cloudflare's edge so the
// token never reaches the browser. Returns the contribution calendar, yearly
// contribution count and aggregated language mix for the configured user.
//
// Setup: add a read-only GitHub token as the `GITHUB_TOKEN` environment variable
// in the Cloudflare Pages project (Settings → Environment variables). A classic
// PAT with no scopes (or fine-grained, public read) is enough for public data.
// Without it, this returns { available: false } and the front-end falls back to
// the unauthenticated REST API for the basics.

const LOGIN = "snonow";

const QUERY = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
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
  const token = env.GITHUB_TOKEN;
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

  return json({
    available: true,
    totalContributions: calendar.totalContributions,
    calendar: days,
    languages,
    repoCount: user.repositories.totalCount,
    lastPushedAt,
  });
};
