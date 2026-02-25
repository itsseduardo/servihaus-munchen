"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", value: 40 },
  { month: "Feb", value: 35 },
  { month: "Mar", value: 50 },
  { month: "Apr", value: 65 },
  { month: "May", value: 80 },
  { month: "Jun", value: 95 },
];

export default function AdminServicesChart() {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-[#dbdee6] dark:border-slate-800 shadow-sm">
      
      <div className="mb-6">
        <h3 className="font-bold text-lg">
          Services Performed
        </h3>
        <p className="text-xs text-[#616b89]">
          Volume comparison over 6 months
        </p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f3bbd" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#0f3bbd" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0f3bbd"
              fill="url(#colorRevenue)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
