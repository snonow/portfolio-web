import resume from "../data/resume.json";
import Reveal from "../components/Reveal";

// Split on top-level commas/pipes only, so parenthetical groups like
// "Microsoft Azure (ADF, Functions, Cosmos DB)" stay a single chip.
const splitItems = (str) => {
  const out = [];
  let buf = "";
  let depth = 0;
  for (const ch of str) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if ((ch === "," || ch === "|") && depth === 0) {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
};

const Skills = ({ locale = "en" }) => {
  const items = resume[locale].skills;

  return (
    <section className="mb-24">
      <Reveal>
        <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <span className="w-1.5 h-7 bg-blue-900 rounded-sm" />
          {locale === "fr" ? "Compétences" : "Skills"}
        </h2>
      </Reveal>

      <div className="grid md:grid-cols-2 gap-6">
        {items.map((s, i) => (
          <Reveal key={s.category} delay={i * 0.05}>
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                {s.category.replace(/[:：]\s*$/, "")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {splitItems(s.items).map((item) => (
                  <span
                    key={item}
                    className="text-xs px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-100 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Skills;
