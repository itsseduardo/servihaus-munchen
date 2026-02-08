"use client";

export default function FinanceKpiExtras() {
  return (
    <div className="bg-white dark:bg-[#1a242f] p-6 rounded-lg border border-[#dbe0e6] dark:border-[#2d3748] shadow-sm flex flex-col justify-between border-l-4 border-l-primary">
      
      <div>
        <p className="text-sm font-medium text-[#617589]">
          Extra Services & Adjustments
        </p>

        <p className="text-3xl font-black mt-2 tracking-tight">
          €2.650,00
        </p>
      </div>

      <p className="text-xs font-bold text-primary mt-4 flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">
          info
        </span>
        Audit focus required
      </p>

    </div>
  );
}
