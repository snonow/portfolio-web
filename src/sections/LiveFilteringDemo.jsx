import { useState } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import CustomTooltip from "../components/CustomTooltip";

const LiveFilteringDemo = ({ data }) => {
  const [threshold, setThreshold] = useState(0.7);

  const evaluated = data.map(d => ({
    ...d,
    decision: d.relevance >= threshold ? "accepted" : "rejected",
  }));

  return (
    <section className="mb-20">
      <h2 className="text-2xl font-bold mb-4">Live Pipeline Behavior</h2>

      <input
        type="range"
        min="0.5"
        max="0.9"
        step="0.05"
        value={threshold}
        onChange={e => setThreshold(Number(e.target.value))}
        className="mb-6"
      />

      <div className="h-[400px]">
        <ResponsiveContainer>
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey="recall" unit="%" />
            <YAxis dataKey="relevance" />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={evaluated}
              shape={p => (
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={6}
                  className={p.payload.decision === "accepted"
                    ? "fill-blue-600"
                    : "fill-slate-300"}
                />
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default LiveFilteringDemo;