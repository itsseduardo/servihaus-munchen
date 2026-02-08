"use client";

export default function ServiceHistoryTable() {
  return (
    <div className="bg-white dark:bg-[#1a242f] rounded-lg border border-[#dbe0e6] dark:border-[#2d3748] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#dbe0e6] dark:border-[#2d3748] flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Service Execution History
        </h3>
        <span className="text-xs text-[#617589]">
          Showing 1–12 of 34 records
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs font-bold text-[#617589] uppercase tracking-wider">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Service Type</th>
              <th className="px-4 py-3">Technician / Team</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3 text-right">Audit Trail</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f0f2f4] dark:divide-[#2d3748] text-sm">
            {/* Row 1 */}
            <tr>
              <td className="px-4 py-3 font-mono">Oct 12, 2023</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-bold uppercase mr-2">
                  Standard
                </span>
                Regular Maintenance
              </td>
              <td className="px-4 py-3">Team Alpha (3 pax)</td>
              <td className="px-4 py-3">4.0 h</td>
              <td className="px-4 py-3 text-[#617589]">€ 45.00/h</td>
              <td className="px-4 py-3 font-bold">€ 540,00</td>
              <td className="px-4 py-3 text-right">
                <a
                  href="#"
                  className="text-primary hover:underline text-xs font-bold inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    open_in_new
                  </span>
                  View Source
                </a>
              </td>
            </tr>

            {/* Row 2 */}
            <tr>
              <td className="px-4 py-3 font-mono">Oct 14, 2023</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-bold uppercase mr-2">
                  Extra
                </span>
                Deep Cleaning
              </td>
              <td className="px-4 py-3">Special Ops (2 pax)</td>
              <td className="px-4 py-3">6.5 h</td>
              <td className="px-4 py-3 text-[#617589]">€ 65.00/h</td>
              <td className="px-4 py-3 font-bold">€ 845,00</td>
              <td className="px-4 py-3 text-right">
                <a
                  href="#"
                  className="text-primary hover:underline text-xs font-bold inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    open_in_new
                  </span>
                  View Source
                </a>
              </td>
            </tr>

            {/* Row 3 */}
            <tr>
              <td className="px-4 py-3 font-mono">Oct 18, 2023</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-bold uppercase mr-2">
                  Standard
                </span>
                Regular Maintenance
              </td>
              <td className="px-4 py-3">Team Beta (3 pax)</td>
              <td className="px-4 py-3">4.0 h</td>
              <td className="px-4 py-3 text-[#617589]">€ 45.00/h</td>
              <td className="px-4 py-3 font-bold">€ 540,00</td>
              <td className="px-4 py-3 text-right">
                <a
                  href="#"
                  className="text-primary hover:underline text-xs font-bold inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    open_in_new
                  </span>
                  View Source
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 dark:bg-[#1a242f] border-t border-[#dbe0e6] dark:border-[#2d3748] flex justify-center">
        <button className="text-xs font-bold text-[#617589] hover:text-[#111418] dark:hover:text-white uppercase tracking-widest">
          Load More Service Records
        </button>
      </div>
    </div>
  );
}
