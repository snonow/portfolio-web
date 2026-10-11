#!/usr/bin/env node
// Post-build step: turn the client-only Vite output into crawlable static pages.
//
//   dist/index.html      English page, fully rendered (hydrated by src/main.jsx)
//   dist/fr/index.html   French page, same
//   dist/404.html        real 404 (Cloudflare Pages serves it with a 404 status)
//   dist/sitemap.xml     both locales with hreflang + the PDFs
//   dist/llms.txt        the whole résumé as Markdown, for LLM crawlers/agents
//
// SEO tags and JSON-LD are derived from src/data/resume.json so they never
// drift from the CV. Runs after `vite build` and `vite build --ssr`.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { GITHUB_PROFILE_URL } from "../src/data/github.js";
import { LINKEDIN_URL } from "../src/data/links.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const SITE = "https://arno-wilhelm.dev";
const EMAIL = "contact@arno-wilhelm.dev";
const PATHS = { en: "/", fr: "/fr/" };
const OG_LOCALE = { en: "en_US", fr: "fr_FR" };
const PDFS = {
  en: "/resume/Arno-Wilhelm-CV-EN.pdf",
  fr: "/resume/Arno-Wilhelm-CV-FR.pdf",
};

const resume = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/resume.json"), "utf8"));
const { render } = await import(pathToFileURL(path.join(ROOT, "dist-ssr/entry-server.js")).href);
const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// "Azure (Data Factory, Functions), Terraform" → ["Azure (Data Factory, Functions)", "Terraform"]
const splitTopLevel = (s) => {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};

const current = (r) => {
  const job = r.experience[0];
  return { role: job.role.replace(/\s*\([^)]*\)\s*$/, ""), company: job.company, url: job.url };
};

const describe = (locale) => {
  const r = resume[locale];
  const { role, company } = current(r);
  return locale === "fr"
    ? `${r.identity.fullName} — ${role} chez ${company}. Infrastructure cloud as code (Azure, Terraform), CI/CD et pipelines de données. Portfolio, projets et CV.`
    : `${r.identity.fullName} — ${role} at ${company}. Cloud infrastructure as code (Azure, Terraform), CI/CD and data pipelines. Portfolio, projects and résumé.`;
};

const jsonLd = (locale) => {
  const r = resume[locale];
  const { role, company, url } = current(r);
  const person = {
    "@type": "Person",
    "@id": `${SITE}/#person`,
    name: r.identity.fullName,
    jobTitle: role,
    description: describe(locale),
    url: SITE + PATHS[locale],
    image: `${SITE}/profile.jpg`,
    email: `mailto:${EMAIL}`,
    address: { "@type": "PostalAddress", addressLocality: "Luxembourg", addressCountry: "LU" },
    worksFor: { "@type": "Organization", name: company, url },
    alumniOf: r.education
      .filter((e) => e.url && !/lycée/i.test(e.school))
      .map((e) => ({ "@type": "CollegeOrUniversity", name: e.school, url: e.url })),
    knowsAbout: r.skills.slice(0, 3).flatMap((s) => splitTopLevel(s.items)),
    knowsLanguage: ["fr", "en", "ja"],
    sameAs: [GITHUB_PROFILE_URL, LINKEDIN_URL],
  };
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: `${SITE}/`,
      name: r.identity.fullName,
      inLanguage: ["en", "fr"],
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE}${PATHS[locale]}#page`,
      url: SITE + PATHS[locale],
      name: `${r.identity.fullName} — ${r.identity.subtitle}`,
      inLanguage: locale,
      isPartOf: { "@id": `${SITE}/#website` },
      dateModified: resume._lastUpdated,
      mainEntity: { "@id": `${SITE}/#person` },
    },
    person,
  ];
  // "</" inside a script block would end it early.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/<\//g, "<\\/");
};

const headTags = (locale) => {
  const r = resume[locale];
  const title = `${r.identity.fullName} — ${r.identity.subtitle}`;
  const description = describe(locale);
  const url = SITE + PATHS[locale];
  const other = locale === "en" ? "fr" : "en";
  return [
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="author" content="${esc(r.identity.fullName)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<link rel="canonical" href="${url}" />`,
    ...Object.entries(PATHS).map(([l, p]) => `<link rel="alternate" hreflang="${l}" href="${SITE}${p}" />`),
    `<link rel="alternate" hreflang="x-default" href="${SITE}/" />`,
    `<link rel="alternate" type="text/markdown" href="/llms.txt" title="Résumé in Markdown" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="${esc(r.identity.fullName)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE}/profile.jpg" />`,
    `<meta property="og:image:alt" content="${esc(title)}" />`,
    `<meta property="og:locale" content="${OG_LOCALE[locale]}" />`,
    `<meta property="og:locale:alternate" content="${OG_LOCALE[other]}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<script type="application/ld+json">\n${jsonLd(locale)}\n</script>`,
    // Without JS, framer-motion's entrance animations never run: show the content.
    `<noscript><style>[style*="opacity:0"]{opacity:1!important;transform:none!important}</style></noscript>`,
  ].join("\n    ");
};

const page = (locale) => {
  const r = resume[locale];
  const out = template
    .replace('<html lang="en">', `<html lang="${locale}">`)
    .replace(/<title>.*?<\/title>/, `<title>${esc(`${r.identity.fullName} — ${r.identity.subtitle}`)}</title>`)
    .replace("<!--seo-->", headTags(locale))
    .replace('<div id="root"></div>', `<div id="root">${render(locale)}</div>`);
  for (const marker of ["<!--seo-->", '<div id="root"></div>']) {
    if (out.includes(marker)) throw new Error(`prerender: ${marker} was not replaced`);
  }
  return out;
};

const write = (rel, content) => {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log(`  ✓ ${rel}`);
};

const notFound = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>Page not found — Arno Wilhelm</title>
    <style>
      body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#f8fafc;color:#1e293b;text-align:center}
      a{color:#1e40af}
    </style>
  </head>
  <body>
    <main>
      <h1>404 — Page not found</h1>
      <p><a href="/">arno-wilhelm.dev</a> · <a href="/fr/">Version française</a></p>
    </main>
  </body>
</html>
`;

const sitemap = () => {
  const alternates = [
    ...Object.entries(PATHS).map(([l, p]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${p}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`,
  ].join("\n");
  const pages = Object.values(PATHS).map(
    (p) => `  <url>\n    <loc>${SITE}${p}</loc>\n    <lastmod>${resume._lastUpdated}</lastmod>\n${alternates}\n  </url>`,
  );
  const pdfs = [...Object.values(PDFS), "/papers/Hybrid-MLOps-for-SMEs-2025.pdf"].map(
    (p) => `  <url>\n    <loc>${SITE}${p}</loc>\n  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...pages, ...pdfs].join("\n")}
</urlset>
`;
};

const llms = () => {
  const r = resume.en;
  const titles = r.sectionTitles;
  const line = (...parts) => parts.filter(Boolean).join(" — ");
  const bullets = (items = []) => items.map((b) => `- ${b.text}`).join("\n");
  const sections = {
    experience: r.experience
      .map((x) => `### ${line(x.role, x.company)}\n${[x.dates, x.location].filter(Boolean).join(" · ")}\n\n${bullets(x.bullets)}`)
      .join("\n\n"),
    projects: r.projects
      .map((p) => `### ${p.url ? `[${p.title}](${p.url})` : p.title}\n${[p.org, p.dates].filter(Boolean).join(" · ")}\n\n${bullets(p.bullets)}`)
      .join("\n\n"),
    education: r.education
      .map((e) => `- **${e.school}** — ${e.degree} (${e.dates})${e.details ? `. ${e.details}` : ""}`)
      .join("\n"),
    skills: r.skills.map((s) => `- **${s.category.replace(/:$/, "")}:** ${s.items}`).join("\n"),
  };
  return `# ${r.identity.fullName} — ${r.identity.subtitle}

> ${describe("en")}

- Website: ${SITE}/ (French: ${SITE}/fr/)
- Résumé (PDF): ${SITE}${PDFS.en} · French: ${SITE}${PDFS.fr}
- GitHub: ${GITHUB_PROFILE_URL}
- LinkedIn: ${LINKEDIN_URL}
- Email: ${EMAIL}

${r.sectionOrder.map((k) => `## ${titles[k]}\n\n${sections[k]}`).join("\n\n")}

_Last updated: ${resume._lastUpdated}_
`;
};

console.log("Prerendering:");
write("fr/index.html", page("fr"));
write("index.html", page("en"));
write("404.html", notFound);
write("sitemap.xml", sitemap());
write("llms.txt", llms());
