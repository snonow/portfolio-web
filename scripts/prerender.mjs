#!/usr/bin/env node
// Post-build step: turn the client-only Vite output into crawlable static pages.
//
//   dist/index.html      English page, fully rendered (hydrated by src/main.jsx)
//   dist/fr/index.html   French page, same
//   dist/ja/index.html   Japanese page, same
//   dist/404.html        real 404 (Cloudflare Pages serves it with a 404 status)
//   dist/legal/          legal notice & privacy policy (EN + FR + JA)
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
const PATHS = { en: "/", fr: "/fr/", ja: "/ja/" };
const OG_LOCALE = { en: "en_US", fr: "fr_FR", ja: "ja_JP" };
const PDFS = {
  en: "/resume/Arno-Wilhelm-CV-EN.pdf",
  fr: "/resume/Arno-Wilhelm-CV-FR.pdf",
  ja: "/resume/Arno-Wilhelm-Shokumu-Keirekisho-JA.pdf",
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
  if (locale === "fr")
    return `${r.identity.fullName} — ${role} chez ${company}. Infrastructure cloud as code (Azure, Terraform), CI/CD et pipelines de données. Portfolio, projets et CV.`;
  if (locale === "ja")
    return `${r.identity.fullName}（アルノ・ヴィルヘルム）— ${company}の${role}。Azure・TerraformによるクラウドインフラのIaC、CI/CD、データパイプライン。ポートフォリオ、プロジェクト、職務経歴書。`;
  return `${r.identity.fullName} — ${role} at ${company}. Cloud infrastructure as code (Azure, Terraform), CI/CD and data pipelines. Portfolio, projects and résumé.`;
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
      inLanguage: Object.keys(PATHS),
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
    ...Object.keys(PATHS).filter((l) => l !== locale).map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`),
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

// Small standalone pages (no React bundle): 404 and legal notice (EN/FR/JA).
const staticPage = ({ title, robots = "index, follow", body, extraStyle = "" }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="${robots}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>${esc(title)}</title>
    <style>
      body{margin:0;font-family:system-ui,sans-serif;background:#f8fafc;color:#1e293b;line-height:1.6}
      a{color:#1e40af}
      ${extraStyle}
    </style>
  </head>
  <body>
${body}
  </body>
</html>
`;

const notFound = staticPage({
  title: "Page not found — Arno Wilhelm",
  robots: "noindex",
  extraStyle: "body{min-height:100vh;display:grid;place-items:center;text-align:center}",
  body: `    <main>
      <h1>404 — Page not found</h1>
      <p><a href="/">arno-wilhelm.dev</a> · <a href="/fr/">Version française</a> · <a href="/ja/">日本語</a></p>
    </main>`,
});

// Facts this page states — keep true if the site changes (new third-party
// script, analytics, form, cookie…), otherwise the notice becomes wrong.
// Cloudflare Web Analytics is enabled in the Pages project settings, not in
// this repo: drop its paragraph if it is ever switched off.
const legal = staticPage({
  title: "Legal notice & privacy · Mentions légales · 法的情報 — Arno Wilhelm",
  extraStyle: "main{max-width:46rem;margin:0 auto;padding:3rem 1.25rem}h2{margin-top:2.5rem}section+section{border-top:1px solid #e2e8f0;margin-top:3rem}",
  body: `    <main>
      <p><a href="/">← arno-wilhelm.dev</a> · <a href="#fr" hreflang="fr">Français ↓</a> · <a href="#ja" hreflang="ja">日本語 ↓</a></p>
      <section>
        <h1>Legal notice &amp; privacy</h1>
        <h2>Publisher</h2>
        <p>Arno Wilhelm, private individual. This is a personal, non-commercial website.<br />Contact: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
        <h2>Hosting</h2>
        <p>Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA (Cloudflare Pages) — <a href="https://www.cloudflare.com/">cloudflare.com</a></p>
        <h2>Intellectual property</h2>
        <p>Texts, photos and documents on this site are © Arno Wilhelm. Do not reuse them without permission. Project names and logos belong to their owners.</p>
        <h2>Personal data</h2>
        <ul>
          <li><strong>No tracking.</strong> No advertising, tracking cookies, social widgets, account or contact form.</li>
          <li><strong>Audience measurement.</strong> Cloudflare Web Analytics counts visits, pages viewed, referrers, countries, device types and page load times. It sets no cookie, does not fingerprint visitors and only reports aggregate figures; its script is loaded from <code>static.cloudflareinsights.com</code>. Legal basis: legitimate interest (GDPR art. 6(1)(f)) in knowing how the site is used and how fast it loads.</li>
          <li><strong>One functional cookie.</strong> <code>lang</code> is set only when you click the language switch, stores <code>en</code>, <code>fr</code> or <code>ja</code> for 12 months, and is used solely to show the site in that language. Being strictly necessary for a feature you ask for, it does not require consent.</li>
          <li><strong>Hosting logs.</strong> To deliver and protect the site, Cloudflare processes technical data such as your IP address, browser user agent and the requested URL (<a href="https://www.cloudflare.com/privacypolicy/">Cloudflare privacy policy</a>). Cloudflare is certified under the EU-US Data Privacy Framework. Legal basis: legitimate interest (GDPR art. 6(1)(f)) in operating a secure website.</li>
          <li><strong>GitHub.</strong> Project screenshots are loaded from <code>raw.githubusercontent.com</code>, and live GitHub statistics may be fetched from <code>api.github.com</code>. These requests reveal your IP address to GitHub (<a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement">GitHub privacy statement</a>).</li>
        </ul>
        <p>You can ask for access to, correction or erasure of your data at <a href="mailto:${EMAIL}">${EMAIL}</a>, and complain to your data protection authority (e.g. CNPD in Luxembourg, CNIL in France).</p>
      </section>
      <section id="fr" lang="fr">
        <h1>Mentions légales &amp; confidentialité</h1>
        <h2>Éditeur</h2>
        <p>Arno Wilhelm, particulier. Site personnel, non commercial.<br />Contact : <a href="mailto:${EMAIL}">${EMAIL}</a></p>
        <h2>Hébergement</h2>
        <p>Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis (Cloudflare Pages) — <a href="https://www.cloudflare.com/">cloudflare.com</a></p>
        <h2>Propriété intellectuelle</h2>
        <p>Les textes, photos et documents de ce site sont © Arno Wilhelm. Toute réutilisation nécessite une autorisation. Les noms et logos de projets appartiennent à leurs propriétaires.</p>
        <h2>Données personnelles</h2>
        <ul>
          <li><strong>Aucun pistage.</strong> Pas de publicité, de cookie traceur, de widget social, de compte ni de formulaire.</li>
          <li><strong>Mesure d'audience.</strong> Cloudflare Web Analytics compte les visites, pages vues, sites d'origine, pays, types d'appareil et temps de chargement. Il ne dépose aucun cookie, ne crée pas d'empreinte des visiteurs et ne fournit que des statistiques agrégées ; son script est chargé depuis <code>static.cloudflareinsights.com</code>. Base légale : intérêt légitime (art. 6.1.f RGPD) à connaître l'usage du site et ses performances.</li>
          <li><strong>Un cookie fonctionnel.</strong> <code>lang</code> n'est déposé que si vous cliquez sur le sélecteur de langue ; il stocke <code>en</code>, <code>fr</code> ou <code>ja</code> pendant 12 mois et sert uniquement à afficher le site dans cette langue. Strictement nécessaire à une fonction que vous demandez, il n'exige pas de consentement.</li>
          <li><strong>Journaux d'hébergement.</strong> Pour servir et protéger le site, Cloudflare traite des données techniques comme votre adresse IP, le user agent du navigateur et l'URL demandée (<a href="https://www.cloudflare.com/fr-fr/privacypolicy/">politique de confidentialité de Cloudflare</a>). Cloudflare est certifié au titre du Data Privacy Framework UE–États-Unis. Base légale : intérêt légitime (art. 6.1.f RGPD) à exploiter un site sécurisé.</li>
          <li><strong>GitHub.</strong> Les captures des projets sont chargées depuis <code>raw.githubusercontent.com</code> et les statistiques GitHub en direct peuvent l'être depuis <code>api.github.com</code>. Ces requêtes transmettent votre adresse IP à GitHub (<a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement">déclaration de confidentialité de GitHub</a>).</li>
        </ul>
        <p>Vous pouvez demander l'accès, la rectification ou l'effacement de vos données à <a href="mailto:${EMAIL}">${EMAIL}</a>, et saisir l'autorité de protection des données de votre pays (par ex. la CNPD au Luxembourg, la CNIL en France).</p>
      </section>
      <section id="ja" lang="ja">
        <h1>法的情報・プライバシー</h1>
        <h2>運営者</h2>
        <p>アルノ・ヴィルヘルム（個人）。個人による非営利のウェブサイトです。<br />連絡先：<a href="mailto:${EMAIL}">${EMAIL}</a></p>
        <h2>ホスティング</h2>
        <p>Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA（Cloudflare Pages）— <a href="https://www.cloudflare.com/ja-jp/">cloudflare.com</a></p>
        <h2>知的財産</h2>
        <p>本サイトの文章・写真・資料の著作権はアルノ・ヴィルヘルムに帰属します。無断での転用はご遠慮ください。各プロジェクト名・ロゴはそれぞれの権利者に帰属します。</p>
        <h2>個人情報</h2>
        <ul>
          <li><strong>トラッキングなし。</strong>広告、トラッキングCookie、ソーシャルウィジェット、アカウント、問い合わせフォームはありません。</li>
          <li><strong>アクセス解析。</strong>Cloudflare Web Analyticsにより、訪問数、閲覧ページ、参照元、国、端末の種類、ページの読み込み時間を集計しています。Cookieは使用せず、訪問者のフィンガープリントも取得せず、集計値のみを提供します。スクリプトは <code>static.cloudflareinsights.com</code> から読み込まれます。法的根拠：サイトの利用状況と表示速度を把握するという正当な利益（GDPR第6条1項(f)）。</li>
          <li><strong>機能Cookieは1件のみ。</strong><code>lang</code> は言語切替をクリックした場合にのみ設定され、<code>en</code>・<code>fr</code>・<code>ja</code> のいずれかを12か月間保存し、その言語でサイトを表示するためだけに使われます。ご自身が求めた機能に厳密に必要なものであるため、同意は不要です。</li>
          <li><strong>ホスティングのログ。</strong>サイトの配信と保護のため、CloudflareがIPアドレス、ブラウザのユーザーエージェント、リクエストされたURLなどの技術データを処理します（<a href="https://www.cloudflare.com/ja-jp/privacypolicy/">Cloudflareのプライバシーポリシー</a>）。CloudflareはEU-米国データプライバシーフレームワークの認証を受けています。法的根拠：安全なウェブサイト運営という正当な利益（GDPR第6条1項(f)）。</li>
          <li><strong>GitHub。</strong>プロジェクトの画像は <code>raw.githubusercontent.com</code> から、GitHubの統計は <code>api.github.com</code> から読み込まれる場合があり、その際にIPアドレスがGitHubに送信されます（<a href="https://docs.github.com/ja/site-policy/privacy-policies/github-general-privacy-statement">GitHubのプライバシーステートメント</a>）。</li>
        </ul>
        <p>ご自身のデータの開示・訂正・削除のご依頼は <a href="mailto:${EMAIL}">${EMAIL}</a> までご連絡ください。また、お住まいの国のデータ保護当局（例：ルクセンブルクのCNPD、フランスのCNIL、日本の個人情報保護委員会）に苦情を申し立てることができます。</p>
      </section>
    </main>`,
});

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

- Website: ${SITE}/ (French: ${SITE}/fr/, Japanese: ${SITE}/ja/)
- Résumé (PDF): ${SITE}${PDFS.en} · French: ${SITE}${PDFS.fr} · Japanese (職務経歴書): ${SITE}${PDFS.ja}
- GitHub: ${GITHUB_PROFILE_URL}
- LinkedIn: ${LINKEDIN_URL}
- Email: ${EMAIL}

${r.sectionOrder.map((k) => `## ${titles[k]}\n\n${sections[k]}`).join("\n\n")}

_Last updated: ${resume._lastUpdated}_
`;
};

console.log("Prerendering:");
write("fr/index.html", page("fr"));
write("ja/index.html", page("ja"));
write("index.html", page("en"));
write("404.html", notFound);
write("legal/index.html", legal);
write("sitemap.xml", sitemap());
write("llms.txt", llms());
