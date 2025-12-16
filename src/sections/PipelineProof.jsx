import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PipelineProof = ({ stages }) => (
  <section className="mb-20">
    <h2 className="text-2xl font-bold mb-6">Pipeline Proof</h2>

    <div className="grid md:grid-cols-3 gap-6">
      {stages.map((s, i) => (
        <motion.div
          key={s.id}
          className="border rounded p-4 bg-slate-50"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight size={14} />
            <h3 className="font-semibold">{s.title}</h3>
          </div>
          <p className="text-sm text-slate-600">{s.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default PipelineProof;