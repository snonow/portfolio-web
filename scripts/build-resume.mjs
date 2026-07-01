#!/usr/bin/env node
// Renders LaTeX resumes from resume/master.json + resume/variants/*.json,
// merges resume/master.local.json (gitignored) for private contact info,
// and emits a PII-stripped resume.json for the React app.

import { readFile, writeFile, readdir, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const resumeDir = join(root, "resume");
const buildDir = join(resumeDir, "build");
const webDataPath = join(root, "src", "data", "resume.json");
const publicResumeDir = join(root, "public", "resume");

const escapeTex = (s) =>
  typeof s === "string" ? s.replace(/([&%#$_])/g, "\\$1") : s;

const pick = (field, locale) =>
  escapeTex(field && typeof field === "object" && locale in field ? field[locale] : field);

const deepMerge = (base, override) => {
  if (Array.isArray(base) || Array.isArray(override)) return override ?? base;
  if (base && typeof base === "object" && override && typeof override === "object") {
    const out = { ...base };
    for (const [k, v] of Object.entries(override)) out[k] = deepMerge(base[k], v);
    return out;
  }
  return override === undefined ? base : override;
};

const renderBullets = (bullets, locale) =>
  (bullets || []).map((b) => `      \\resumeItem{${pick(b.text, locale)}}`).join("\n");

const renderExperienceEntry = (locale, x) => {
  const dates = pick(x.dates, locale);
  const company = pick(x.company, locale);
  const role = pick(x.role, locale);
  const head = x.style === "compact"
    ? `    \\resumeEntryTD
      {${company} \\textnormal{\\textit{— ${role}}}}{${dates}}`
    : `    \\resumeEntryTSDL
      {${company}}{${dates}}
      {${role}}{${pick(x.location, locale)}}`;
  const bullets = x.bullets?.length
    ? `\n    \\resumeItemListStart\n${renderBullets(x.bullets, locale)}\n    \\resumeItemListEnd`
    : "";
  return `  \\resumeEntryStart\n${head}${bullets}\n  \\resumeEntryEnd`;
};

const renderEducationEntry = (locale, e) => {
  const dates = pick(e.dates, locale);
  const school = pick(e.school, locale);
  const degree = pick(e.degree, locale);
  const head = e.style === "compact"
    ? `    \\resumeEntryTD
      {${school} -- ${degree}}{${dates}}`
    : `    \\resumeEntryTSDL
      {${school} -- ${degree}}{${dates}}
      {${pick(e.details, locale)}}{${pick(e.location, locale)}}`;
  return `  \\resumeEntryStart\n${head}\n  \\resumeEntryEnd`;
};

const renderProjectEntry = (locale, p) => {
  const bullets = p.bullets?.length
    ? `\n    \\resumeItemListStart\n${renderBullets(p.bullets, locale)}\n    \\resumeItemListEnd`
    : "";
  return `  \\resumeEntryStart
    \\resumeEntryTSDL
      {${pick(p.title, locale)}}{${pick(p.dates, locale)}}
      {${pick(p.org, locale)}}{${pick(p.location, locale)}}${bullets}
  \\resumeEntryEnd`;
};

const renderSkills = (skills, locale) => ` \\resumeEntryStart
${skills.map((s) => `  \\resumeEntryS{${pick(s.category, locale)}}{${pick(s.items, locale)}}`).join("\n")}
 \\resumeEntryEnd`;

const SECTION_RENDERERS = {
  experience: (m, l) => m.experience.map((x) => renderExperienceEntry(l, x)).join("\n\n"),
  education:  (m, l) => m.education.map((e)  => renderEducationEntry(l, e)).join("\n\n"),
  projects:   (m, l) => m.projects.map((p)   => renderProjectEntry(l, p)).join("\n\n"),
  skills:     (m, l) => renderSkills(m.skills, l),
};

const renderBody = (master, variant) => {
  const locale = variant.locale;
  const sections = master.sectionOrder ?? ["education", "experience", "projects", "skills"];
  const useIcons = variant.template !== "ats";
  return sections.map((id) => {
    const title = pick(master.sectionTitles[id], locale);
    const icon = useIcons && master.sectionIcons?.[id] ? master.sectionIcons[id] : null;
    const header = icon ? `\\section{${icon}}{${title}}` : `\\section{${title}}`;
    return `${header}\n${SECTION_RENDERERS[id](master, locale)}`;
  }).join("\n\n");
};

const buildVariant = async (master, variant) => {
  const tmplPath = join(resumeDir, "templates", `${variant.template}.tex.tmpl`);
  const tmpl = await readFile(tmplPath, "utf8");

  const subtitle = variant.subtitleOverride
    ? pick(variant.subtitleOverride, variant.locale)
    : pick(master.identity.subtitle, variant.locale);

  const subs = {
    IDENTITY_FULLNAME: master.identity.fullName,
    IDENTITY_SUBTITLE: subtitle,
    LINK_LINKEDIN_HREF: master.identity.links.linkedin.href,
    LINK_LINKEDIN_TEXT: master.identity.links.linkedin.text,
    LINK_GITHUB_HREF:   master.identity.links.github.href,
    LINK_GITHUB_TEXT:   master.identity.links.github.text,
    LINK_EMAIL_HREF:    master.identity.links.email?.href ?? "",
    LINK_EMAIL_TEXT:    master.identity.links.email?.text ?? "",
    LINK_WEBSITE_HREF:  master.identity.links.website?.href ?? "",
    LINK_WEBSITE_TEXT:  master.identity.links.website?.text ?? "",
    LINK_PHONE_HREF:    master.identity.links.phone?.href ?? "",
    LINK_PHONE_TEXT:    master.identity.links.phone?.text ?? "",
    BODY:               renderBody(master, variant),
  };

  const out = tmpl.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in subs)) throw new Error(`Unknown placeholder in template: ${k}`);
    return subs[k];
  });

  const outPath = join(buildDir, variant.output);
  await writeFile(outPath, out, "utf8");
  console.log(`  ✓ ${variant.name} → ${outPath}`);
};

const localizeForWeb = (obj, locale) => {
  if (Array.isArray(obj)) return obj.map((v) => localizeForWeb(v, locale));
  if (obj && typeof obj === "object") {
    if ("en" in obj && "fr" in obj && Object.keys(obj).length <= 3) return obj[locale];
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = localizeForWeb(v, locale);
    return out;
  }
  return obj;
};

const stripPrivate = (master) => {
  // Web bundle is public; strip contact PII (phone/email/href links).
  const { identity, ...rest } = master;
  const { links, photo, ...identityPublic } = identity;
  return { ...rest, identity: identityPublic };
};

// $-prefixed keys are source-file metadata ($comment etc.) — they may come
// from the gitignored master.local.json and must not reach the public bundle.
// Applied after localizeForWeb: its {en, fr} detection is key-count sensitive.
const stripMetaKeys = (obj) => {
  if (Array.isArray(obj)) return obj.map(stripMetaKeys);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (!k.startsWith("$")) out[k] = stripMetaKeys(v);
    }
    return out;
  }
  return obj;
};

const getLastUpdated = () => {
  try {
    return execSync("git log -1 --format=%cd --date=format:%Y-%m-%d -- resume/master.json", { encoding: "utf8" }).trim();
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

const buildWebJson = async (master) => {
  const safe = stripPrivate(master);
  const lastUpdated = getLastUpdated();
  const payload = {
    _lastUpdated: lastUpdated,
    en: stripMetaKeys(localizeForWeb(safe, "en")),
    fr: stripMetaKeys(localizeForWeb(safe, "fr")),
  };
  await mkdir(dirname(webDataPath), { recursive: true });
  await writeFile(webDataPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`  ✓ web → ${webDataPath} (last updated ${lastUpdated})`);
};

const main = async () => {
  let master = JSON.parse(await readFile(join(resumeDir, "master.json"), "utf8"));

  const localPath = join(resumeDir, "master.local.json");
  if (existsSync(localPath)) {
    const local = JSON.parse(await readFile(localPath, "utf8"));
    master = deepMerge(master, local);
    console.log("  · merged master.local.json (private overrides)");
  } else {
    console.log("  · no master.local.json — building with placeholder contact info");
  }

  await mkdir(buildDir, { recursive: true });
  await mkdir(publicResumeDir, { recursive: true });

  // Copy profile photo into build/ so LaTeX finds it next to the .tex.
  const photoSrc = join(resumeDir, "assets", master.identity.photo);
  const photoDst = join(buildDir, master.identity.photo);
  if (existsSync(photoSrc)) await copyFile(photoSrc, photoDst);

  const variantsDir = join(resumeDir, "variants");
  const variantFiles = (await readdir(variantsDir)).filter((f) => f.endsWith(".json"));

  console.log("Building resumes:");
  for (const f of variantFiles) {
    const variant = JSON.parse(await readFile(join(variantsDir, f), "utf8"));
    await buildVariant(master, variant);
  }
  await buildWebJson(master);
  console.log("Done.");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
