"use client";

export default function FinanceTopbar() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#1a242f] border-b border-[#dbe0e6] dark:border-[#2d3748] px-6 lg:px-10 py-3 flex items-center justify-between">
      
      {/* Left side */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <svg
              className="size-6"
              fill="currentColor"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" />
            </svg>
          </div>

          <h1 className="text-lg font-bold tracking-tight">
            ServiHaus Finance
          </h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a className="text-sm font-semibold border-b-2 border-primary text-primary pb-1">
            Audit Dashboard
          </a>
          <a className="text-sm font-medium text-[#617589] hover:text-[#111418] dark:hover:text-white transition-colors">
            Ledger History
          </a>
          <a className="text-sm font-medium text-[#617589] hover:text-[#111418] dark:hover:text-white transition-colors">
            Reconciliation
          </a>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <span className="material-symbols-outlined text-[20px]">
              notifications
            </span>
          </button>

          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
          </button>
        </div>

        {/* Avatar */}
        <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
          <img
            className="w-full h-full object-cover"
            alt="Finance user avatar"
            src=""
          />
        </div>
      </div>
    </header>
  );
}
