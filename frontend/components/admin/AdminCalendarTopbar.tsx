export default function AdminCalendarTopbar() {
  return (
    <header className="h-16 flex items-center justify-between border-b border-[#dbe0e6] dark:border-gray-800 bg-white dark:bg-background-dark px-6">
      {/* Left */}
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold tracking-tight">
          Weekly Schedule
        </h2>

        <div className="flex items-center gap-2">
          <button className="p-1 rounded hover:bg-[#f0f2f4] dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <span className="text-sm font-bold">
            Oct 12 – 18, 2023
          </span>

          <button className="p-1 rounded hover:bg-[#f0f2f4] dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <FilterButton label="All Employees" />
          <FilterButton label="Service Type" />
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        <button className="size-10 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
    </header>
  );
}

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex h-10 items-center gap-2 rounded-lg bg-[#f0f2f4] dark:bg-gray-800 px-4 hover:border-gray-300 transition-all">
      <span className="text-sm font-medium">{label}</span>
      <span className="material-symbols-outlined text-[18px]">
        keyboard_arrow_down
      </span>
    </button>
  );
}
