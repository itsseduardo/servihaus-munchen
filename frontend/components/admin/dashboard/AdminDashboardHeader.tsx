"use client";

export default function AdminDashboardHeader() {
  return (
    <div className="flex flex-wrap justify-between items-end gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black tracking-tight">
          Business Analytics
        </h2>
        <p className="text-[#616b89] dark:text-slate-400 text-sm">
          Executive overview of service scheduling and revenue performance for ServiHaus.
        </p>
      </div>

      <div className="flex gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-[#dbdee6] dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold shadow-sm">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          This Month
        </button>

        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-md hover:opacity-90">
          <span className="material-symbols-outlined text-sm">refresh</span>
          Update Data
        </button>
      </div>
    </div>
  );
}
