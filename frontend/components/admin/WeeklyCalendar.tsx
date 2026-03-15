"use client"

import { useEffect, useState } from "react"
import CreateServiceModal from "@/components/admin/CreateServiceModal"
import ServiceDetailsModal from "@/components/admin/ServiceDetailsModal"

const START_HOUR = 6
const END_HOUR = 22
const HOUR_HEIGHT = 80
const TOTAL_HOURS = END_HOUR - START_HOUR

type DayType = {
  iso: string
  label: string
  date: string | number
  isToday: boolean
}

type ServiceType = {
  id: number
  code: string
  date: string
  time: string
  duration?: string
  address: string
  notes?: string
  requiresKey?: boolean
}

type WeeklyCalendarProps = {
  days: DayType[]
  servicesByDay: Record<string, ServiceType[]>
}

export default function WeeklyCalendar({
  days,
  servicesByDay,
}: WeeklyCalendarProps) {
  const [currentTop, setCurrentTop] = useState<number | null>(null)

  const [openCreate, setOpenCreate] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const [selectedService, setSelectedService] = useState<ServiceType | null>(null)
  const [openDetails, setOpenDetails] = useState(false)

  // Línea roja hora actual
  useEffect(() => {
    const updateLine = () => {
      const now = new Date()
      const hour = now.getHours()
      const minutes = now.getMinutes()

      if (hour < START_HOUR || hour >= END_HOUR) {
        setCurrentTop(null)
        return
      }

      const top =
        (hour - START_HOUR) * HOUR_HEIGHT +
        (minutes / 60) * HOUR_HEIGHT

      setCurrentTop(top)
    }

    updateLine()
    const interval = setInterval(updateLine, 60000)
    return () => clearInterval(interval)
  }, [])

  const hours = Array.from(
    { length: TOTAL_HOURS },
    (_, i) => START_HOUR + i
  )

  const totalHeight = TOTAL_HOURS * HOUR_HEIGHT

  return (
    <>
      <div className="flex border rounded-xl overflow-hidden bg-white dark:bg-slate-900">

        {/* Columna izquierda - horas */}
        <div className="w-20 border-r bg-slate-50 dark:bg-slate-800">
          {hours.map((h) => (
            <div
              key={h}
              style={{ height: HOUR_HEIGHT }}
              className="text-xs text-right pr-2 pt-1 text-gray-500 border-b"
            >
              {h}:00
            </div>
          ))}
        </div>

        {/* Grid semanal */}
        <div
          className="grid grid-cols-7 flex-1 relative"
          style={{ height: totalHeight }}
        >
          {days.map((day) => (
            <div
              key={day.iso}
              className="relative border-r last:border-r-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              style={{ height: totalHeight }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const offsetY = e.clientY - rect.top

                const hourFloat = offsetY / HOUR_HEIGHT
                const hour = Math.floor(hourFloat) + START_HOUR
                const minutes = Math.floor((hourFloat % 1) * 60)

                const formattedTime = `${hour
                  .toString()
                  .padStart(2, "0")}:${minutes
                  .toString()
                  .padStart(2, "0")}`

                setSelectedDate(day.iso)
                setSelectedTime(formattedTime)
                setOpenCreate(true)
              }}
            >
              {/* Líneas horizontales */}
              {hours.map((h) => (
                <div
                  key={h}
                  style={{ height: HOUR_HEIGHT }}
                  className="border-b"
                />
              ))}

              {/* Servicios */}
              {servicesByDay[day.iso]?.map((service) => {
                const [hourStr, minuteStr] = service.time.split(":")
                const startHour = parseInt(hourStr)
                const startMinutes = parseInt(minuteStr)

                const top =
                  (startHour - START_HOUR) * HOUR_HEIGHT +
                  (startMinutes / 60) * HOUR_HEIGHT

                const durationHours = service.duration
                  ? parseFloat(service.duration)
                  : 1

                const height = durationHours * HOUR_HEIGHT

                return (
                  <div
                    key={service.id}
                    className="absolute left-1 right-1 bg-primary text-white rounded-lg p-2 text-xs shadow z-10 hover:scale-[1.02] transition"
                    style={{ top, height }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedService(service)
                      setOpenDetails(true)
                    }}
                  >
                    <div className="font-bold">{service.code}</div>
                    <div>{service.address}</div>
                    <div className="text-[10px] opacity-80">
                      {service.time}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Línea roja */}
          {currentTop !== null && (
            <div
              className="absolute left-0 right-0 h-[2px] bg-red-500 z-20"
              style={{ top: currentTop }}
            />
          )}
        </div>
      </div>

      {/* Modal crear */}
      {openCreate && selectedDate && selectedTime && (
        <CreateServiceModal
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onClose={() => setOpenCreate(false)}
          onCreated={() => {
            setOpenCreate(false)
            location.reload()
          }}
        />
      )}

      {/* Modal detalles */}
      {openDetails && selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={() => setOpenDetails(false)}
          onUpdated={() => {
            setOpenDetails(false)
            location.reload()
          }}
        />
      )}
    </>
  )
}