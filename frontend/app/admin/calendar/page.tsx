"use client"

import { useState, useEffect } from "react"
import AdminCalendarTopbar from "@/components/admin/AdminCalendarTopbar"
import WeeklyCalendar from "@/components/admin/WeeklyCalendar"
import { useWeek } from "@/hooks/useWeek"
import { ServiceType } from "@/types/service"

export default function AdminCalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [services, setServices] = useState<ServiceType[]>([])

  const { days } = useWeek(currentWeek)

  // Fetch servicios por cada día de la semana
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
  }, [currentWeek])

  // Agrupar servicios por día ISO
  const servicesByDay: Record<string, ServiceType[]> =
    days.reduce((acc, day) => {
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
        <WeeklyCalendar
          days={days}
          servicesByDay={servicesByDay}
        />
      </div>
    </>
  )
}