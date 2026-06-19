import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { SiGithub, SiLinkedin } from "react-icons/si";

import resume from "../data/resume.json";
import DownloadCV from "../components/DownloadCV";

const BASE = import.meta.env.BASE_URL;

const Hero = ({ locale = "en" }) => {
  const { fullName, subtitle } = resume[locale].identity;

  return (
    <section className="relative pt-12 pb-24 md:pt-20 md:pb-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_30%_0%,rgba(13,71,161,0.07),transparent_70%)]" />

      <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block mb-5 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase bg-blue-100 text-blue-900 rounded-full"
          >
            Data · MLOps · Business Intelligence
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
            {locale === "fr" ? (
              <>
                Je construis des <span className="text-slate-800 font-medium">pipelines de données fiables</span>,{" "}
                des <span className="text-slate-800 font-medium">tableaux de bord décisionnels</span>, et des{" "}
                <span className="text-slate-800 font-medium">workflows IA maîtrisés</span>.
                {" "}Actuellement BI Intern chez PwC Luxembourg, en parallèle de mon diplôme d&apos;ingénieur à Polytech Annecy.
              </>
            ) : (
              <>
                I build <span className="text-slate-800 font-medium">reliable data pipelines</span>,{" "}
                <span className="text-slate-800 font-medium">decision-ready dashboards</span>, and{" "}
                <span className="text-slate-800 font-medium">controlled AI-assisted workflows</span>.
                {" "}Currently a BI Intern at PwC Luxembourg, alongside my engineering degree at Polytech Annecy.
              </>
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="flex flex-wrap items-center gap-3"
          >
            <DownloadCV />

            <a
              href="https://github.com/snonow"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-slate-200 bg-white text-sm font-semibold text-slate-800 px-4 py-2.5 rounded-full hover:border-blue-300 hover:text-blue-800 transition"
            >
              <SiGithub size={16} /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/arno-wilhelm/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-slate-200 bg-white text-sm font-semibold text-slate-800 px-4 py-2.5 rounded-full hover:border-blue-300 hover:text-blue-800 transition"
            >
              <SiLinkedin size={16} /> LinkedIn
            </a>

            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 pl-1">
              <MapPin size={14} /> Based in France · open to Europe-wide remote
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="hidden md:block relative"
        >
          <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-blue-200/60 via-indigo-200/40 to-transparent blur-xl" />
          <div className="relative w-52 h-52 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-200">
            <img
              src={`${BASE}profile.jpg`}
              alt={`${fullName} — ${subtitle}`}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
