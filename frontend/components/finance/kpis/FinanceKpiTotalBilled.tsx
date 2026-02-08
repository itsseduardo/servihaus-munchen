"use client";

export default function FinanceKpiTotalBilled() {
  return (
    <div className="bg-white dark:bg-[#1a242f] p-6 rounded-lg border border-[#dbe0e6] dark:border-[#2d3748] shadow-sm flex flex-col justify-between">
      
      <div>
        <p className="text-sm font-medium text-[#617589]">
          Total Billed
        </p>

        <p className="text-3xl font-black mt-2 tracking-tight">
          €12.450,00
        </p>
      </div>

      <p className="text-xs font-bold text-green-600 mt-4 flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">
          trending_up
        </span>
        +8.2% vs prev. month
      </p>

    </div>
  );
}
