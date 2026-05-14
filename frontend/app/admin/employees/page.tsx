"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import CreateEmployeeModal from "@/components/admin/CreateEmployeeModal"

type EmploymentType = "MINIJOB_603" | "MIDIJOB" | "FULL_TIME" | string

interface Employee {
  id: number
  firstName: string
  lastName: string
  fullName?: string
  profession?: string | null
  email?: string | null
  phone?: string | null
  hourlyRate?: number | null
  employmentType?: EmploymentType | null
  contractedHoursPerWeek?: number | null
  vacationDaysPerYear?: number | null
  active?: boolean
  isActive?: boolean
  inactiveReason?: string | null
  inactiveDetails?: string | null
  inactiveSince?: string | null
  inactiveUntil?: string | null
  reactivatedAt?: string | null
  userId?: string | null
  hasLogin?: boolean
  servicesCount?: number
  createdAt?: string
}

const ITEMS_PER_PAGE = 8

function isEmployeeActive(employee: Employee) {
  return employee.isActive !== false && employee.active !== false
}

function getEmploymentLabel(type?: EmploymentType | null) {
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
    case "UNPAID_VACATION":
      return "Unbezahltener Urlaub"
    default:
      return "Nicht angegeben"
  }
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) return "-"

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatHourlyRate(rate?: number | null) {
  if (rate === null || rate === undefined) return "-"

  return `${Number(rate).toFixed(2)} €/h`
}

export default function AdminEmployeesPage() {
  const router = useRouter()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ACTIVE")

  const fetchEmployees = async () => {
    try {
      setLoading(true)

      const res = await fetch("/api/employees", {
        cache: "no-store",
      })

      const data = await res.json().catch(() => [])

      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("EMPLOYEES LOAD ERROR:", error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleCreated = async () => {
    setIsOpen(false)
    await fetchEmployees()
    router.refresh()
  }

  const stats = useMemo(() => {
    const activeEmployees = employees.filter(isEmployeeActive)
    const inactiveEmployees = employees.filter(
      (employee) => !isEmployeeActive(employee)
    )

    return {
      total: activeEmployees.length,
      inactive: inactiveEmployees.length,
      minijob: activeEmployees.filter(
        (employee) => employee.employmentType === "MINIJOB_603"
      ).length,
      midijob: activeEmployees.filter(
        (employee) => employee.employmentType === "MIDIJOB"
      ).length,
      fulltime: activeEmployees.filter(
        (employee) => employee.employmentType === "FULL_TIME"
      ).length,
    }
  }, [employees])

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchLower = searchTerm.trim().toLowerCase()

      const matchesSearch =
        !searchLower ||
        employee.firstName?.toLowerCase().includes(searchLower) ||
        employee.lastName?.toLowerCase().includes(searchLower) ||
        employee.fullName?.toLowerCase().includes(searchLower) ||
        employee.email?.toLowerCase().includes(searchLower) ||
        employee.phone?.toLowerCase().includes(searchLower) ||
        employee.profession?.toLowerCase().includes(searchLower) ||
        employee.id.toString().includes(searchLower)

      const matchesRole =
        roleFilter === "ALL" || employee.employmentType === roleFilter

      const employeeActive = isEmployeeActive(employee)

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && employeeActive) ||
        (statusFilter === "INACTIVE" && !employeeActive)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [employees, searchTerm, roleFilter, statusFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter, statusFilter])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE)
  )

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE

    return filteredEmployees.slice(start, end)
  }, [filteredEmployees, currentPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                Mitarbeiter werden geladen
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
          
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Mitarbeiterverwaltung
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Zentrales Register für Mitarbeiter, Verträge, Status und
              Arbeitskonten.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
          >
            <span className="material-symbols-outlined text-[20px]">
              person_add
            </span>
            Neuer Mitarbeiter
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Aktiv
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">
              {stats.total}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-rose-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-400">
              Inaktiv
            </p>
            <p className="mt-3 text-3xl font-black text-rose-600">
              {stats.inactive}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Minijob
            </p>
            <p className="mt-3 text-3xl font-black text-blue-600">
              {stats.minijob}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Midijob
            </p>
            <p className="mt-3 text-3xl font-black text-emerald-600">
              {stats.midijob}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Vollzeit
            </p>
            <p className="mt-3 text-3xl font-black text-amber-600">
              {stats.fulltime}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nach Vorname, Nachname, E-Mail, Telefon, Beruf oder ID suchen..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none transition-all focus:border-blue-300"
            >
              <option value="ALL">Alle Verträge</option>
              <option value="MINIJOB_603">Minijob</option>
              <option value="MIDIJOB">Midijob</option>
              <option value="FULL_TIME">Vollzeit</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none transition-all focus:border-blue-300"
            >
              <option value="ACTIVE">Nur aktive</option>
              <option value="INACTIVE">Nur inaktive</option>
              <option value="ALL">Alle Status</option>
            </select>
          </div>
        </div>

        {/* CONTENT */}
        {filteredEmployees.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300">
              person_search
            </span>

            <h2 className="mt-4 text-2xl font-black text-slate-950">
              Keine Mitarbeiter gefunden
            </h2>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Ändere die Filter oder lege einen neuen Mitarbeiter an.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Vorname
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Nachname
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Kontakt
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Position
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Vertrag
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Wochenstunden
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Lohn
                    </th>

                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Inaktivität
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedEmployees.map((employee) => {
                    const employeeActive = isEmployeeActive(employee)

                    return (
                      <tr
                        key={employee.id}
                        onClick={() =>
                          router.push(`/admin/employees/${employee.id}`)
                        }
                        className={`cursor-pointer border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50 ${
                          !employeeActive ? "bg-slate-50/60 opacity-75" : ""
                        }`}
                      >
                        <td className="px-6 py-5 align-top">
                          {employeeActive ? (
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              Aktiv
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">
                              <span className="h-2 w-2 rounded-full bg-rose-500" />
                              Inaktiv
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5 align-top">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${
                                employeeActive
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {employee.firstName?.[0] || "?"}
                            </div>

                            <div>
                              <p className="font-black text-slate-900">
                                {employee.firstName || "-"}
                              </p>

                              <p className="mt-1 text-xs font-bold text-slate-400">
                                ID {employee.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 align-top">
                          <p className="font-black text-slate-900">
                            {employee.lastName || "-"}
                          </p>
                        </td>

                        <td className="px-6 py-5 align-top">
                          <p className="max-w-[220px] truncate text-sm font-bold text-slate-700">
                            {employee.email || "Keine E-Mail"}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            {employee.phone || "Keine Telefonnummer"}
                          </p>
                        </td>

                        <td className="px-6 py-5 align-top">
                          <p className="text-sm font-bold text-slate-700">
                            {employee.profession || "Mitarbeiter"}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            {employee.hasLogin ? "Login aktiv" : "Ohne Login"}
                          </p>
                        </td>

                        <td className="px-6 py-5 align-top">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                            {getEmploymentLabel(employee.employmentType)}
                          </span>
                        </td>

                        <td className="px-6 py-5 align-top text-sm font-bold text-slate-700">
                          {employee.contractedHoursPerWeek
                            ? `${employee.contractedHoursPerWeek} h`
                            : "-"}
                        </td>

                        <td className="px-6 py-5 align-top text-sm font-bold text-slate-700">
                          {formatHourlyRate(employee.hourlyRate)}
                        </td>

                        <td className="px-6 py-5 align-top">
                          {employeeActive ? (
                            <span className="text-xs font-bold text-slate-400">
                              -
                            </span>
                          ) : (
                            <div className="max-w-[240px]">
                              <p className="text-sm font-black text-rose-700">
                                {getInactiveReasonLabel(employee.inactiveReason)}
                              </p>

                              <p className="mt-1 text-xs font-medium text-slate-400">
                                Seit {formatDate(employee.inactiveSince)}
                                {employee.inactiveUntil
                                  ? ` · Bis ${formatDate(
                                      employee.inactiveUntil
                                    )}`
                                  : ""}
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {filteredEmployees.length > ITEMS_PER_PAGE && (
              <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Zeige {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredEmployees.length
                  )}{" "}
                  von {filteredEmployees.length}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ←
                  </button>

                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1
                    const active = page === currentPage

                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-10 min-w-10 rounded-xl px-3 text-sm font-black transition-all ${
                          active
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                            : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(totalPages, prev + 1)
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {isOpen && (
        <CreateEmployeeModal
          onClose={() => setIsOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </main>
  )
}