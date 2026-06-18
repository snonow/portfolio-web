import resume from "../data/resume.json";
import Reveal from "../components/Reveal";

const FeaturedProjects = ({ locale = "en" }) => {
  const items = resume[locale].projects;
  if (!items?.length) return null;

  return (
    <section className="mb-24">
      <Reveal>
        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <span className="w-1.5 h-7 bg-blue-900 rounded-sm" />
          Featured Projects
        </h2>
      </Reveal>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map((p, i) => (
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
                  {p.tags.map((t) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProjects;
