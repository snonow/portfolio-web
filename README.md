# Arno Wilhelm — Portfolio

Personal portfolio + résumé pipeline. One JSON file is the single source of truth; it
generates both the LaTeX résumés (EN/FR) and the React site you see at
**[arno-wilhelm.dev](https://arno-wilhelm.dev)**.

## Why this exists

The site and the LaTeX résumé used to drift apart. Now editing
`resume/master.json` updates both.

```
resume/master.json   ──► resume/build/cv_en_onepage.tex   (LaTeX → PDF)
                    └──► resume/build/cv_fr_onepage.tex
                    └──► src/data/resume.json             (React app, PII-stripped)
```

## Tech stack

- React 19 + Vite 7
- Tailwind CSS 3
- Framer Motion (subtle animations)
- Lucide + react-icons
- LaTeX templating in plain Node (`scripts/build-resume.mjs`, zero runtime deps)

## Repo layout

```
resume/
  master.json              # single source of truth (bilingual EN/FR, no PII)
  master.local.json        # GITIGNORED — real phone/email overrides
  master.local.example.json
  variants/                # one config per output variant
    en-onepage.json
    fr-onepage.json
  templates/
    onepage.tex.tmpl       # shared LaTeX skeleton
  assets/profile.jpg
  build/                   # generated .tex + photo, gitignored

scripts/
  build-resume.mjs         # master + local + variant → .tex and web JSON
  generate_github_projects.py  # daily-refreshed projects feed

src/
  data/resume.json         # GENERATED — PII-stripped, committed
  data/github_projects.json
  sections/                # Hero, Experience, ProjectsGallery, GitHubSignals, PipelineProof
  components/
```

## Getting started

Requires Node ≥ 20.

```bash
git clone https://github.com/snonow/portfolio-web.git
cd portfolio-web
npm install

# (Optional, private) copy the example to inject your real contact info into the .tex builds
cp resume/master.local.example.json resume/master.local.json
# edit resume/master.local.json with your phone/email

npm run dev          # http://localhost:5173 — predev regenerates resume.json
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start Vite dev server (regenerates `resume.json` first) |
| `npm run build` | Production build (regenerates `resume.json` first → `dist/`) |
| `npm run build:resume` | Just regenerate LaTeX + web JSON from `resume/master.json` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | ESLint on `src/` |

## Editing the résumé

1. Edit `resume/master.json` (bilingual fields use `{ "en": "...", "fr": "..." }`).
2. Run `npm run build:resume`.
3. Compile a PDF from `resume/build/cv_en_onepage.tex` (XeLaTeX recommended).
4. Commit `master.json` and the regenerated `src/data/resume.json`.

### Adding a new entry

- New experience: append to `experience[]` in `master.json`. Set `style: "compact"`
  to render as a single-line `\resumeEntryTD` (good for short stints).
- New section order: edit `sectionOrder` at the top of `master.json`.
- New language: add the locale to every `{ "en": ..., "fr": ... }` field, add a
  variant file in `resume/variants/`, and the build will pick it up automatically.

## Privacy / public-repo discipline

This repo is public. `master.json` contains placeholder phone/email; the real
values live in `resume/master.local.json` (gitignored). The build script deep-merges
the local file on top of `master.json` for LaTeX output, and **always strips**
`identity.links` before writing `src/data/resume.json` — so the deployed site
never bundles a phone number or email address, even if you're building locally
with your real contact info.

If you fork this, drop your contact info in `master.local.json` (never in
`master.json`).

## Deployment

**Cloudflare Pages**, connected to `main`. Each push builds with
`npm run build` (which runs `build:resume` via the `prebuild` hook) and serves
`dist/`. The **Live GitHub activity** section is backed by a Cloudflare Pages
Function (`functions/api/github.js`) that proxies the GitHub GraphQL API for the
contribution calendar and language mix (set a `GITHUB_TOKEN` env var on the Pages
project; without it the section falls back to the unauthenticated REST API).

Two scheduled GitHub Actions keep generated content fresh on `main`:

- `build-resume-pdf.yml` — recompiles the LaTeX CVs to PDF (XeLaTeX) and commits
  the results to `public/resume/` so Cloudflare ships the latest PDFs.
- `update-github-projects.yml` — refreshes `src/data/github_projects.json` daily
  so the **Projects** section reflects the latest **pinned** repos.

## License

Personal portfolio — not intended for redistribution. LaTeX résumé macros are
adapted from Leslie Cheng (MIT).
