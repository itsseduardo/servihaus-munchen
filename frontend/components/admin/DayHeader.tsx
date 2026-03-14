interface Day {
  label: string; // Mon, Tue…
  date: number;  // 12, 13…
  active?: boolean;
}

export default function DayHeader({ days }: { days: any[] }) {
  return (
    <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-white dark:bg-slate-900">

      {/* Columna vacía para alinear con horas */}
      <div />

      {days.map((day, i) => (
        <div
          key={i}
          className="text-center py-3 font-semibold border-r last:border-r-0"
        >
          <div>{day.label}</div>
          <div className="text-sm text-gray-500">{day.date}</div>
        </div>
      ))}
    </div>
  )
}