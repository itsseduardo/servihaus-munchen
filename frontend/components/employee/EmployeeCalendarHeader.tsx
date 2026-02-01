export default function EmployeeCalendarHeader() {
  return (
    <header className="bg-white border-b border-slate-200 px-10 py-8">
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Today&apos;s Agenda
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Monday, October 23, 2023
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Day navigation */}
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <button className="material-symbols-outlined text-slate-600 hover:text-primary">
              chevron_left
            </button>
            <span className="text-sm font-bold px-2">Oct 23</span>
            <button className="material-symbols-outlined text-slate-600 hover:text-primary">
              chevron_right
            </button>
          </div>

          {/* Sync */}
          <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-lg">sync</span>
            Sync Calendar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 mt-8">
        <Stat label="Total Jobs" value="5" />
        <Divider />
        <Stat label="Remaining" value="3" highlight />
        <Divider />
        <Stat label="Est. Duration" value="7.5h" />
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </span>
      <span
        className={`text-2xl font-black ${
          highlight ? "text-primary" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-10 bg-slate-200 self-center" />;
}
