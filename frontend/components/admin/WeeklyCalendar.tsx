"use client"

import { useEffect, useState } from "react"
import { getISOWeek } from "date-fns"
import CreateServiceModal from "@/components/admin/CreateServiceModal"
import ServiceDetailsModal from "@/components/admin/ServiceDetailsModal"
import { ServiceType } from "@/types/service"

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
  const [selectedService, setSelectedService] =
    useState<ServiceType | null>(null)
  const [openDetails, setOpenDetails] = useState(false)

  const hours = Array.from(
    { length: TOTAL_HOURS },
    (_, i) => START_HOUR + i
  )

  const totalHeight = TOTAL_HOURS * HOUR_HEIGHT

  const weekNumber =
    days.length > 0
      ? getISOWeek(new Date(days[0].iso))
      : null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-600"
      case "in_progress":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-600"
      case "cancelled":
        return "bg-red-600"
      default:
        return "bg-gray-500"
    }
  }

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

  return (
    <>
      <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900">

        {/* Cabecera KW + días */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-slate-50 dark:bg-slate-800">
          <div className="h-16 flex items-center justify-center border-r">
            {weekNumber && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase text-gray-500">
                  KW
                </span>
                <span className="text-lg font-black text-primary">
                  {weekNumber}
                </span>
              </div>
            )}
          </div>

          {days.map((day) => (
            <div
              key={day.iso}
              className="h-16 flex flex-col items-center justify-center border-r last:border-r-0"
            >
              <span className="text-xs font-semibold">
                {day.label}
              </span>
              <span className="text-sm font-bold">
                {day.date}
              </span>
            </div>
          ))}
        </div>

        <div className="flex">

          {/* Columna horas */}
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
                {hours.map((h) => (
                  <div
                    key={h}
                    style={{ height: HOUR_HEIGHT }}
                    className="border-b"
                  />
                ))}

                {servicesByDay[day.iso]?.map(
                  (service, _, allServices) => {
                    const [hourStr, minuteStr] =
                      service.time.split(":")
                    const startHour = parseInt(hourStr)
                    const startMinutes = parseInt(minuteStr)

                    const top =
                      (startHour - START_HOUR) *
                      HOUR_HEIGHT +
                      (startMinutes / 60) *
                      HOUR_HEIGHT

                    const durationHours = service.duration
                      ? parseFloat(service.duration)
                      : 1

                    const height =
                      durationHours * HOUR_HEIGHT

                    // Detectar solapamientos
                    const overlapping =
                      allServices.filter((other) => {
                        const [oh, om] =
                          other.time.split(":")
                        const otherStart =
                          parseInt(oh) * 60 +
                          parseInt(om)
                        const otherEnd =
                          otherStart +
                          (other.duration
                            ? parseFloat(
                              other.duration
                            )
                            : 1) *
                          60

                        const currentStart =
                          startHour * 60 +
                          startMinutes
                        const currentEnd =
                          currentStart +
                          durationHours * 60

                        return (
                          currentStart < otherEnd &&
                          currentEnd > otherStart
                        )
                      })

                    const overlapIndex =
                      overlapping.findIndex(
                        (s) =>
                          s.id === service.id
                      )

                    const width =
                      100 / overlapping.length
                    const left =
                      overlapIndex * width

                    return (
                      <div
                        key={service.id}
                        className={`absolute text-white rounded-lg p-2 text-xs shadow z-10 hover:scale-[1.02] transition ${getStatusColor(service.status)}`}
                        style={{
                          top,
                          height,
                          width: `calc(${width}% - 4px)`,
                          left: `calc(${left}% + 2px)`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedService(
                            service
                          )
                          setOpenDetails(true)
                        }}
                      >
                        <div className="font-bold truncate">
                          {service.serviceCode?.code}
                        </div>

                        <div className="truncate text-[11px] opacity-90">
                          {service.serviceCode?.description}
                        </div>

                        <div className="truncate text-[11px] opacity-90">
                          {service.address}
                        </div>

                        {service.assignments &&
                          service.assignments
                            .length > 0 && (
                            <div className="mt-1 text-[10px] opacity-95">
                              {service.assignments.map(
                                (a, i) => (
                                  <div
                                    key={i}
                                    className="truncate"
                                  >
                                    {
                                      a.employee
                                        .firstName
                                    }{" "}
                                    {
                                      a.employee
                                        .lastName
                                    }
                                  </div>
                                )
                              )}
                            </div>
                          )}

                        {service.importantNotes && (
                          <div className="mt-1 text-[10px] font-semibold text-yellow-200 truncate">
                            {service.importantNotes}
                          </div>
                        )}
                      </div>
                    )
                  }
                )}
              </div>
            ))}

            {currentTop !== null && (
              <div
                className="absolute left-0 right-0 h-[2px] bg-red-500 z-20"
                style={{ top: currentTop }}
              />
            )}
          </div>
        </div>
      </div>

      {openCreate &&
        selectedDate &&
        selectedTime && (
          <CreateServiceModal
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onClose={() =>
              setOpenCreate(false)
            }
            onCreated={() => {
              setOpenCreate(false)
              location.reload()
            }}
          />
        )}

      {openDetails && selectedService && (
        <ServiceDetailsModal
          service={selectedService}
          onClose={() =>
            setOpenDetails(false)
          }
          onUpdated={() => {
            setOpenDetails(false)
            location.reload()
          }}
        />
      )}
    </>
  )
}