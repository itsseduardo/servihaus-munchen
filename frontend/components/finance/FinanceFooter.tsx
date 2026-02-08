"use client";

export default function FinanceFooter() {
  return (
    <footer className="bg-white dark:bg-[#1a242f] border-t border-[#dbe0e6] dark:border-[#2d3748] mt-12 py-8 px-6 lg:px-10">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Left */}
        <div className="max-w-2xl">
          <p className="text-xs font-bold text-[#111418] dark:text-white uppercase tracking-wider mb-2">
            Audit Compliance Notice
          </p>
          <p className="text-xs text-[#617589] leading-relaxed">
            This dashboard and its data are generated for internal audit and
            financial verification purposes. All financial figures are
            synchronized in real-time with the ServiHause Core ERP system.
            Access is strictly read-only for auditors and accounting personnel.
            Any discrepancies should be reported to the Finance Department via
            the internal ticketing system.
          </p>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="text-[10px] font-mono text-[#617589]">
            Last Sync: 2023-11-01 08:34:21 CET
          </p>

          <div className="flex items-center gap-4">
            <img
              className="opacity-50 grayscale"
              alt="Certified Audit Logo"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTqhzyI8ijs8jxEOuVAXHce3r4oIVNLLivSNzB7OfKHWEE0nUsliN0dC-VqJeulIuiaySksVeNNSlLo9phsQ2iqtZZDBgARrUKdyRiNclKtWj_PMryGSsG9KjBZD2uPMOgmXwEltJQA0aHB1EaIhBl6Gotf__2zr7S-V99IHaR7L1qJKnZc35ah5-RsK3vLhSCTvpxvbK96i1zKh_yUNYpSTiRLzPHUViSFWHVjiuGDxmSnz3VfrixFzkytpRewBtxQ7yA-OXW9Wg"
            />
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <p className="text-xs font-bold">ServiHauseMünchen GRC</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
