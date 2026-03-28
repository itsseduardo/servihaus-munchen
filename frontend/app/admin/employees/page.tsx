"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import CreateEmployeeModal from "@/components/admin/CreateEmployeeModal"

interface Employee {
  id: number
  firstName: string
  lastName: string
  profession: string
  email: string
  phone: string | null
  hourlyRate: number | null
  employmentType: "HOURLY" | "FIXED"
  contractedHoursPerDay: number | null
}

export default function AdminEmployeesPage() {

  const router = useRouter()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees")
      const data = await res.json()

      if (Array.isArray(data)) {
        setEmployees(data)
      } else {
        setEmployees([])
      }

    } catch {
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleCreated = async () => {
    await fetchEmployees()
    router.refresh()
  }

  // STATS
  const stats = useMemo(() => {
    const total = employees.length
    const hourly = employees.filter(e => e.employmentType === "HOURLY").length
    const fixed = employees.filter(e => e.employmentType === "FIXED").length

    return { total, hourly, fixed }
  }, [employees])

  // PAGINATION LOGIC
  const totalPages = Math.ceil(employees.length / itemsPerPage)

  const paginatedEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className="p-10">
        <p>Loading employees...</p>
      </div>
    )
  }

  return (
    <div className="p-10 space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Mitarbeiterverwaltung
          </h1>
          <p className="text-slate-500 mt-2">
            {stats.total} Mitarbeiter insgesamt
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-primary text-white rounded-xl shadow hover:shadow-lg transition"
        >
          + Neuer Mitarbeiter
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Gesamt
          </p>
          <p className="text-3xl font-black mt-2">
            {stats.total}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Stundenbasis
          </p>
          <p className="text-3xl font-black mt-2 text-blue-600">
            {stats.hourly}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Fest angestellt
          </p>
          <p className="text-3xl font-black mt-2 text-emerald-600">
            {stats.fixed}
          </p>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <th className="px-8 py-4 text-left">Vorname</th>
              <th className="px-8 py-4 text-left">Nachname</th>
              <th className="px-8 py-4 text-left">Profession</th>
              <th className="px-8 py-4 text-left">Email</th>
              <th className="px-8 py-4 text-left">Telefon</th>
              <th className="px-8 py-4 text-left">Anstellungsart</th>
              <th className="px-8 py-4 text-left">Rate / Stunden</th>
            </tr>
          </thead>

          <tbody>
            {paginatedEmployees.map((employee) => (
              <tr
                key={employee.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer"
                onClick={() =>
                  router.push(`/admin/employees/${employee.id}`)
                }
              >
                <td className="px-8 py-5 font-medium">
                  {employee.firstName}
                </td>

                <td className="px-8 py-5 font-medium">
                  {employee.lastName}
                </td>

                <td className="px-8 py-5">
                  {employee.profession}
                </td>

                <td className="px-8 py-5">
                  {employee.email}
                </td>

                <td className="px-8 py-5">
                  {employee.phone || "-"}
                </td>

                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    employee.employmentType === "HOURLY"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {employee.employmentType === "HOURLY"
                      ? "Stundenbasis"
                      : "Fest angestellt"}
                  </span>
                </td>

                <td className="px-8 py-5">
                  {employee.employmentType === "HOURLY"
                    ? employee.hourlyRate != null
                      ? `${employee.hourlyRate.toFixed(2)} €`
                      : "-"
                    : employee.contractedHoursPerDay != null
                      ? `${employee.contractedHoursPerDay} Std/Tag`
                      : "-"
                  }
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-2 text-sm rounded-lg border disabled:opacity-40"
          >
            ←
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm rounded-lg border ${
                  currentPage === page
                    ? "bg-primary text-white border-primary"
                    : "hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            )
          })}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-2 text-sm rounded-lg border disabled:opacity-40"
          >
            →
          </button>

        </div>
      )}

      {isOpen && (
        <CreateEmployeeModal
          onClose={() => setIsOpen(false)}
          onCreated={handleCreated}
        />
      )}

    </div>
  )
}