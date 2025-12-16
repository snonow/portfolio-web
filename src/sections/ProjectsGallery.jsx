import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import projectsData from "../data/github_projects.json";
import ProjectExpandableCard from "../components/ProjectExpandableCard";

const ProjectsGallery = () => {
  const [activeProject, setActiveProject] = useState(null);

  const projects = projectsData.projects;

  return (
    <section id="projects" className="mb-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-8 bg-blue-900 rounded-sm"></span>
          Selected Projects
        </h2>
        <span className="text-sm text-slate-500 bg-white border px-3 py-1 rounded-full">
          Auto-generated from GitHub
        </span>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectExpandableCard
            key={project.name}
            project={project}
            isActive={activeProject?.name === project.name}
            onOpen={() => setActiveProject(project)}
            onClose={() => setActiveProject(null)}
          />
        ))}
      </div>

      {/* EXPANDED VIEW */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6"
          >
            <ProjectExpandableCard
              project={activeProject}
              expanded
              onClose={() => setActiveProject(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProjectsGallery;