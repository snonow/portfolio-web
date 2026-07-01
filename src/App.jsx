import { useState } from "react";
import Hero from "./sections/Hero";
import Experience from "./sections/Experience";
import Education from "./sections/Education";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import GitHubActivity from "./sections/GitHubActivity";

import ScrollProgress from "./components/ScrollProgress";
import resume from "./data/resume.json";
import { GITHUB_PROFILE_URL } from "./data/github";
import { LINKEDIN_URL } from "./data/links";

import { Mail } from "lucide-react";
import { SiGithub, SiLinkedin } from "react-icons/si";

const NAV = {
  en: [
    { id: "experience", label: "Experience" },
    { id: "projects",   label: "Projects" },
    { id: "education",  label: "Education" },
    { id: "skills",     label: "Skills" },
    { id: "github",     label: "GitHub" },
  ],
  fr: [
    { id: "experience", label: "Expérience" },
    { id: "projects",   label: "Projets" },
    { id: "education",  label: "Formation" },
    { id: "skills",     label: "Compétences" },
    { id: "github",     label: "GitHub" },
  ],
};

const App = () => {
  const [locale, setLocale] = useState("en");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur border-b border-slate-200">
        <nav className="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between">
          <a href="#hero" className="font-bold text-slate-900 tracking-tight">Arno Wilhelm</a>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6 text-sm text-slate-600">
              {NAV[locale].map((n) => (
                <a key={n.id} href={`#${n.id}`} className="hover:text-blue-800 transition">
                  {n.label}
                </a>
              ))}
            </div>
            <button
              onClick={() => setLocale((l) => (l === "en" ? "fr" : "en"))}
              className="text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-800 transition"
              aria-label="Switch language"
            >
              {locale === "en" ? "FR" : "EN"}
            </button>
          </div>
        </nav>
      </header>
      <ScrollProgress />

      <main className="pt-20 max-w-6xl mx-auto px-6">
        <section id="hero"><Hero locale={locale} /></section>
        <section id="experience"><Experience locale={locale} /></section>
        <section id="projects"><Projects locale={locale} /></section>
        <section id="education"><Education locale={locale} /></section>
        <section id="skills"><Skills locale={locale} /></section>
        <section id="github"><GitHubActivity locale={locale} /></section>
      </main>

      <footer className="mt-24 border-t bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <div className="flex justify-center gap-6 mb-6">
            <a href={GITHUB_PROFILE_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
              <SiGithub size={22} />
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <SiLinkedin size={22} />
            </a>
            <a href="mailto:arnowilhelm3@icloud.com" aria-label="Email">
              <Mail size={22} />
            </a>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Arno Wilhelm</p>
          {resume._lastUpdated && (
            <p className="text-xs mt-1 text-slate-600">
              {locale === "en" ? "Last updated" : "Mis à jour le"} {resume._lastUpdated}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;
