"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Props = {
  data: { name: string; clicks: number }[];
};

export default function AnalyticsChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
        <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 12 }} />
        <YAxis tick={{ fill: "#888", fontSize: 12 }} />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8 }}
          labelStyle={{ color: "#fff" }}
        />
        <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill="#3b82f6" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
