"use client";

export default function FinanceAuditFilters() {
  return (
    <div className="bg-white dark:bg-[#1a242f] p-6 rounded-xl border border-[#e2e8f0] dark:border-[#2d3748] shadow-sm h-full flex flex-col justify-between">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8] mb-6">
        Audit Parameters
      </h3>

      <div className="space-y-5 flex-grow">
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-bold text-[#1e293b]">Client Selection</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">corporate_fare</span>
            <input
              type="text"
              readOnly
              defaultValue="Berlin Real Estate Holding GmbH"
              className="h-10 w-full pl-10 pr-4 rounded-md border border-[#e2e8f0] bg-[#f8fafc] text-[13px] font-medium outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-bold text-[#1e293b]">Audit Period</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">calendar_today</span>
            <input
              type="text"
              readOnly
              defaultValue="Oct 01, 2023 - Oct 31, 2023"
              className="h-10 w-full pl-10 pr-4 rounded-md border border-[#e2e8f0] bg-[#f8fafc] text-[13px] font-medium outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}