const SectionHeading = ({ children, className = "mb-8" }) => (
  <h2 className={`text-2xl font-bold text-slate-900 flex items-center gap-3 ${className}`}>
    <span className="w-1.5 h-7 bg-blue-900 rounded-sm" />
    {children}
  </h2>
);

export default SectionHeading;
