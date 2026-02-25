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
  { name: "Hans M.", hours: 168 },
  { name: "Lukas K.", hours: 152 },
  { name: "Sarah W.", hours: 144 },
  { name: "Erik T.", hours: 128 },
];

export default function AdminTopEmployees() {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-[#dbdee6] dark:border-slate-800 shadow-sm lg:col-span-2">
      
      <div className="mb-6">
        <h3 className="font-bold text-lg">
          Top Employees by Hours Worked
        </h3>
        <p className="text-xs text-[#616b89]">
          Total billable hours this month
        </p>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
          >
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="hours" fill="#0f3bbd" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
