"use client"

import { useEffect, useMemo, useState } from "react"
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
  openServiceId?: string | null
  onServiceOpenedFromUrl?: () => void
}

export default function WeeklyCalendar({
  days,
  servicesByDay,
  openServiceId = null,
  onServiceOpenedFromUrl,
}: WeeklyCalendarProps) {
  const [currentTop, setCurrentTop] = useState<number | null>(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null
  )
  const [openDetails, setOpenDetails] = useState(false)
  const [handledUrlServiceId, setHandledUrlServiceId] = useState<string | null>(
    null
  )

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i)
  const totalHeight = TOTAL_HOURS * HOUR_HEIGHT
  const weekNumber = days.length > 0 ? getISOWeek(new Date(days[0].iso)) : null

  const allServices = useMemo(() => {
    return Object.values(servicesByDay).flat()
  }, [servicesByDay])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-600"
      case "in_progress":
        return "bg-amber-500"
      case "completed":
        return "bg-emerald-600"
      case "cancelled":
        return "bg-rose-600"
      default:
        return "bg-slate-500"
    }
  }

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
        (hour - START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT

      setCurrentTop(top)
    }

    updateLine()

    const interval = setInterval(updateLine, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!openServiceId) return
    if (handledUrlServiceId === openServiceId) return
    if (allServices.length === 0) return

    const serviceToOpen = allServices.find(
      (service) => String(service.id) === String(openServiceId)
    )

    if (!serviceToOpen) return

    setSelectedService(serviceToOpen)
    setOpenDetails(true)
    setHandledUrlServiceId(openServiceId)
    onServiceOpenedFromUrl?.()
  }, [openServiceId, handledUrlServiceId, allServices, onServiceOpenedFromUrl])

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {/* Cabecera KW + días */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex h-16 items-center justify-center border-r dark:border-slate-800">
            {weekNumber && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                  KW
                </span>
                <span className="text-xl font-black text-blue-600">
                  {weekNumber}
                </span>
              </div>
            )}
          </div>

          {days.map((day) => (
            <div
              key={day.iso}
              className="flex h-16 flex-col items-center justify-center border-r last:border-r-0 dark:border-slate-800"
            >
              <span className="text-xs font-bold uppercase tracking-tight text-slate-500">
                {day.label}
              </span>

              <span
                className={`text-sm font-black ${
                  day.isToday
                    ? "text-blue-600"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {day.date}
              </span>
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Columna horas */}
          <div className="w-20 border-r bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
            {hours.map((h) => (
              <div
                key={h}
                style={{ height: HOUR_HEIGHT }}
                className="border-b pr-3 pt-2 text-right text-[10px] font-bold uppercase text-slate-400 dark:border-slate-800/50"
              >
                {h}:00
              </div>
            ))}
          </div>

          {/* Grid semanal */}
          <div
            className="relative grid flex-1 grid-cols-7"
            style={{ height: totalHeight }}
          >
            {days.map((day) => (
              <div
                key={day.iso}
                className="relative cursor-pointer border-r transition-colors last:border-r-0 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/20"
                style={{ height: totalHeight }}
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  const offsetY = event.clientY - rect.top
                  const hourFloat = offsetY / HOUR_HEIGHT
                  const hour = Math.floor(hourFloat) + START_HOUR
                  const minutes = Math.floor((hourFloat % 1) * 60)

                  setSelectedDate(day.iso)
                  setSelectedTime(
                    `${hour.toString().padStart(2, "0")}:${minutes
                      .toString()
                      .padStart(2, "0")}`
                  )
                  setOpenCreate(true)
                }}
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    style={{ height: HOUR_HEIGHT }}
                    className="border-b dark:border-slate-800/50"
                  />
                ))}

                {servicesByDay[day.iso]?.map((service, _, allServicesDay) => {
                  let displayHour: number
                  let displayMinutes: number

                  if (service.actualStartTime) {
                    const actualDate = new Date(service.actualStartTime)
                    displayHour = actualDate.getHours()
                    displayMinutes = actualDate.getMinutes()
                  } else {
                    const [h, m] = service.time.split(":")
                    displayHour = parseInt(h)
                    displayMinutes = parseInt(m)
                  }

                  const top =
                    (displayHour - START_HOUR) * HOUR_HEIGHT +
                    (displayMinutes / 60) * HOUR_HEIGHT

                  const blockDuration =
                    service.teamDuration ?? service.duration ?? 1

                  const durationHours = parseFloat(blockDuration as any)
                  const height = durationHours * HOUR_HEIGHT

                  const currentStartTotal = displayHour * 60 + displayMinutes
                  const currentEndTotal =
                    currentStartTotal + durationHours * 60

                  const overlapping = allServicesDay.filter((other) => {
                    let otherHour: number
                    let otherMinutes: number

                    if (other.actualStartTime) {
                      const date = new Date(other.actualStartTime)
                      otherHour = date.getHours()
                      otherMinutes = date.getMinutes()
                    } else {
                      const [h, m] = other.time.split(":")
                      otherHour = parseInt(h)
                      otherMinutes = parseInt(m)
                    }

                    const otherDuration =
                      other.teamDuration ?? other.duration ?? 1

                    const otherStart = otherHour * 60 + otherMinutes
                    const otherEnd =
                      otherStart + parseFloat(otherDuration as any) * 60

                    return (
                      currentStartTotal < otherEnd &&
                      currentEndTotal > otherStart
                    )
                  })

                  const overlapIndex = overlapping.findIndex(
                    (item) => item.id === service.id
                  )

                  const width = 100 / overlapping.length
                  const left = overlapIndex * width

                  return (
                    <div
                      key={service.id}
                      className={`absolute z-10 rounded-xl border border-white/10 p-2.5 text-[10px] text-white shadow-lg transition-all hover:z-30 hover:scale-[1.02] ${getStatusColor(
                        service.status
                      )}`}
                      style={{
                        top,
                        height,
                        width: `calc(${width}% - 6px)`,
                        left: `calc(${left}% + 3px)`,
                      }}
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedService(service)
                        setOpenDetails(true)
                      }}
                    >
                      <div className="flex h-full flex-col justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs font-black leading-tight">
                            {service.actualStartTime && (
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                            )}
                            {service.serviceCode?.code}
                          </div>

                          <div className="truncate font-medium opacity-90">
                            {service.client?.name}
                          </div>

                          <div className="truncate italic opacity-75">
                            {service.address}
                          </div>
                        </div>

                        {height > 40 && (
                          <div className="mt-auto flex -space-x-2">
                            {service.assignments?.slice(0, 3).map((a, i) => (
                              <div
                                key={i}
                                className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-white/20 text-[8px] font-bold backdrop-blur-sm"
                                title={a.employee.firstName}
                              >
                                {a.employee.firstName[0]}
                              </div>
                            ))}

                            {(service.assignments?.length ?? 0) > 3 && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-black/20 text-[8px] font-bold">
                                +{(service.assignments?.length ?? 0) - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}

            {currentTop !== null && (
              <div
                className="pointer-events-none absolute left-0 right-0 z-20 h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                style={{ top: currentTop }}
              >
                <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
              </div>
            )}
          </div>
        </div>
      </div>

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