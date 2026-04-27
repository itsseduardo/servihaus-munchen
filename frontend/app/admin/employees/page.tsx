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
  employmentType: "MINIJOB_603" | "MIDIJOB" | "FULL_TIME"
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

  //  1. ESTADOS PARA LOS FILTROS
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")

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
      minijob: employees.filter(e => e.employmentType === "MINIJOB_603").length,
      midijob: employees.filter(e => e.employmentType === "MIDIJOB").length,
      fulltime: employees.filter(e => e.employmentType === "FULL_TIME").length,
    }
  }, [employees])

  //  2. LÓGICA DE FILTRADO (En tiempo real)
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const searchLower = searchTerm.toLowerCase()
      
      // Búsqueda en campos clave
      const matchesSearch = 
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.profession?.toLowerCase().includes(searchLower) ||
        emp.id.toString().includes(searchLower)

      // Filtro por contrato
      const matchesRole = roleFilter === "ALL" || emp.employmentType === roleFilter

      return matchesSearch && matchesRole
    })
  }, [employees, searchTerm, roleFilter])

  //  3. RESET DE PÁGINA (Al buscar, volvemos a la pag 1)
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter])

  //  4. PAGINACIÓN BASADA EN RESULTADOS FILTRADOS
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const paginatedEmployees = filteredEmployees.slice(
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
          <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest text-center">Minijob (603€)</p>
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

      {/*  BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            type="text"
            placeholder="Suchen nach Vorname, Nachname, Email, ID... (Buscar empleado)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50/50 border-none focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-700"
          />
        </div>
        <div className="w-px bg-slate-100 hidden md:block"></div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-6 py-3 rounded-xl bg-transparent border-none outline-none text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <option value="ALL">Alle Verträge (Todos)</option>
          <option value="MINIJOB_603">Minijob (603€)</option>
          <option value="MIDIJOB">Midijob</option>
          <option value="FULL_TIME">Vollzeit (Completo)</option>
        </select>
      </div>

      {/* TABLE */}
      {paginatedEmployees.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">person_search</span>
          <h3 className="text-lg font-black text-slate-700">Keine Mitarbeiter gefunden</h3>
          <p className="text-slate-500 mt-2 text-sm">No se encontraron empleados con esos filtros.</p>
          <button 
            onClick={() => { setSearchTerm(""); setRoleFilter("ALL"); }}
            className="mt-6 px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors"
          >
            Filtros borrar (Limpiar)
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                {/* Columnas Separadas como solicitó el cliente */}
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
                  {/* Celda de Nombre (Vorname) con Avatar */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-[10px] group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                        {employee.firstName[0]}{employee.lastName[0]}
                      </div>
                      <span className="font-bold text-slate-800">{employee.firstName}</span>
                    </div>
                  </td>

                  {/* Celda de Apellido (Nachname) Independiente */}
                  <td className="px-8 py-5 font-bold text-slate-800">
                    {employee.lastName}
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">ID: #{employee.id.toString().padStart(3, '0')}</p>
                  </td>

                  <td className="px-8 py-5">
                    <span className="font-medium text-slate-600">{employee.profession}</span>
                  </td>

                  <td className="px-8 py-5">
                    <p className="text-slate-600 font-medium">{employee.email}</p>
                    <p className="text-xs text-slate-400">{employee.phone || "-"}</p>
                  </td>

                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${employee.employmentType === "MINIJOB_603" ? "bg-blue-100 text-blue-700" :
                        employee.employmentType === "MIDIJOB" ? "bg-amber-100 text-amber-700" :
                          "bg-emerald-100 text-emerald-700"
                      }`}>
                      {employee.employmentType === "MINIJOB_603" ? "Minijob" :
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
      )}

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