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

export default function WeeklyCalendar({ days, servicesByDay }: WeeklyCalendarProps) {
  const [currentTop, setCurrentTop] = useState<number | null>(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null)
  const [openDetails, setOpenDetails] = useState(false)

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i)
  const totalHeight = TOTAL_HOURS * HOUR_HEIGHT
  const weekNumber = days.length > 0 ? getISOWeek(new Date(days[0].iso)) : null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned": return "bg-blue-600"
      case "in_progress": return "bg-amber-500" // Cambiado a ámbar según tu diseño de modal
      case "completed": return "bg-emerald-600"
      case "cancelled": return "bg-rose-600"
      default: return "bg-slate-500"
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
      const top = (hour - START_HOUR) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT
      setCurrentTop(top)
    }
    updateLine()
    const interval = setInterval(updateLine, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm border-slate-200 dark:border-slate-800">
        {/* Cabecera KW + días */}
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="h-16 flex items-center justify-center border-r dark:border-slate-800">
            {weekNumber && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tighter">KW</span>
                <span className="text-xl font-black text-blue-600">{weekNumber}</span>
              </div>
            )}
          </div>
          {days.map((day) => (
            <div key={day.iso} className="h-16 flex flex-col items-center justify-center border-r dark:border-slate-800 last:border-r-0">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{day.label}</span>
              <span className={`text-sm font-black ${day.isToday ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>{day.date}</span>
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Columna horas */}
          <div className="w-20 border-r dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            {hours.map((h) => (
              <div key={h} style={{ height: HOUR_HEIGHT }} className="text-[10px] font-bold text-right pr-3 pt-2 text-slate-400 border-b dark:border-slate-800/50 uppercase">
                {h}:00
              </div>
            ))}
          </div>

          {/* Grid semanal */}
          <div className="grid grid-cols-7 flex-1 relative" style={{ height: totalHeight }}>
            {days.map((day) => (
              <div
                key={day.iso}
                className="relative border-r dark:border-slate-800 last:border-r-0 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                style={{ height: totalHeight }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const offsetY = e.clientY - rect.top
                  const hourFloat = offsetY / HOUR_HEIGHT
                  const hour = Math.floor(hourFloat) + START_HOUR
                  const minutes = Math.floor((hourFloat % 1) * 60)
                  setSelectedDate(day.iso)
                  setSelectedTime(`${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`)
                  setOpenCreate(true)
                }}
              >
                {hours.map((h) => (
                  <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b dark:border-slate-800/50" />
                ))}

                {servicesByDay[day.iso]?.map((service, _, allServices) => {
                  
                  // 🔥 MEJORA DE JOSÉ: REUBICACIÓN POR HORA REAL
                  // Si tiene actualStartTime, usamos esa hora para posicionar el bloque
                  let displayHour: number, displayMinutes: number;
                  
                  if (service.actualStartTime) {
                    const actualDate = new Date(service.actualStartTime);
                    displayHour = actualDate.getHours();
                    displayMinutes = actualDate.getMinutes();
                  } else {
                    const [h, m] = service.time.split(":");
                    displayHour = parseInt(h);
                    displayMinutes = parseInt(m);
                  }

                  const top = (displayHour - START_HOUR) * HOUR_HEIGHT + (displayMinutes / 60) * HOUR_HEIGHT;

                  // 🔥 MEJORA DE JOSÉ: DURACIÓN BASADA EN EQUIPO (Ocupación real de la casa)
                  const blockDuration = service.teamDuration ?? service.duration ?? 1;
                  const durationHours = parseFloat(blockDuration as any);
                  const height = durationHours * HOUR_HEIGHT;

                  // Lógica de solapamientos (ahora basada en la hora de visualización)
                  const currentStartTotal = displayHour * 60 + displayMinutes;
                  const currentEndTotal = currentStartTotal + (durationHours * 60);

                  const overlapping = allServices.filter((other) => {
                    let oh, om, od;
                    if (other.actualStartTime) {
                      const d = new Date(other.actualStartTime);
                      oh = d.getHours(); om = d.getMinutes();
                    } else {
                      const [h, m] = other.time.split(":");
                      oh = parseInt(h); om = parseInt(m);
                    }
                    od = other.teamDuration ?? other.duration ?? 1;
                    const oStart = oh * 60 + om;
                    const oEnd = oStart + (parseFloat(od as any) * 60);
                    return currentStartTotal < oEnd && currentEndTotal > oStart;
                  });

                  const overlapIndex = overlapping.findIndex((s) => s.id === service.id);
                  const width = 100 / overlapping.length;
                  const left = overlapIndex * width;

                  return (
                    <div
                      key={service.id}
                      className={`absolute text-white rounded-xl p-2.5 text-[10px] shadow-lg z-10 hover:scale-[1.02] hover:z-30 transition-all border border-white/10 ${getStatusColor(service.status)}`}
                      style={{
                        top,
                        height,
                        width: `calc(${width}% - 6px)`,
                        left: `calc(${left}% + 3px)`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedService(service)
                        setOpenDetails(true)
                      }}
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div className="space-y-0.5">
                          <div className="font-black text-xs leading-tight flex items-center gap-1">
                            {service.actualStartTime && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                            {service.serviceCode?.code}
                          </div>
                          <div className="font-medium opacity-90 truncate">{service.client?.name}</div>
                          <div className="opacity-75 truncate italic">{service.address}</div>
                        </div>

                        {height > 40 && (
                          <div className="flex -space-x-2 mt-auto">
                            {service.assignments?.slice(0, 3).map((a, i) => (
                              <div key={i} className="w-5 h-5 rounded-full border border-white/20 bg-white/20 flex items-center justify-center text-[8px] font-bold backdrop-blur-sm" title={a.employee.firstName}>
                                {a.employee.firstName[0]}
                              </div>
                            ))}
                            {(service.assignments?.length ?? 0) > 3 && (
                              <div className="w-5 h-5 rounded-full border border-white/20 bg-black/20 flex items-center justify-center text-[8px] font-bold">
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
              <div className="absolute left-0 right-0 h-[2px] bg-red-500 z-20 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ top: currentTop }}>
                <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              </div>
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