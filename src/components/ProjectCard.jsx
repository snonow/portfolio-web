import { motion } from "framer-motion";
import { Award } from "lucide-react";

const ProjectCard = ({ project, index }) => (
  <motion.div
    className="bg-white rounded-xl border p-6"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
  >
    <h3 className="font-bold">{project.title}</h3>
    <p className="text-sm text-slate-500">{project.company}</p>
    <p className="text-sm mt-3">{project.desc}</p>

    <div className="flex gap-2 mt-4 flex-wrap">
      {project.tags.map(t => (
        <span key={t} className="text-xs px-2 py-1 border rounded">{t}</span>
      ))}
    </div>

    <div className="flex items-center text-sm text-blue-700 mt-4">
      <Award size={14} className="mr-1" /> {project.metrics}
    </div>
  </motion.div>
);

export default ProjectCard;