"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import EditEmployeeModal from "@/components/admin/EditEmployeeModal"
import AddTimeBlockModal from "@/components/admin/AddTimeBlockModal"
import EmployeePayrollTab from "@/components/admin/EmployeePayrollTab"
import EmployeeAuditTab from "@/components/admin/EmployeeAuditTab"
import EmployeeStatusModal from "@/components/admin/EmployeeStatusModal"

type EmployeeDetail = {
  id: number
  firstName: string
  lastName: string
  profession?: string | null
  email?: string | null
  phone?: string | null
  hourlyRate?: number | null
  employmentType?: string | null
  contractedHoursPerWeek?: number | null
  vacationDaysPerYear?: number | null
  debtHours?: number | null
  active?: boolean
  isActive?: boolean
  inactiveReason?: string | null
  inactiveDetails?: string | null
  inactiveSince?: string | null
  inactiveUntil?: string | null
  reactivatedAt?: string | null
  assignments?: any[]
  timeBlocks?: any[]
  payrollRecords?: any[]
  workAuditLogs?: any[]
  totalWorkedHours?: number
  totalTravelHours?: number
  totalPaidHours?: number
  totalEarnings?: number
}

type TabKey = "overview" | "payroll" | "audit" | "status"

function isEmployeeActive(employee: EmployeeDetail) {
  return employee.isActive !== false && employee.active !== false
}

function getEmploymentLabel(type?: string | null) {
  switch (type) {
    case "MINIJOB_603":
      return "Minijob"
    case "MIDIJOB":
      return "Midijob"
    case "FULL_TIME":
      return "Vollzeit"
    default:
      return type || "Nicht hinterlegt"
  }
}

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

function formatDate(dateValue?: string | Date | null) {
  if (!dateValue) return "-"

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatTime(dateValue?: string | Date | null) {
  if (!dateValue) return "-"

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function formatMoney(value?: number | null) {
  if (value === null || value === undefined) return "-"

  return `${Number(value).toFixed(2)} €`
}

function formatHours(value?: number | null) {
  if (value === null || value === undefined) return "-"

  return `${Number(value).toFixed(2)}h`
}

function getServiceStatusLabel(status?: string | null) {
  const normalized = status?.toLowerCase() || ""

  switch (normalized) {
    case "completed":
      return "Erledigt"
    case "cancelled":
    case "canceled":
      return "Storniert"
    case "in_progress":
      return "In Arbeit"
    case "traveling":
      return "Unterwegs"
    case "assigned":
      return "Geplant"
    default:
      return status || "Offen"
  }
}

function getServiceStatusStyle(status?: string | null) {
  const normalized = status?.toLowerCase() || ""

  if (normalized === "completed") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100"
  }

  if (normalized === "cancelled" || normalized === "canceled") {
    return "bg-rose-50 text-rose-700 border-rose-100"
  }

  if (normalized === "in_progress") {
    return "bg-amber-50 text-amber-700 border-amber-100"
  }

  if (normalized === "traveling") {
    return "bg-blue-50 text-blue-700 border-blue-100"
  }

  return "bg-slate-100 text-slate-700 border-slate-200"
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-1 pb-5 text-sm font-black transition-colors sm:text-base ${
        active ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
      }`}
    >
      {children}

      {active && (
        <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-blue-600" />
      )}
    </button>
  )
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()

  const rawId = params.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isTimeBlockOpen, setIsTimeBlockOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [clearingDebt, setClearingDebt] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>("overview")

  const fetchEmployee = async () => {
    try {
      setLoading(true)

      const res = await fetch(`/api/employees/${id}`, {
        cache: "no-store",
      })

      if (!res.ok) {
        setEmployee(null)
        return
      }

      const data = await res.json()
      setEmployee(data)
    } catch (error) {
      console.error("Failed to fetch employee", error)
      setEmployee(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchEmployee()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const employeeActive = employee ? isEmployeeActive(employee) : false

  const calculatedStats = useMemo(() => {
    if (!employee) return null

    let totalServiceHours = 0
    let totalTravelHours = 0

    const assignments = employee.assignments || []

    assignments.forEach((assignment: any) => {
      const service = assignment.service

      if (!service || service.status !== "completed") return

      if (service.actualStartTime && service.actualEndTime) {
        const start = new Date(service.actualStartTime)
        const end = new Date(service.actualEndTime)
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

        if (diff > 0) {
          totalServiceHours += diff
        }
      } else {
        totalServiceHours += Number(service.duration || 0)
      }

      totalTravelHours += Number(service.travelTime || 0) / 60
    })

    const timeBlocks = employee.timeBlocks || []

    timeBlocks.forEach((block: any) => {
      totalServiceHours += Number(block.duration || 0)
    })

    const totalIstHours = totalServiceHours + totalTravelHours
    const weeklySoll = Number(employee.contractedHoursPerWeek || 0)
    const balance = totalIstHours - weeklySoll
    const earnings = totalIstHours * Number(employee.hourlyRate || 0)

    return {
      totalServiceHours,
      totalTravelHours,
      totalIstHours,
      weeklySoll,
      balance,
      earnings,
    }
  }, [employee])

  const sortedAssignments = useMemo(() => {
    if (!employee?.assignments) return []

    return [...employee.assignments].sort((a: any, b: any) => {
      const dateA = new Date(a.service?.date || 0).getTime()
      const dateB = new Date(b.service?.date || 0).getTime()

      return dateB - dateA
    })
  }, [employee])

  const handleClearDebt = async () => {
    if (
      !window.confirm(
        "Möchten Sie die Schulden auf 0 setzen? ¿Confirmas que el empleado ya recuperó estas horas y deseas saldar la deuda?"
      )
    ) {
      return
    }

    setClearingDebt(true)

    try {
      const res = await fetch(`/api/employees/${id}/clear-debt`, {
        method: "PATCH",
      })

      if (res.ok) {
        fetchEmployee()
      } else {
        alert("Fehler beim Löschen der Schulden")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setClearingDebt(false)
    }
  }

  const handleExportPDF = () => {
    if (!employee) return

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.setTextColor(15, 23, 42)
    doc.text("Arbeitszeitnachweis", 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text("Offizielles Protokoll gemäß Arbeitszeitgesetz (ArbZG)", 14, 28)

    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text(`Mitarbeiter: ${employee.lastName}, ${employee.firstName}`, 14, 40)
    doc.text(`Personal-ID: #${employee.id.toString().padStart(3, "0")}`, 14, 46)

    doc.text(
      `Vertragsart: ${getEmploymentLabel(employee.employmentType)}`,
      120,
      40
    )
    doc.text(
      `Soll-Stunden: ${employee.contractedHoursPerWeek || 0} h / Woche`,
      120,
      46
    )
    doc.text(`Druckdatum: ${new Date().toLocaleDateString("de-DE")}`, 120, 52)

    const logs: any[] = []

    if (employee.assignments) {
      employee.assignments.forEach((assignment: any) => {
        const service = assignment.service

        if (!service || service.status !== "completed") return

        const fahrzeit = service.travelTime || 0

        let workedHours = Number(service.duration || 0)

        if (service.actualStartTime && service.actualEndTime) {
          const start = new Date(service.actualStartTime)
          const end = new Date(service.actualEndTime)
          const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

          if (diff > 0) workedHours = diff
        }

        const total = workedHours + fahrzeit / 60

        logs.push({
          dateObj: new Date(service.date),
          datum: formatDate(service.date),
          typ: `Service: ${service.client?.name || "Kunde"}`,
          start: formatTime(service.actualStartTime),
          ende: formatTime(service.actualEndTime),
          fahrzeit: `${fahrzeit} min`,
          gesamt: `${total.toFixed(2)} h`,
        })
      })
    }

    if (employee.timeBlocks) {
      const typeLabels: Record<string, string> = {
        CLIENT_CANCELLED: "Kunden-Stornierung",
        VACATION: "Urlaub",
        SICK: "Krankheit",
        PAID_LEAVE: "Bezahlte Freistellung",
      }

      employee.timeBlocks.forEach((block: any) => {
        logs.push({
          dateObj: new Date(block.date),
          datum: formatDate(block.date),
          typ: `Manuell: ${typeLabels[block.type] || block.type}`,
          start: "-",
          ende: "-",
          fahrzeit: "-",
          gesamt: `${Number(block.duration || 0).toFixed(2)} h`,
        })
      })
    }

    logs.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    const tableBody = logs.map((log) => [
      log.datum,
      log.typ,
      log.start,
      log.ende,
      log.fahrzeit,
      log.gesamt,
    ])

    autoTable(doc, {
      startY: 65,
      head: [["Datum", "Aktivität / Kunde", "Start", "Ende", "Fahrzeit", "Gesamt"]],
      body: tableBody,
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: {
        top: 65,
      },
    })

    const finalY = (doc as any).lastAutoTable?.finalY || 65

    doc.setFontSize(10)
    doc.text(
      `Total dokumentierte Stunden: ${Number(
        employee.totalPaidHours || calculatedStats?.totalIstHours || 0
      ).toFixed(2)} h`,
      14,
      finalY + 15
    )

    doc.line(14, finalY + 40, 80, finalY + 40)
    doc.text("Unterschrift Arbeitgeber (ServiHaus)", 14, finalY + 45)

    doc.line(120, finalY + 40, 186, finalY + 40)
    doc.text("Unterschrift Arbeitnehmer", 120, finalY + 45)

    doc.save(
      `Arbeitszeit_${employee.lastName}_${new Date()
        .toISOString()
        .split("T")[0]}.pdf`
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                Lade Mitarbeiterdaten
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!employee) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-400">
            person_off
          </span>

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Mitarbeiter nicht gefunden
          </h1>

          <button
            type="button"
            onClick={() => router.push("/admin/employees")}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition-all hover:bg-blue-700"
          >
            Zurück zur Liste
          </button>
        </div>
      </main>
    )
  }

  const contractedHours = Number(employee.contractedHoursPerWeek || 0)
  const debtHours = Number(employee.debtHours || 0)
  const targetThisWeek = contractedHours + debtHours

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-7xl space-y-6">
        {/* TOP BAR */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/employees")}
            className="group flex w-fit items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-blue-600"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Zurück zur Liste
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(true)}
              className={`rounded-xl px-5 py-3 text-sm font-black transition-all ${
                employeeActive
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
            >
              {employeeActive ? "Inaktiv setzen" : "Aktivieren"}
            </button>

            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-all hover:border-blue-200 hover:text-blue-600"
            >
              Vertrag bearbeiten
            </button>

            <button
              type="button"
              onClick={() => setIsTimeBlockOpen(true)}
              className="rounded-xl bg-blue-50 px-5 py-3 text-sm font-black text-blue-600 transition-all hover:bg-blue-100"
            >
              Zeit buchen
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition-all hover:bg-black"
            >
              PDF Export
            </button>
          </div>
        </div>

        {/* HERO */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
          <div
            className={`p-6 text-white sm:p-8 ${
              employeeActive
                ? "bg-gradient-to-r from-blue-600 to-blue-500"
                : "bg-gradient-to-r from-slate-700 to-slate-600"
            }`}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-3xl font-black uppercase backdrop-blur">
                  {employee.firstName?.[0] || "?"}
                  {employee.lastName?.[0] || ""}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-100">
                      Mitarbeiter #{employee.id}
                    </p>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        employeeActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {employeeActive ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>

                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    {employee.firstName} {employee.lastName}
                  </h1>

                  <p className="mt-2 text-sm font-bold text-blue-50">
                    {employee.profession || "Mitarbeiter"} ·{" "}
                    {getEmploymentLabel(employee.employmentType)}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:w-[470px]">
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-100">
                    Vertrag
                  </p>
                  <p className="mt-1 text-2xl font-black">{contractedHours}h</p>
                </div>

                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-100">
                    Schulden
                  </p>
                  <p className="mt-1 text-2xl font-black">+{debtHours}h</p>
                </div>

                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-100">
                    Soll Woche
                  </p>
                  <p className="mt-1 text-2xl font-black">{targetThisWeek}h</p>
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="border-b border-slate-100 px-6 pt-5 sm:px-8">
            <div className="flex gap-6 overflow-x-auto">
              <TabButton
                active={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
              >
                Übersicht
              </TabButton>

              <TabButton
                active={activeTab === "payroll"}
                onClick={() => setActiveTab("payroll")}
              >
                Lohn & Kosten
              </TabButton>

              <TabButton
                active={activeTab === "audit"}
                onClick={() => setActiveTab("audit")}
              >
                Historie & Kontrolle
              </TabButton>

              <TabButton
                active={activeTab === "status"}
                onClick={() => setActiveTab("status")}
              >
                Status & Inaktivität
              </TabButton>
            </div>
          </div>
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Ist-Stunden
                </p>

                <p className="mt-3 text-3xl font-black text-blue-600">
                  {formatHours(calculatedStats?.totalIstHours)}
                </p>

                <p className="mt-2 text-xs font-bold text-slate-400">
                  Arbeit + Fahrzeit
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Fahrzeit
                </p>

                <p className="mt-3 text-3xl font-black text-amber-600">
                  {formatHours(calculatedStats?.totalTravelHours)}
                </p>

                <p className="mt-2 text-xs font-bold text-slate-400">
                  Bezahlte Wegzeit
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Zeitkonto
                </p>

                <p
                  className={`mt-3 text-3xl font-black ${
                    (calculatedStats?.balance || 0) >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {formatHours(calculatedStats?.balance)}
                </p>

                <p className="mt-2 text-xs font-bold text-slate-400">
                  Differenz zum Soll
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Verdienst
                </p>

                <p className="mt-3 text-3xl font-black text-slate-950">
                  {formatMoney(calculatedStats?.earnings)}
                </p>

                <p className="mt-2 text-xs font-bold text-slate-400">
                  Basierend auf Ist-Stunden
                </p>
              </div>
            </div>

            {/* DEBT PANEL */}
            {debtHours > 0 && (
              <div className="rounded-[2rem] border border-amber-100 bg-amber-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">
                      Stunden-Schulden
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-amber-950">
                      +{debtHours}h müssen noch ausgeglichen werden
                    </h2>

                    <p className="mt-2 text-sm font-bold text-amber-700">
                      Soll diese Woche: {targetThisWeek}h
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearDebt}
                    disabled={clearingDebt}
                    className="rounded-2xl bg-amber-600 px-5 py-3 text-sm font-black text-white transition-all hover:bg-amber-700 disabled:opacity-50"
                  >
                    {clearingDebt ? "Wird saldiert..." : "Schulden saldieren"}
                  </button>
                </div>
              </div>
            )}

            {/* CONTACT / CONTRACT */}
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  Mitarbeiterdaten
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Kontakt & Vertrag
                </h2>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Vorname
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {employee.firstName}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Nachname
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {employee.lastName}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      E-Mail
                    </p>
                    <p className="mt-1 break-all text-sm font-bold text-slate-800">
                      {employee.email || "Nicht hinterlegt"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Telefon
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {employee.phone || "Keine Telefonnummer"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Arbeitszeit-Protokoll
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Letzte Einsätze
                </h2>

                {sortedAssignments.length === 0 ? (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300">
                      history_edu
                    </span>

                    <p className="mt-3 text-sm font-bold text-slate-500">
                      Noch keine Einsätze vorhanden.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50">
                        <tr className="text-left">
                          <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            Datum
                          </th>
                          <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            Kunde
                          </th>
                          <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            Code
                          </th>
                          <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {sortedAssignments.slice(0, 8).map((assignment: any) => {
                          const service = assignment.service

                          return (
                            <tr
                              key={assignment.id}
                              className="border-t border-slate-100"
                            >
                              <td className="px-4 py-4 align-top">
                                <p className="text-sm font-black text-slate-900">
                                  {formatDate(service?.date)}
                                </p>
                                <p className="mt-1 text-xs font-bold text-slate-400">
                                  {formatTime(service?.startTime)}
                                </p>
                              </td>

                              <td className="px-4 py-4 align-top text-sm font-bold text-slate-700">
                                {service?.client?.name || "Kunde"}
                              </td>

                              <td className="px-4 py-4 align-top text-sm font-black text-slate-800">
                                {service?.serviceCode?.code || service?.code || "-"}
                              </td>

                              <td className="px-4 py-4 align-top">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getServiceStatusStyle(
                                    service?.status
                                  )}`}
                                >
                                  {getServiceStatusLabel(service?.status)}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PAYROLL */}
        {activeTab === "payroll" && (
          <EmployeePayrollTab
            employeeId={employee.id}
            records={employee.payrollRecords || []}
            onUpdate={fetchEmployee}
          />
        )}

        {/* AUDIT */}
        {activeTab === "audit" && (
          <EmployeeAuditTab logs={employee.workAuditLogs || []} />
        )}

        {/* STATUS */}
        {activeTab === "status" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                    Statusverwaltung
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Aktivität des Mitarbeiters
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                    Hier wird gesteuert, ob der Mitarbeiter Zugriff auf sein
                    Dashboard hat und Aufgaben bearbeiten kann.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(true)}
                  className={`rounded-xl px-5 py-3 text-sm font-black transition-all ${
                    employeeActive
                      ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }`}
                >
                  {employeeActive ? "Inaktiv setzen" : "Aktivieren"}
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Aktueller Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-black ${
                      employeeActive
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-rose-100 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {employeeActive ? "Aktiv" : "Inaktiv"}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Reaktiviert am
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {formatDate(employee.reactivatedAt)}
                  </p>
                </div>
              </div>

              {!employeeActive && (
                <div className="mt-6 rounded-3xl border border-rose-100 bg-rose-50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                      <span className="material-symbols-outlined">
                        lock_person
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-500">
                        Mitarbeiter ist inaktiv
                      </p>

                      <h3 className="mt-2 text-xl font-black text-rose-950">
                        {getInactiveReasonLabel(employee.inactiveReason)}
                      </h3>

                      <p className="mt-2 text-sm font-bold text-rose-700">
                        Seit {formatDate(employee.inactiveSince)}
                        {employee.inactiveUntil
                          ? ` · Bis ${formatDate(employee.inactiveUntil)}`
                          : ""}
                      </p>

                      {employee.inactiveDetails && (
                        <p className="mt-4 rounded-2xl bg-white/70 p-4 text-sm font-medium leading-6 text-rose-800">
                          {employee.inactiveDetails}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Auswirkungen
              </p>

              <div className="mt-5 grid gap-3">
                {[
                  [
                    "Dashboard",
                    employeeActive
                      ? "Der Mitarbeiter kann sein Dashboard normal nutzen."
                      : "Der Mitarbeiter sieht nur die Inaktivitätsmeldung.",
                  ],
                  [
                    "Aufgaben",
                    employeeActive
                      ? "Aufgaben können angezeigt und bearbeitet werden."
                      : "Aufgaben und Schichtstart werden blockiert.",
                  ],
                  [
                    "Admin",
                    "Die Information bleibt hier dokumentiert und kann reaktiviert werden.",
                  ],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-black text-slate-800">{title}</p>

                    <p className="mt-1 text-xs font-bold leading-5 text-slate-400">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {isEditOpen && (
        <EditEmployeeModal
          employee={employee}
          onClose={() => setIsEditOpen(false)}
          onUpdated={() => {
            setIsEditOpen(false)
            fetchEmployee()
          }}
        />
      )}

      {isTimeBlockOpen && (
        <AddTimeBlockModal
          employeeId={employee.id}
          onClose={() => setIsTimeBlockOpen(false)}
          onAdded={() => {
            setIsTimeBlockOpen(false)
            fetchEmployee()
          }}
        />
      )}

      {isStatusModalOpen && (
        <EmployeeStatusModal
          employee={employee}
          onClose={() => setIsStatusModalOpen(false)}
          onSaved={() => {
            setIsStatusModalOpen(false)
            fetchEmployee()
            router.refresh()
          }}
        />
      )}
    </main>
  )
}