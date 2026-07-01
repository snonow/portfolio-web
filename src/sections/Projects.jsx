import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin } from "lucide-react";

import resume from "../data/resume.json";
import projectsData from "../data/github_projects.json";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import ProjectExpandableCard from "../components/ProjectExpandableCard";

const GITHUB_PROFILE = "https://github.com/snonow";

const T = {
  en: { title: "Projects", repos: "Pinned on GitHub", profile: "github.com/snonow" },
  fr: { title: "Projets", repos: "Épinglés sur GitHub", profile: "github.com/snonow" },
};

// Every pinned repo is shown (curation is done on GitHub via pin/unpin).
// Rank so the substantial repos (releases, visuals, stars, rich topics) lead.
const richness = (p) =>
  (p.stars || 0) * 3 +
  (p.releases?.length ? 3 : 0) +
  (p.readme_images?.length ? 2 : 0) +
  (p.topics?.length || 0) * 0.3;

const Projects = ({ locale = "en" }) => {
  const t = T[locale] ?? T.en;
  const [active, setActive] = useState(null);

  const resumeProjects = resume[locale]?.projects ?? [];
  const repos = [...(projectsData.projects ?? [])].sort((a, b) => richness(b) - richness(a));

  return (
    <section className="mb-24">
      <Reveal>
        <SectionHeading>{t.title}</SectionHeading>
      </Reveal>

      {/* Résumé projects — richest, with detailed bullets */}
      {resumeProjects.length > 0 && (
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {resumeProjects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <article className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 transition h-full">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 mb-1">
                  <h3 className="font-semibold text-slate-900">{p.title}</h3>
                  <time className="text-xs text-slate-500 font-medium">{p.dates}</time>
                </div>
                <p className="italic text-sm text-slate-600 mb-3">
                  {[p.org, p.location].filter(Boolean).join(" · ")}
                </p>
                <ul className="list-disc list-outside pl-5 text-sm text-slate-700 space-y-1.5 leading-relaxed">
                  {p.bullets.map((b) => (
                    <li key={b.id}>{b.text}</li>
                  ))}
                </ul>
                {p.tags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      )}

      {/* Curated GitHub repos */}
      {repos.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
              <Pin size={14} className="text-slate-400" />
              {t.repos}
            </h3>
            <a
              href={GITHUB_PROFILE}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-blue-700 bg-white border px-3 py-1 rounded-full transition"
            >
              {t.profile} ↗
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {repos.map((project) => (
              <ProjectExpandableCard
                key={project.name}
                project={project}
                onOpen={() => setActive(project)}
                onClose={() => setActive(null)}
              />
            ))}
          </div>

          <AnimatePresence>
            {active && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6"
                onClick={() => setActive(null)}
              >
                <ProjectExpandableCard project={active} expanded onClose={() => setActive(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </section>
  );
};

export default Projects;
