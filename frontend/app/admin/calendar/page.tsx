"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import AdminCalendarTopbar from "@/components/admin/AdminCalendarTopbar"
import WeeklyCalendar from "@/components/admin/WeeklyCalendar"
import { useWeek } from "@/hooks/useWeek"
import { ServiceType } from "@/types/service"

export default function AdminCalendarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const serviceIdFromUrl = searchParams.get("serviceId")

  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [services, setServices] = useState<ServiceType[]>([])
  const [openServiceId, setOpenServiceId] = useState<string | null>(
    serviceIdFromUrl
  )

  const { days } = useWeek(currentWeek)

  useEffect(() => {
    setOpenServiceId(serviceIdFromUrl)
  }, [serviceIdFromUrl])

  useEffect(() => {
    async function fetchServices() {
      if (!days.length) return

      try {
        const results = await Promise.all(
          days.map((day) =>
            fetch(`/api/services?date=${day.iso}`, {
              cache: "no-store",
            }).then((res) => res.json())
          )
        )

        const merged: ServiceType[] = results.flat()
        setServices(merged)
      } catch (error) {
        console.error("Error loading services:", error)
        setServices([])
      }
    }

    fetchServices()
    // Importante: NO usar "days" como dependencia.
    // days puede ser un array nuevo en cada render y causar llamadas repetidas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek])

  const servicesByDay: Record<string, ServiceType[]> = useMemo(() => {
    return days.reduce((acc, day) => {
      acc[day.iso] = services.filter((service) =>
        new Date(service.date).toISOString().startsWith(day.iso)
      )

      return acc
    }, {} as Record<string, ServiceType[]>)
  }, [days, services])

  function handleServiceOpenedFromUrl() {
    if (!serviceIdFromUrl) return

    const params = new URLSearchParams(searchParams.toString())
    params.delete("serviceId")

    router.replace(
      params.toString()
        ? `/admin/calendar?${params.toString()}`
        : "/admin/calendar"
    )
  }

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
          openServiceId={openServiceId}
          onServiceOpenedFromUrl={handleServiceOpenedFromUrl}
        />
      </div>
    </>
  )
}