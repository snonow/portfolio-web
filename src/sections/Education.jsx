import { GraduationCap } from "lucide-react";
import resume from "../data/resume.json";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";

const Education = ({ locale = "en" }) => {
  const items = resume[locale].education;

  return (
    <section className="mb-24">
      <Reveal>
        <SectionHeading>{locale === "fr" ? "Formation" : "Education"}</SectionHeading>
      </Reveal>

      <ol className="relative border-l border-slate-200 ml-3 space-y-7">
        {items.map((e, i) => (
          <Reveal key={e.id} delay={i * 0.04}>
            <li className="ml-6">
              <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-emerald-100 rounded-full ring-4 ring-white">
                <GraduationCap size={12} className="text-emerald-800" />
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="font-semibold text-slate-900">
                  {e.school}
                  <span className="text-slate-500 font-normal"> — {e.degree}</span>
                </h3>
                <time className="text-xs text-slate-500 font-medium">{e.dates}</time>
              </div>
              {(e.details || e.location) && (
                <p className="italic text-sm text-slate-600 mt-1">
                  {[e.details, e.location].filter(Boolean).join(" · ")}
                </p>
              )}
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
};

export default Education;
