import { format, endOfWeek } from "date-fns";

export default function AdminCalendarTopbar({
  currentWeek,
  onChange,
}: {
  currentWeek: Date;
  onChange: (d: Date) => void;
}) {
  return (
    <header className="h-16 flex items-center justify-between border-b bg-white dark:bg-background-dark px-6">
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold">Weekly Schedule</h2>

        <div className="flex items-center gap-2">
          <button onClick={() => onChange(new Date(currentWeek.getTime() - 7 * 86400000))}>
            ◀
          </button>

          <span className="text-sm font-bold">
            {format(currentWeek, "MMM dd")} –{" "}
            {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "MMM dd, yyyy")}
          </span>

          <button onClick={() => onChange(new Date(currentWeek.getTime() + 7 * 86400000))}>
            ▶
          </button>
        </div>
      </div>
    </header>
  );
}
