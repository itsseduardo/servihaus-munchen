"use client";

export default function FinanceHeader() {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">
          Financial Audit Dashboard
        </h2>
        <p className="text-[#617589] mt-1">
          Detailed billing transparency and internal accounting controls.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="flex items-center gap-2 px-4 py-2 border border-[#dbe0e6] dark:border-[#2d3748] rounded font-bold text-sm bg-white dark:bg-[#1a242f] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-sm">download</span>
          Export CSV
        </button>

        <button className="flex items-center gap-2 px-4 py-2 border border-[#dbe0e6] dark:border-[#2d3748] rounded font-bold text-sm bg-white dark:bg-[#1a242f] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
          Export PDF
        </button>

        <button className="bg-primary text-white px-6 py-2 rounded font-bold text-sm hover:bg-primary/90 transition-colors">
          Generate Quarterly Report
        </button>
      </div>
    </div>
  );
}
