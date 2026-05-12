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

type DateFilter = "today" | "tomorrow" | "history"

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

function InactiveEmployeeScreen({
  employee,
}: {
  employee: EmployeeProfile
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 pb-24">
      <section className="mx-auto flex min-h-[75vh] max-w-xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-rose-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-rose-50 text-rose-600">
            <span className="material-symbols-outlined text-5xl">
              lock_person
            </span>
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-rose-500">
            Konto inaktiv
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Ihr Konto ist derzeit inaktiv
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-slate-500">
            Hallo {employee.firstName}, Ihr Mitarbeiterkonto wurde von der
            Verwaltung vorübergehend deaktiviert. Während dieser Zeit können
            keine Aufgaben bearbeitet oder Schichten gestartet werden.
          </p>

          <div className="mt-6 grid gap-3 text-left">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Grund
              </p>

              <p className="mt-1 text-sm font-black text-slate-800">
                {getInactiveReasonLabel(employee.inactiveReason)}
              </p>
            </div>

            {employee.inactiveUntil && (
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Voraussichtlich bis
                </p>

                <p className="mt-1 text-sm font-black text-slate-800">
                  {formatDate(employee.inactiveUntil)}
                </p>
              </div>
            )}

            {employee.inactiveDetails && (
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Hinweis
                </p>

                <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
                  {employee.inactiveDetails}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-bold text-blue-700">
            Bitte kontaktieren Sie die Verwaltung, wenn Sie Fragen zu Ihrem
            Status haben.
          </div>
        </div>
      </section>
    </main>
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
      if (!employee || employee.isActive === false) return
      if (bottomTab !== "home") return

      setIsLoading(true)

      try {
        const res = await fetch(`/api/employees/tasks?filter=${dateFilter}`, {
          cache: "no-store",
        })

        if (res.ok) {
          const data = await res.json()
          setTasks(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("TASK LOAD ERROR:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [dateFilter, bottomTab, employee])

  const handleTaskUpdate = (updatedTask: any) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    )
    setTaskNeedingOvertime(null)
  }

  const currentBottomActive =
    bottomTab === "profile"
      ? "profile"
      : dateFilter === "history"
        ? "history"
        : "today"

  function getGreeting() {
    const hour = new Date().getHours()

    if (hour < 12) return "Guten Morgen"
    if (hour < 18) return "Guten Tag"
    if (hour < 22) return "Guten Abend"
    return "Gute Nacht"
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

  if (employee && employee.isActive === false) {
    return (
      <>
        <InactiveEmployeeScreen employee={employee} />
        <BottomNav
          active="today"
          onTabChange={() => { }}
          onOpenMaterial={() => { }}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 pb-[calc(120px+env(safe-area-inset-bottom))]">
      {bottomTab === "home" ? (
        <>
          <header className="relative overflow-hidden rounded-[2rem] bg-blue-600 p-6 text-white shadow-xl shadow-blue-100">
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
              <p className="text-sm font-bold text-blue-100">
                {getGreeting()},
              </p>

              <h1 className="mt-1 text-4xl font-black tracking-tight">
                {employee?.firstName || "Team"}!
              </h1>

              <p className="mt-3 text-sm font-medium text-blue-50">
                Hier sind deine Aufgaben.
              </p>
            </div>
          </header>

          <div className="mt-6">
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setDateFilter("today")}
                className={`rounded-xl py-2.5 text-[11px] font-black uppercase tracking-wider transition-all ${dateFilter === "today"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
                  }`}
              >
                Heute
              </button>

              <button
                type="button"
                onClick={() => setDateFilter("tomorrow")}
                className={`rounded-xl py-2.5 text-[11px] font-black uppercase tracking-wider transition-all ${dateFilter === "tomorrow"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
                  }`}
              >
                Morgen
              </button>

              <button
                type="button"
                onClick={() => setDateFilter("history")}
                className={`rounded-xl py-2.5 text-[11px] font-black uppercase tracking-wider transition-all ${dateFilter === "history"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
                  }`}
              >
                Historie
              </button>
            </div>
          </div>

          {dateFilter === "today" && (
            <div className="mt-6">
              <TimeTracker onShiftChange={setIsShiftActive} />
            </div>
          )}

          <section className="mt-6">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center rounded-[2rem] bg-white shadow-sm">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">
                  refresh
                </span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
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
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onOvertimeTriggered={setTaskNeedingOvertime}
                    onStatusUpdated={handleTaskUpdate}
                    onOpenInfo={() => setSelectedServiceInfo(task)}
                  />
                ))}
              </div>
            )}

            {!isShiftActive && dateFilter === "today" && tasks.length > 0 && (
              <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-700">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">lock_clock</span>
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
        onOpenMaterial={() => setShowMaterialModal(true)}
      />

      {taskNeedingOvertime && (
        <OvertimeModal
          task={taskNeedingOvertime}
          onClose={() => setTaskNeedingOvertime(null)}
          onSuccess={handleTaskUpdate}
        />
      )}

      {showMaterialModal && (
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