# /public/resume

Compiled résumé PDFs, published here by the `build-resume-pdf.yml` workflow.
The Hero's **Download CV** button looks for:

- `Arno-Wilhelm-CV-EN.pdf`
- `Arno-Wilhelm-CV-FR.pdf`

To build locally: run `npm run build:resume`, compile
`resume/build/cv_en_onepage.tex` (XeLaTeX), then rename to match.
Old `cv_en.pdf` / `cv_fr.pdf` URLs are 301-redirected in `public/_redirects`.

Files in this directory ship as static assets.
