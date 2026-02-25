"use client";

export default function AdminStatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total Revenue */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-[#dbdee6] dark:border-slate-800 shadow-sm flex flex-col gap-2">
        <div className="flex justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#616b89]">
            Total Revenue
          </p>
          <span className="material-symbols-outlined text-primary">
            euro_symbol
          </span>
        </div>
        <p className="text-3xl font-black">€42.850</p>
        <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          +12,5%
        </div>
      </div>

      {/* Hours Worked */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-[#dbdee6] dark:border-slate-800 shadow-sm flex flex-col gap-2">
        <div className="flex justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#616b89]">
            Hours Worked
          </p>
          <span className="material-symbols-outlined text-primary">
            schedule
          </span>
        </div>
        <p className="text-3xl font-black">1.240 hrs</p>
        <div className="flex items-center gap-1 text-red-500 text-sm font-bold">
          <span className="material-symbols-outlined text-sm">trending_down</span>
          -2,4%
        </div>
      </div>

      {/* Active Clients */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-[#dbdee6] dark:border-slate-800 shadow-sm flex flex-col gap-2">
        <div className="flex justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#616b89]">
            Active Clients
          </p>
          <span className="material-symbols-outlined text-primary">
            person_check
          </span>
        </div>
        <p className="text-3xl font-black">184</p>
        <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          +5,0%
        </div>
      </div>

      {/* Jobs Completed */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-[#dbdee6] dark:border-slate-800 shadow-sm flex flex-col gap-2">
        <div className="flex justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#616b89]">
            Jobs Completed
          </p>
          <span className="material-symbols-outlined text-primary">
            task_alt
          </span>
        </div>
        <p className="text-3xl font-black">312</p>
        <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          +8,2%
        </div>
      </div>

    </div>
  );
}
