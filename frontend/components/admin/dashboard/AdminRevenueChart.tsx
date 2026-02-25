"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Müller", revenue: 8500 },
  { name: "Bauer AG", revenue: 12500 },
  { name: "Schmidt", revenue: 6000 },
  { name: "Weber", revenue: 10500 },
  { name: "Hofmann", revenue: 4000 },
];

export default function AdminRevenueChart() {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-[#dbdee6] dark:border-slate-800 shadow-sm">
      
      <div className="mb-6">
        <h3 className="font-bold text-lg">
          Revenue per Top 5 Clients
        </h3>
        <p className="text-xs text-[#616b89]">
          Current billing cycle in Euros
        </p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#0f3bbd" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
