import Hero from "./sections/Hero";
import Experience from "./sections/Experience";
import Education from "./sections/Education";
import Skills from "./sections/Skills";
import FeaturedProjects from "./sections/FeaturedProjects";
import GitHubSignals from "./sections/GitHubSignals";
import PipelineProof from "./sections/PipelineProof";
import ProjectsGallery from "./sections/ProjectsGallery";

import ScrollProgress from "./components/ScrollProgress";
import { pipelineStages } from "./data/pipeline";

import { Mail } from "lucide-react";
import { SiGithub, SiLinkedin } from "react-icons/si";

const NAV = [
  { id: "experience", label: "Experience" },
  { id: "projects",   label: "Projects" },
  { id: "skills",     label: "Skills" },
  { id: "education",  label: "Education" },
  { id: "github",     label: "GitHub" },
];

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur border-b border-slate-200">
        <nav className="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between">
          <a href="#hero" className="font-bold text-slate-900 tracking-tight">Arno Wilhelm</a>
          <div className="hidden md:flex gap-6 text-sm text-slate-600">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="hover:text-blue-800 transition">
                {n.label}
              </a>
            ))}
          </div>
        </nav>
      </header>
      <ScrollProgress />

      <main className="pt-20 max-w-6xl mx-auto px-6">
        <section id="hero"><Hero /></section>
        <section id="experience"><Experience /></section>
        <section id="projects"><FeaturedProjects /></section>
        <section id="open-source"><ProjectsGallery /></section>
        <section id="skills"><Skills /></section>
        <section id="education"><Education /></section>
        <section id="github"><GitHubSignals /></section>
        <section id="pipeline"><PipelineProof stages={pipelineStages} /></section>
      </main>

      <footer className="mt-24 border-t bg-slate-900 text-slate-400">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <div className="flex justify-center gap-6 mb-6">
            <a href="https://github.com/snonow" target="_blank" rel="noreferrer" aria-label="GitHub">
              <SiGithub size={22} />
            </a>
            <a href="https://linkedin.com/in/arno-wilhelm" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <SiLinkedin size={22} />
            </a>
            <a href="mailto:arnowilhelm3@icloud.com" aria-label="Email">
              <Mail size={22} />
            </a>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Arno Wilhelm</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
