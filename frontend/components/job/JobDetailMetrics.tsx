export default function JobDetailMetrics() {
  return (
    <div className="grid grid-cols-2 divide-x divide-[#dbe0e6] dark:divide-gray-800 border-b border-[#dbe0e6] dark:border-gray-800">
      {/* Duration */}
      <div className="p-4 flex flex-col items-center justify-center text-center">
        <p className="text-[#617589] dark:text-gray-400 text-xs font-medium uppercase tracking-tighter">
          Duration
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: 18 }}
          >
            schedule
          </span>
          <p className="text-[#111418] dark:text-white text-base font-bold">
            4.5 hours
          </p>
        </div>
      </div>

      {/* Scheduled for */}
      <div className="p-4 flex flex-col items-center justify-center text-center">
        <p className="text-[#617589] dark:text-gray-400 text-xs font-medium uppercase tracking-tighter">
          Scheduled For
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: 18 }}
          >
            calendar_today
          </span>
          <p className="text-[#111418] dark:text-white text-base font-bold">
            Oct 24, 09:00 AM
          </p>
        </div>
      </div>
    </div>
  );
}
