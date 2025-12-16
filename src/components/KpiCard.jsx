import { motion } from "framer-motion";

const KpiCard = ({ title, value, icon, color }) => (
  <motion.div
    className="bg-white p-6 rounded-xl border shadow-sm"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${color}`}>
      {icon}
    </div>
    <div className="text-xs uppercase text-slate-500 mb-1">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </motion.div>
);

export default KpiCard;