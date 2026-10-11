// Cloudflare Pages Function — GET /
// Sends first-time visitors to the version of the site in their browser's
// language. Only "/" runs through here; /fr/ and every asset stay static.
//
// - An explicit choice wins: the language toggle sets a `lang` cookie.
// - No Accept-Language header (search engine crawlers, most bots) → English,
//   so the canonical page is what gets indexed; hreflang covers the rest.

// Keep in sync with the locales prerendered by scripts/prerender.mjs.
const PATHS = { en: "/", fr: "/fr/", ja: "/ja/" };

const cookieLang = (header) => header?.match(/(?:^|;\s*)lang=([a-z]{2})/)?.[1];

// "fr-FR,fr;q=0.9,en;q=0.8" → first supported primary tag by quality.
const preferredLang = (header) =>
  (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { lang: tag.split("-")[0], q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter(({ lang, q }) => lang in PATHS && q > 0)
    .sort((a, b) => b.q - a.q)[0]?.lang;

export const onRequestGet = async ({ request, next }) => {
  const lang =
    cookieLang(request.headers.get("Cookie")) ?? preferredLang(request.headers.get("Accept-Language"));

  if (lang && lang !== "en" && PATHS[lang]) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: PATHS[lang],
        Vary: "Accept-Language, Cookie",
        "Cache-Control": "private, no-store",
      },
    });
  }

  const res = await next();
  const out = new Response(res.body, res);
  out.headers.append("Vary", "Accept-Language, Cookie");
  return out;
};
