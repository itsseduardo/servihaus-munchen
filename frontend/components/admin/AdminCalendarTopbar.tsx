import { format, startOfWeek, endOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function AdminCalendarTopbar({
  currentWeek,
  onChange,
}: {
  currentWeek: Date
  onChange: (d: Date) => void
}) {

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })

  const goPrevious = () => {
    const prev = new Date(weekStart.getTime() - 7 * 86400000)
    onChange(prev)
  }

  const goNext = () => {
    const next = new Date(weekStart.getTime() + 7 * 86400000)
    onChange(next)
  }

  return (
    <header className="h-16 flex items-center justify-between border-b bg-white dark:bg-background-dark px-6">

      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold">Weekly Schedule</h2>

        <div className="flex items-center gap-4">

          {/* Flecha izquierda */}
          <button
            onClick={goPrevious}
            className="w-9 h-9 flex items-center justify-center rounded-lg border hover:bg-slate-100 transition"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Rango */}
          <span className="text-sm font-semibold">
            {format(weekStart, "MMM dd")} –{" "}
            {format(weekEnd, "MMM dd, yyyy")}
          </span>

          {/* Flecha derecha */}
          <button
            onClick={goNext}
            className="w-9 h-9 flex items-center justify-center rounded-lg border hover:bg-slate-100 transition"
          >
            <ChevronRight size={18} />
          </button>

        </div>
      </div>
    </header>
  )
}