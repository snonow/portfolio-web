const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="bg-slate-900 text-white text-xs p-3 rounded">
      <p className="font-bold">{d.source}</p>
      <p>Coverage: {d.recall}%</p>
      <p>Relevance: {d.relevance}</p>
      <p>Decision: {d.decision}</p>
    </div>
  );
};

export default CustomTooltip;