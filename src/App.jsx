import GitHubSignals from "./sections/GitHubSignals";
import PipelineProof from "./sections/PipelineProof";
import LiveFilteringDemo from "./sections/LiveFilteringDemo";

import { filteringData, pipelineStages } from "./data/pipeline";

import { Mail } from "lucide-react";
import { SiGithub, SiLinkedin } from "react-icons/si";

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur border-b">
        <nav className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <div className="font-bold text-slate-900">Arno Wilhelm</div>
          <div className="hidden md:flex gap-6 text-sm text-slate-600">
            <a href="#github" className="hover:text-blue-700">GitHub</a>
            <a href="#pipeline" className="hover:text-blue-700">Pipeline</a>
            <a href="#demo" className="hover:text-blue-700">Live Demo</a>
          </div>
        </nav>
      </header>

      {/* MAIN */}
      <main className="pt-24 max-w-7xl mx-auto px-6">
        {/* HERO */}
        <section className="mb-20 max-w-3xl">
          <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
            DATA / BI ENGINEER — FREELANCE
          </span>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            I design production-grade data pipelines and decision-ready dashboards.
          </h1>
          <p className="text-slate-600 text-lg">
            Background in BI consulting, academic ML pipelines, and client-facing delivery.
            Focus on correctness, explainability, and real constraints — not demos.
          </p>
        </section>

        {/* DASHBOARD SECTIONS */}
        <section id="github">
          <GitHubSignals />
        </section>

        <section id="pipeline">
          <PipelineProof stages={pipelineStages} />
        </section>

        <section id="demo">
          <LiveFilteringDemo data={filteringData} />
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-24 border-t bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <div className="flex justify-center gap-6 mb-6">
            <a href="https://github.com/snonow" target="_blank" rel="noreferrer">
              <SiGithub size={22} />
            </a>
            <a href="https://linkedin.com/in/arno-wilhelm" target="_blank" rel="noreferrer">
              <SiLinkedin size={22} />
            </a>
            <a href="mailto:arnowilhelm3@icloud.com">
              <Mail size={22} />
            </a>
          </div>
          <p className="text-sm">
            © 2025 Arno Wilhelm — Built as a React data dashboard
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;