"use client";

import { useState } from "react";
import AdminCalendarTopbar from "@/components/admin/AdminCalendarTopbar";
import DayHeader from "@/components/admin/DayHeader";
import DayColumn from "@/components/admin/DayColumn";
import { useWeek } from "@/hooks/useWeek";

export default function AdminCalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { days } = useWeek(currentWeek);

  return (
    <>
      <AdminCalendarTopbar
        currentWeek={currentWeek}
        onChange={setCurrentWeek}
      />

      <div className="flex-1 overflow-auto p-6">
        <DayHeader
          days={days.map((d, i) => ({
            label: d.label,
            date: Number(d.date),
            active: i === 0,
          }))}
        />

        <div className="grid grid-cols-7 gap-4 min-h-[800px]">
          {days.map((d) => (
            <DayColumn key={d.iso} />
          ))}
        </div>
      </div>
    </>
  );
}
