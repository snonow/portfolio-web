import { Briefcase } from "lucide-react";
import resume from "../data/resume.json";
import Reveal from "../components/Reveal";

const SectionHeading = ({ children }) => (
  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
    <span className="w-1.5 h-7 bg-blue-900 rounded-sm" />
    {children}
  </h2>
);

const Experience = ({ locale = "en" }) => {
  const items = resume[locale].experience;

  return (
    <section className="mb-24">
      <Reveal><SectionHeading>{locale === "fr" ? "Expérience Professionnelle" : "Professional Experience"}</SectionHeading></Reveal>

      <ol className="relative border-l border-slate-200 ml-3 space-y-8">
        {items.map((x, i) => (
          <Reveal key={x.id} delay={i * 0.05}>
            <li className="ml-6">
              <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-4 ring-white">
                <Briefcase size={12} className="text-blue-800" />
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="font-semibold text-slate-900">{x.company}</h3>
                <time className="text-xs text-slate-500 font-medium">{x.dates}</time>
              </div>
              <p className="italic text-sm text-slate-600 mb-2">
                {[x.role, x.location].filter(Boolean).join(" — ")}
              </p>
              <ul className="list-disc list-outside pl-5 text-sm text-slate-700 space-y-1.5 leading-relaxed">
                {x.bullets.map((b) => (
                  <li key={b.id}>{b.text}</li>
                ))}
              </ul>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
};

export default Experience;
