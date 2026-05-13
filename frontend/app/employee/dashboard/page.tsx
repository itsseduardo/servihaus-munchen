"use client"

import { useEffect, useState } from "react"

import TaskCard from "@/components/employee/TaskCard"
import OvertimeModal from "@/components/employee/OvertimeModal"
import BottomNav from "@/components/employee/BottomNav"
import MaterialModal from "@/components/employee/MaterialModal"
import TimeTracker from "@/components/employee/TimeTracker"
import ServiceInfoModal from "@/components/employee/ServiceInfoModal"
import ProfileTab from "@/components/employee/ProfileTab"

type EmployeeProfile = {
  id: number
  firstName: string
  lastName: string
  fullName?: string
  isActive?: boolean
  active?: boolean
  inactiveReason?: string | null
  inactiveDetails?: string | null
  inactiveSince?: string | null
  inactiveUntil?: string | null
}

type DateFilter = "today" | "tomorrow" | "month" | "history"

function getInactiveReasonLabel(reason?: string | null) {
  switch (reason) {
    case "SICK_LEAVE":
      return "Krankmeldung"
    case "MEDICAL_LEAVE":
      return "Medizinische Abwesenheit"
    case "TERMINATED":
      return "Kündigung / Entlassung"
    case "SUSPENDED":
      return "Suspendiert"
    case "VACATION":
      return "Urlaub / Freistellung"
    case "UNPAID_VACATION":
      return "Unbezahlter Urlaub"
    case "OTHER":
      return "Sonstiges"
    default:
      return "Nicht angegeben"
  }
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) return null

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function isEmployeeInactiveOnDate(
  employee: EmployeeProfile | null,
  dateValue: Date = new Date()
) {
  if (!employee) return false

  const isMarkedInactive =
    employee.isActive === false || employee.active === false

  if (!isMarkedInactive) return false

  const targetDate = startOfDay(dateValue)

  const inactiveSince = employee.inactiveSince
    ? startOfDay(new Date(employee.inactiveSince))
    : null

  const inactiveUntil = employee.inactiveUntil
    ? endOfDay(new Date(employee.inactiveUntil))
    : null

  if (inactiveSince && targetDate < inactiveSince) {
    return false
  }

  if (inactiveUntil && targetDate > inactiveUntil) {
    return false
  }

  return true
}

function InactiveEmployeeBanner({
  employee,
}: {
  employee: EmployeeProfile
}) {
  return (
    <div className="mt-6 rounded-[2rem] border border-rose-100 bg-rose-50 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
          <span className="material-symbols-outlined">lock_person</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-500">
            Konto vorübergehend inaktiv
          </p>

          <h2 className="mt-2 text-xl font-black text-rose-950">
            {getInactiveReasonLabel(employee.inactiveReason)}
          </h2>

          <p className="mt-2 text-sm font-bold leading-6 text-rose-700">
            Während dieser Zeit kannst du deine geplanten Aufgaben ansehen, aber
            keine Schicht starten oder Aufgaben bearbeiten.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {employee.inactiveSince && (
              <div className="rounded-2xl bg-white/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-400">
                  Seit
                </p>

                <p className="mt-1 text-sm font-black text-rose-900">
                  {formatDate(employee.inactiveSince)}
                </p>
              </div>
            )}

            {employee.inactiveUntil && (
              <div className="rounded-2xl bg-white/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-400">
                  Voraussichtlich bis
                </p>

                <p className="mt-1 text-sm font-black text-rose-900">
                  {formatDate(employee.inactiveUntil)}
                </p>
              </div>
            )}
          </div>

          {employee.inactiveDetails && (
            <div className="mt-3 rounded-2xl bg-white/70 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-400">
                Hinweis
              </p>

              <p className="mt-1 text-sm font-medium leading-6 text-rose-800">
                {employee.inactiveDetails}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EmployeeDashboardPage() {
  const [bottomTab, setBottomTab] = useState<"home" | "profile">("home")
  const [dateFilter, setDateFilter] = useState<DateFilter>("today")
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isShiftActive, setIsShiftActive] = useState(false)
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null)
  const [employeeLoading, setEmployeeLoading] = useState(true)
  const [taskNeedingOvertime, setTaskNeedingOvertime] = useState<any | null>(
    null
  )
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [selectedServiceInfo, setSelectedServiceInfo] = useState<any | null>(
    null
  )

  const isInactiveToday = isEmployeeInactiveOnDate(employee, new Date())

  useEffect(() => {
    async function loadEmployee() {
      try {
        setEmployeeLoading(true)

        const res = await fetch("/api/employees/me", {
          cache: "no-store",
        })

        const data = await res.json().catch(() => null)

        if (res.ok && data) {
          setEmployee(data)
        }
      } catch (error) {
        console.error("EMPLOYEE LOAD ERROR:", error)
      } finally {
        setEmployeeLoading(false)
      }
    }

    loadEmployee()
  }, [])

  useEffect(() => {
    async function fetchTasks() {
      if (!employee) return
      if (bottomTab !== "home") return

      setIsLoading(true)

      try {
        const res = await fetch(`/api/employees/tasks?filter=${dateFilter}`, {
          cache: "no-store",
        })

        if (res.ok) {
          const data = await res.json()
          setTasks(Array.isArray(data) ? data : [])
        } else {
          setTasks([])
        }
      } catch (error) {
        console.error("TASK LOAD ERROR:", error)
        setTasks([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [dateFilter, bottomTab, employee])

  const handleTaskUpdate = (updatedTask: any) => {
    if (isInactiveToday) return

    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    )
    setTaskNeedingOvertime(null)
  }

  const currentBottomActive =
    bottomTab === "profile"
      ? "profile"
      : "today"

  function getGreeting() {
    const hour = new Date().getHours()

    if (hour < 12) return "Guten Morgen"
    if (hour < 18) return "Guten Tag"
    if (hour < 22) return "Guten Abend"
    return "Gute Nacht"
  }

  function getFilterTitle() {
    switch (dateFilter) {
      case "today":
        return "Heute"
      case "tomorrow":
        return "Morgen"
      case "month":
        return "Dieser Monat"
      case "history":
        return "Historie"
      default:
        return "Aufgaben"
    }
  }

  const currentDate = new Date().toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "long",
  })

  if (employeeLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 pb-[calc(120px+env(safe-area-inset-bottom))]">
      {bottomTab === "home" ? (
        <>
          <header
            className={`relative overflow-hidden rounded-[2rem] p-6 text-white shadow-xl ${
              isInactiveToday
                ? "bg-gradient-to-r from-slate-700 to-slate-600 shadow-slate-200"
                : "bg-blue-600 shadow-blue-100"
            }`}
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl">
                  cleaning_services
                </span>
                <span className="text-sm font-black uppercase tracking-[0.18em]">
                  SERVIHAUS
                </span>
              </div>

              <p className="rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur">
                {currentDate}
              </p>
            </div>

            <div className="relative z-10 mt-8">
              <p className="text-sm font-bold text-white/80">
                {getGreeting()},
              </p>

              <h1 className="mt-1 text-4xl font-black tracking-tight">
                {employee?.firstName || "Team"}!
              </h1>

              <p className="mt-3 text-sm font-medium text-white/80">
                {isInactiveToday
                  ? "Du kannst deine geplanten Aufgaben ansehen."
                  : "Hier sind deine Aufgaben."}
              </p>
            </div>
          </header>

          {employee && isInactiveToday && (
            <InactiveEmployeeBanner employee={employee} />
          )}

          <div className="mt-6">
            <div className="grid grid-cols-4 gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setDateFilter("today")}
                className={`rounded-xl py-2.5 text-[10px] font-black uppercase tracking-wider transition-all sm:text-[11px] ${
                  dateFilter === "today"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Heute
              </button>

              <button
                type="button"
                onClick={() => setDateFilter("tomorrow")}
                className={`rounded-xl py-2.5 text-[10px] font-black uppercase tracking-wider transition-all sm:text-[11px] ${
                  dateFilter === "tomorrow"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Morgen
              </button>

              <button
                type="button"
                onClick={() => setDateFilter("month")}
                className={`rounded-xl py-2.5 text-[10px] font-black uppercase tracking-wider transition-all sm:text-[11px] ${
                  dateFilter === "month"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Monat
              </button>

              <button
                type="button"
                onClick={() => setDateFilter("history")}
                className={`rounded-xl py-2.5 text-[10px] font-black uppercase tracking-wider transition-all sm:text-[11px] ${
                  dateFilter === "history"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Historie
              </button>
            </div>
          </div>

          {dateFilter === "today" && !isInactiveToday && (
            <div className="mt-6">
              <TimeTracker onShiftChange={setIsShiftActive} />
            </div>
          )}

          {dateFilter === "today" && isInactiveToday && (
            <div className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-5 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <span className="material-symbols-outlined">lock_clock</span>
              </div>

              <h2 className="mt-4 text-xl font-black text-slate-950">
                Schichtstart deaktiviert
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                Dein Konto ist für den heutigen Tag inaktiv. Du kannst deine
                Aufgaben sehen, aber keine Zeiten oder Statusänderungen
                erfassen.
              </p>
            </div>
          )}

          <section className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  {getFilterTitle()}
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Meine Aufgaben
                </h2>
              </div>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 shadow-sm">
                {tasks.length}
              </span>
            </div>

            {isLoading ? (
              <div className="flex h-40 items-center justify-center rounded-[2rem] bg-white shadow-sm">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">
                  refresh
                </span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
                <span className="material-symbols-outlined text-5xl text-slate-300">
                  task
                </span>

                <h2 className="mt-4 text-xl font-black text-slate-950">
                  Keine Aufgaben
                </h2>

                <p className="mt-2 text-sm font-medium text-slate-500">
                  Für diesen Zeitraum sind keine Aufgaben geplant.
                </p>
              </div>
            ) : (
              <div className="relative">
                {isInactiveToday && (
                  <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold leading-6 text-amber-700">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined mt-0.5">
                        visibility
                      </span>
                      Du befindest dich im Ansichtsmodus. Aufgaben sind sichtbar,
                      aber Aktionen sind während der Inaktivität gesperrt.
                    </div>
                  </div>
                )}

                <div
                  className={`grid gap-4 ${
                    isInactiveToday ? "pointer-events-none opacity-90" : ""
                  }`}
                >
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onOvertimeTriggered={(taskToUpdate: any) => {
                        if (isInactiveToday) return
                        setTaskNeedingOvertime(taskToUpdate)
                      }}
                      onStatusUpdated={handleTaskUpdate}
                      onOpenInfo={() => {
                        if (isInactiveToday) return
                        setSelectedServiceInfo(task)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {!isShiftActive &&
              !isInactiveToday &&
              dateFilter === "today" &&
              tasks.length > 0 && (
                <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-700">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">
                      lock_clock
                    </span>
                    Starte deine Schicht, um die Aufgaben zu bearbeiten.
                  </div>
                </div>
              )}
          </section>
        </>
      ) : (
        <ProfileTab />
      )}

      <BottomNav
        active={currentBottomActive}
        onTabChange={(tab: string) => {
          if (tab === "profile") {
            setBottomTab("profile")
          } else if (tab === "history") {
            setBottomTab("home")
            setDateFilter("history")
          } else {
            setBottomTab("home")
            setDateFilter("today")
          }
        }}
        onOpenMaterial={() => {
          if (isInactiveToday) return
          setShowMaterialModal(true)
        }}
      />

      {taskNeedingOvertime && !isInactiveToday && (
        <OvertimeModal
          task={taskNeedingOvertime}
          onClose={() => setTaskNeedingOvertime(null)}
          onSuccess={handleTaskUpdate}
        />
      )}

      {showMaterialModal && !isInactiveToday && (
        <MaterialModal
          tasks={tasks}
          onClose={() => setShowMaterialModal(false)}
        />
      )}

      {selectedServiceInfo && (
        <ServiceInfoModal
          service={selectedServiceInfo}
          onClose={() => setSelectedServiceInfo(null)}
        />
      )}
    </div>
  )
}