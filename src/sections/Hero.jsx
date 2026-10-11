import { MapPin } from "lucide-react";
import { SiGithub, SiLinkedin } from "react-icons/si";

import resume from "../data/resume.json";
import DownloadCV from "../components/DownloadCV";
import { GITHUB_PROFILE_URL } from "../data/github";
import { LINKEDIN_URL } from "../data/links";

const BASE = import.meta.env.BASE_URL;

// 20px blurred preview, inlined so the circle is never empty while the photo
// loads. Regenerate when public/profile*.{jpg,avif,webp} change.
const PROFILE_LQIP =
  "data:image/webp;base64,UklGRtAAAABXRUJQVlA4IMQAAADwBACdASoUABQAPtFgqU+oJSOiKAgBABoJQBdmUAA0vd31N8cYWpn9rPXBZH2Cv8gA/lbzu9bgvi9M98gFyI9/N7G6la5DF2rwW2d0Q4ot32Njw7guwgbN+J3u9v63jpt1zPOAUBERXBIT2re8UBv3qJHraItMFwisvJxO3AcV1wD11a7XUPXErZ2Tx+yqreTn8aIFt8iPxS+Q5WFVFFbsAfQ7bPe6uUyVj4z2Th8SJQOwTllYXfy8xuydGetefSJQgAAA";
const PROFILE_SIZES = "(min-width: 768px) 208px, 112px";
const profileSrcSet = (ext) => `${BASE}profile-224.${ext} 224w, ${BASE}profile-416.${ext} 416w`;

const T = {
  en: {
    tagline: (
      <>
        I build <span className="text-slate-800 font-medium">cloud infrastructure as code</span>,{" "}
        <span className="text-slate-800 font-medium">reliable data pipelines</span>, and{" "}
        <span className="text-slate-800 font-medium">controlled AI-assisted workflows</span>.
        {" "}Now a Data Engineer at PwC Luxembourg, after completing my engineering degree at Polytech Annecy.
      </>
    ),
    location: "Luxembourg",
  },
  fr: {
    tagline: (
      <>
        Je construis de l&apos;<span className="text-slate-800 font-medium">infrastructure cloud as code</span>,{" "}
        des <span className="text-slate-800 font-medium">pipelines de données fiables</span>, et des{" "}
        <span className="text-slate-800 font-medium">workflows IA maîtrisés</span>.
        {" "}Désormais Data Engineer chez PwC Luxembourg, après mon diplôme d&apos;ingénieur à Polytech Annecy.
      </>
    ),
    location: "Luxembourg",
  },
  ja: {
    tagline: (
      <>
        <span className="text-slate-800 font-medium">クラウドインフラのコード化（IaC）</span>、
        <span className="text-slate-800 font-medium">信頼性の高いデータパイプライン</span>、
        <span className="text-slate-800 font-medium">統制の取れたAI活用ワークフロー</span>を構築しています。
        ポリテック・アヌシーで工学の学位を取得後、現在はPwCルクセンブルクのデータエンジニアとして勤務しています。
      </>
    ),
    location: "ルクセンブルク",
  },
};

// Same photo treatment at two breakpoints; only sizing, glow spread and
// entrance timing differ.
const AVATAR = {
  mobile: {
    wrapper: "md:hidden relative w-28 h-28 mb-7",
    glow: "absolute -inset-2 rounded-full bg-gradient-to-br from-blue-200/60 via-indigo-200/40 to-transparent blur-lg",
    frame: "relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-200",
    delay: "0ms",
  },
  desktop: {
    wrapper: "hidden md:block relative",
    glow: "absolute -inset-3 rounded-full bg-gradient-to-br from-blue-200/60 via-indigo-200/40 to-transparent blur-xl",
    frame: "relative w-52 h-52 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-200",
    delay: "100ms",
  },
};

// Entrance animations are CSS (index.css), not framer-motion: they run as soon
// as the prerendered HTML paints instead of waiting for the JS bundle.
const Avatar = ({ variant, alt }) => {
  const v = AVATAR[variant];
  return (
    <div className={`${v.wrapper} pop-in`} style={{ animationDelay: v.delay }}>
      <div className={v.glow} />
      <div
        className={v.frame}
        style={{ backgroundImage: `url(${PROFILE_LQIP})`, backgroundSize: "cover" }}
      >
        <picture>
          <source type="image/avif" srcSet={profileSrcSet("avif")} sizes={PROFILE_SIZES} />
          <source type="image/webp" srcSet={profileSrcSet("webp")} sizes={PROFILE_SIZES} />
          <img
            src={`${BASE}profile.jpg`}
            alt={alt}
            className="w-full h-full object-cover"
            width={416}
            height={416}
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </div>
    </div>
  );
};

const Hero = ({ locale = "en" }) => {
  const t = T[locale] ?? T.en;
  const { fullName, subtitle } = resume[locale].identity;

  return (
    <section className="relative pt-12 pb-24 md:pt-20 md:pb-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_30%_0%,rgba(13,71,161,0.07),transparent_70%)]" />

      <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center">
        <div>
          {/* Mobile-only avatar — brings the desktop photo treatment to phones */}
          <Avatar variant="mobile" alt={`${fullName} — ${subtitle}`} />

          <span
            className="inline-block mb-5 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase bg-blue-100 text-blue-900 rounded-full fade-up"
            style={{ animationDelay: "0ms" }}
          >
            Data · Cloud · Infrastructure as Code
          </span>

          <h1
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-5 leading-[0.95] fade-up"
            style={{ animationDelay: "50ms" }}
          >
            {fullName}
          </h1>

          <p
            className="text-xl md:text-2xl text-slate-700 max-w-3xl leading-relaxed mb-3 fade-up"
            style={{ animationDelay: "120ms" }}
          >
            {subtitle}
          </p>

          <p
            className="text-base md:text-lg text-slate-500 max-w-3xl leading-relaxed mb-8 fade-up"
            style={{ animationDelay: "200ms" }}
          >
            {t.tagline}
          </p>

          <div
            className="flex flex-wrap items-center gap-3 fade-up"
            style={{ animationDelay: "280ms" }}
          >
            <DownloadCV locale={locale} />

            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-slate-200 bg-white text-sm font-semibold text-slate-800 px-4 py-2.5 rounded-full hover:border-blue-300 hover:text-blue-800 transition"
            >
              <SiGithub size={16} /> GitHub
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-slate-200 bg-white text-sm font-semibold text-slate-800 px-4 py-2.5 rounded-full hover:border-blue-300 hover:text-blue-800 transition"
            >
              <SiLinkedin size={16} /> LinkedIn
            </a>

            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 pl-1">
              <MapPin size={14} /> {t.location}
            </span>
          </div>
        </div>

        <Avatar variant="desktop" alt={`${fullName} — ${subtitle}`} />
      </div>
    </section>
  );
};

export default Hero;
