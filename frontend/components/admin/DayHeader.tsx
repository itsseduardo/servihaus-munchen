interface Day {
  label: string; // Mon, Tue…
  date: number;  // 12, 13…
  active?: boolean;
}

export default function DayHeader({ days }: { days: Day[] }) {
  return (
    <div className="grid grid-cols-7 gap-4 mb-4">
      {days.map((day) => (
        <div
          key={day.label}
          className={`text-center py-2 border-b-2 ${
            day.active
              ? "border-primary text-primary"
              : "border-transparent text-[#617589]"
          }`}
        >
          <p className="text-xs font-bold uppercase">
            {day.label} {day.date}
          </p>
        </div>
      ))}
    </div>
  );
}
