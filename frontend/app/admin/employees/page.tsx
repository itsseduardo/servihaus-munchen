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
  employmentType: "MINIJOB_538" | "MIDIJOB" | "FULL_TIME"
  contractedHoursPerWeek: number | null
  vacationDaysPerYear: number | null
}

export default function AdminEmployeesPage() {
  const router = useRouter()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

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

  // MÉTRICAS SOLICITADAS POR JOSÉ
  const stats = useMemo(() => {
    return {
      total: employees.length,
      minijob: employees.filter(e => e.employmentType === "MINIJOB_538").length,
      midijob: employees.filter(e => e.employmentType === "MIDIJOB").length,
      fulltime: employees.filter(e => e.employmentType === "FULL_TIME").length,
    }
  }, [employees])

  const totalPages = Math.ceil(employees.length / itemsPerPage)
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Mitarbeiter werden geladen...</p>
      </div>
    )
  }

  return (
    <div className="p-10 space-y-10 bg-slate-50/30 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Mitarbeiterverwaltung
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Zentrales Register für Arbeitsverträge & Stundenkonten
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          + Neuer Mitarbeiter
        </button>
      </div>

      {/* KPI CARDS - DINÁMICAS SEGÚN CONTRATO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Gesamt</p>
          <p className="text-4xl font-black mt-2 text-center text-slate-800">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest text-center">Minijob (538€)</p>
          <p className="text-4xl font-black mt-2 text-center text-blue-600">{stats.minijob}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest text-center">Midijob</p>
          <p className="text-4xl font-black mt-2 text-center text-amber-600">{stats.midijob}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest text-center">Vollzeit</p>
          <p className="text-4xl font-black mt-2 text-center text-emerald-600">{stats.fulltime}</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
              {/* Columnas Separadas */}
              <th className="px-8 py-5 text-left">Vorname</th>
              <th className="px-8 py-5 text-left">Nachname</th>
              <th className="px-8 py-5 text-left">Profession</th>
              <th className="px-8 py-5 text-left">Kontakt</th>
              <th className="px-8 py-5 text-left">Vertragstyp</th>
              <th className="px-8 py-5 text-left text-blue-600">Wochenstunden</th>
              <th className="px-8 py-5 text-right">Lohn</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedEmployees.map((employee) => (
              <tr
                key={employee.id}
                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                onClick={() => router.push(`/admin/employees/${employee.id}`)}
              >
                {/*  Celda de Nombre con Avatar */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-[10px] group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </div>
                    <span className="font-bold text-slate-800">{employee.firstName}</span>
                  </div>
                </td>

                {/* Celda de Apellido Independiente */}
                <td className="px-8 py-5 font-bold text-slate-800">
                  {employee.lastName}
                  <p className="text-[9px] text-slate-400 font-medium">ID: #{employee.id.toString().padStart(3, '0')}</p>
                </td>

                <td className="px-8 py-5">
                  <span className="font-medium text-slate-600">{employee.profession}</span>
                </td>

                <td className="px-8 py-5">
                  <p className="text-slate-600 font-medium">{employee.email}</p>
                  <p className="text-xs text-slate-400">{employee.phone || "-"}</p>
                </td>

                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${employee.employmentType === "MINIJOB_538" ? "bg-blue-100 text-blue-700" :
                      employee.employmentType === "MIDIJOB" ? "bg-amber-100 text-amber-700" :
                        "bg-emerald-100 text-emerald-700"
                    }`}>
                    {employee.employmentType === "MINIJOB_538" ? "Minijob" :
                      employee.employmentType === "MIDIJOB" ? "Midijob" : "Vollzeit"}
                  </span>
                </td>

                <td className="px-8 py-5 font-black text-blue-600">
                  {employee.contractedHoursPerWeek ? `${employee.contractedHoursPerWeek}h` : "-"}
                </td>

                <td className="px-8 py-5 text-right font-bold text-slate-700">
                  {employee.hourlyRate ? `${employee.hourlyRate.toFixed(2)} €/h` : "-"}
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
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            ←
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${currentPage === i + 1
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
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