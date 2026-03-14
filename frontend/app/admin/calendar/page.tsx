"use client"

import { useState, useEffect } from "react"
import AdminCalendarTopbar from "@/components/admin/AdminCalendarTopbar"
import DayHeader from "@/components/admin/DayHeader"
import WeeklyCalendar from "@/components/admin/WeeklyCalendar"
import { useWeek } from "@/hooks/useWeek"

type ServiceType = {
  id: number
  code: string
  date: string
  time: string
  duration?: string
  address: string
}

export default function AdminCalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [services, setServices] = useState<ServiceType[]>([])

  const { days } = useWeek(currentWeek)

  // FETCH SERVICIOS DE LA SEMANA
  useEffect(() => {
    async function fetchServices() {
      try {
        const results = await Promise.all(
          days.map((day) =>
            fetch(`/api/services?date=${day.iso}`).then((res) =>
              res.json()
            )
          )
        )

        const merged: ServiceType[] = results.flat()
        setServices(merged)
      } catch (error) {
        console.error("Error loading services:", error)
        setServices([])
      }
    }

    if (days.length > 0) {
      fetchServices()
    }
  }, [currentWeek]) // SOLO depende de currentWeek

  // AGRUPAR POR DIA ISO
  const servicesByDay = days.reduce((acc, day) => {
    acc[day.iso] = services.filter((service) =>
      new Date(service.date).toISOString().startsWith(day.iso)
    )
    return acc
  }, {} as Record<string, ServiceType[]>)

  return (
    <>
      <AdminCalendarTopbar
        currentWeek={currentWeek}
        onChange={setCurrentWeek}
      />

      <div className="flex-1 overflow-auto p-6">
        <DayHeader
          days={days.map((d) => ({
            label: d.label,
            date: Number(d.date),
            active: d.isToday,
          }))}
        />

        <div className="mt-4">
          <WeeklyCalendar
            days={days}
            servicesByDay={servicesByDay}
          />
        </div>
      </div>
    </>
  )
}