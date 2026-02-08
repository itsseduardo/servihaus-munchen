"use client";

export default function FinanceKpiRegularService() {
  return (
    <div className="bg-white dark:bg-[#1a242f] p-6 rounded-lg border border-[#dbe0e6] dark:border-[#2d3748] shadow-sm flex flex-col justify-between">
      
      <div>
        <p className="text-sm font-medium text-[#617589]">
          Regular Service Total
        </p>

        <p className="text-3xl font-black mt-2 tracking-tight">
          €9.800,00
        </p>
      </div>

      <p className="text-xs font-bold text-[#617589] mt-4">
        Fixed contract base
      </p>

    </div>
  );
}
