import { addWeeks, startOfWeek, addDays, format, isToday } from "date-fns";

export function useWeek(current: Date) {
  const start = startOfWeek(current, { weekStartsOn: 1 });

  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(start, i);

    return {
      label: format(date, "EEE"),
      date: format(date, "dd"),
      iso: format(date, "yyyy-MM-dd"),
      fullDate: date, //importante para lógica futura
      isToday: isToday(date), //  clave
    };
  });

  return { start, days };
}

export function shiftWeek(date: Date, direction: "prev" | "next") {
  return direction === "prev"
    ? addWeeks(date, -1)
    : addWeeks(date, 1);
}
