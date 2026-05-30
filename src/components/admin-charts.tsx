"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ChartDataPoint {
  name: string;
  students: number;
}

interface AdminChartsProps {
  data: ChartDataPoint[];
}

export default function AdminCharts({ data }: AdminChartsProps) {
  const COLORS = ["#005ab4", "#0a73e0", "#465f88", "#964400"];

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-400 text-xs">
        No program enrollment data available for analytics.
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: "#717785", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: "#717785", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(255, 255, 255, 0.95)", 
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
              fontSize: "11px"
            }}
          />
          <Bar dataKey="students" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
