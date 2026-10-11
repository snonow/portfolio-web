import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { SiGithub, SiLinkedin } from "react-icons/si";

import resume from "../data/resume.json";
import DownloadCV from "../components/DownloadCV";
import { GITHUB_PROFILE_URL } from "../data/github";
import { LINKEDIN_URL } from "../data/links";

const BASE = import.meta.env.BASE_URL;

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
    transition: { duration: 0.5, ease: "easeOut" },
  },
  desktop: {
    wrapper: "hidden md:block relative",
    glow: "absolute -inset-3 rounded-full bg-gradient-to-br from-blue-200/60 via-indigo-200/40 to-transparent blur-xl",
    frame: "relative w-52 h-52 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-200",
    transition: { duration: 0.6, delay: 0.1, ease: "easeOut" },
  },
};

const Avatar = ({ variant, alt }) => {
  const v = AVATAR[variant];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={v.transition}
      className={v.wrapper}
    >
      <div className={v.glow} />
      <div className={v.frame}>
        <img
          src={`${BASE}profile.jpg`}
          alt={alt}
          className="w-full h-full object-cover"
          width={640}
          height={640}
          loading="eager"
        />
      </div>
    </motion.div>
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

          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block mb-5 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase bg-blue-100 text-blue-900 rounded-full"
          >
            Data · Cloud · Infrastructure as Code
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-5 leading-[0.95]"
          >
            {fullName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="text-xl md:text-2xl text-slate-700 max-w-3xl leading-relaxed mb-3"
          >
            {subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-lg text-slate-500 max-w-3xl leading-relaxed mb-8"
          >
            {t.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="flex flex-wrap items-center gap-3"
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
          </motion.div>
        </div>

        <Avatar variant="desktop" alt={`${fullName} — ${subtitle}`} />
      </div>
    </section>
  );
};

export default Hero;
