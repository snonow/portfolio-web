import { Briefcase, FileText, ExternalLink } from "lucide-react";
import resume from "../data/resume.json";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";

const T = {
  en: { title: "Professional Experience" },
  fr: { title: "Expérience Professionnelle" },
};

const Experience = ({ locale = "en" }) => {
  const t = T[locale] ?? T.en;
  const items = resume[locale].experience;

  return (
    <section className="mb-24">
      <Reveal><SectionHeading>{t.title}</SectionHeading></Reveal>

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
                  <li key={b.id} className="flex items-start gap-2">
                    <span className="flex-1">{b.text}</span>
                    {b.link && (
                      <span className="flex items-center gap-1 shrink-0 mt-0.5">
                        <a href={b.link.href} target="_blank" rel="noopener noreferrer" title="View PDF" className="text-blue-700 hover:text-blue-900">
                          <FileText size={13} />
                        </a>
                        {(b.link.catalog || b.link.ndl) && (
                          <a href={b.link.catalog || b.link.ndl} target="_blank" rel="noopener noreferrer" title="Catalog entry (J-GLOBAL)" className="text-slate-400 hover:text-slate-600">
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </span>
                    )}
                  </li>
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
