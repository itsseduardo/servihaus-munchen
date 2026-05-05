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
  isActive: boolean // <-- Nuevo campo
}

export default function AdminEmployeesPage() {
  const router = useRouter()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // 🔥 ESTADOS PARA LOS FILTROS
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ACTIVE") // <-- Filtro Activo/Inactivo

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees")
      const data = await res.json()
      setEmployees(Array.isArray(data) ? data : [])
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

  const stats = useMemo(() => {
    // Solo contamos las estadísticas de los activos
    const activeEmps = employees.filter(e => e.isActive !== false)
    return {
      total: activeEmps.length,
      minijob: activeEmps.filter(e => e.employmentType === "MINIJOB_603").length,
      midijob: activeEmps.filter(e => e.employmentType === "MIDIJOB").length,
      fulltime: activeEmps.filter(e => e.employmentType === "FULL_TIME").length,
    }
  }, [employees])

  // 🔥 LÓGICA DE FILTRADO MEJORADA
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const searchLower = searchTerm.toLowerCase()
      
      const matchesSearch = 
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.profession?.toLowerCase().includes(searchLower) ||
        emp.id.toString().includes(searchLower)

      const matchesRole = roleFilter === "ALL" || emp.employmentType === roleFilter
      
      // Lógica de Activo/Inactivo (asumimos true si es undefined por registros viejos)
      const isEmpActive = emp.isActive !== false 
      const matchesStatus = 
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && isEmpActive) ||
        (statusFilter === "INACTIVE" && !isEmpActive)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [employees, searchTerm, roleFilter, statusFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter, statusFilter])

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Laden...</div>

  return (
    <div className="p-10 space-y-10 bg-slate-50/30 min-h-screen">

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Mitarbeiterverwaltung</h1>
          <p className="text-slate-500 mt-2 font-medium">Zentrales Register für Arbeitsverträge & Stundenkonten</p>
        </div>
        <button onClick={() => setIsOpen(true)} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
          + Neuer Mitarbeiter
        </button>
      </div>

      {/* KPI CARDS (Ocultas en este snippet por brevedad, mantén las tuyas) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 text-center">Aktive Gesamt</p>
          <p className="text-4xl font-black mt-2 text-center text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase text-blue-500 text-center">Minijob (603€)</p>
          <p className="text-4xl font-black mt-2 text-center text-blue-600">{stats.minijob}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase text-amber-500 text-center">Midijob</p>
          <p className="text-4xl font-black mt-2 text-center text-amber-600">{stats.midijob}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase text-emerald-500 text-center">Vollzeit</p>
          <p className="text-4xl font-black mt-2 text-center text-emerald-600">{stats.fulltime}</p>
        </div>
      </div>

      {/* 🔥 BARRA DE BÚSQUEDA Y NUEVOS FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            type="text"
            placeholder="Suchen nach Vorname, Nachname..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50/50 border-none outline-none font-medium text-slate-700"
          />
        </div>
        <div className="w-px bg-slate-100 hidden md:block"></div>
        
        {/* Filtro Rol */}
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-3 bg-transparent font-bold text-slate-600 outline-none cursor-pointer">
          <option value="ALL">Alle Verträge</option>
          <option value="MINIJOB_603">Minijob</option>
          <option value="MIDIJOB">Midijob</option>
          <option value="FULL_TIME">Vollzeit</option>
        </select>

        <div className="w-px bg-slate-100 hidden md:block"></div>

        {/* 🔥 Filtro Estado (Activo/Inactivo) */}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 bg-transparent font-bold text-slate-600 outline-none cursor-pointer">
          <option value="ACTIVE">🟢 Aktiv (Activos)</option>
          <option value="INACTIVE">🔴 Inaktiv (Inactivos)</option>
          <option value="ALL">⚪ Alle (Todos)</option>
        </select>
      </div>

      {/* TABLE */}
      {paginatedEmployees.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">person_search</span>
          <h3 className="text-lg font-black text-slate-700">Keine Mitarbeiter gefunden</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                <th className="px-8 py-5 text-left">Status</th>
                <th className="px-8 py-5 text-left">Vorname</th>
                <th className="px-8 py-5 text-left">Nachname</th>
                <th className="px-8 py-5 text-left">Vertragstyp</th>
                <th className="px-8 py-5 text-left text-blue-600">Wochenstunden</th>
                <th className="px-8 py-5 text-right">Lohn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.map((employee) => (
                <tr key={employee.id} onClick={() => router.push(`/admin/employees/${employee.id}`)} className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${employee.isActive === false ? 'opacity-50 bg-slate-50/50' : ''}`}>
                  
                  {/* Celda de Status Visual */}
                  <td className="px-8 py-5">
                    {employee.isActive !== false ? (
                      <span className="w-3 h-3 rounded-full bg-emerald-500 block shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Aktiv"></span>
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-rose-500 block" title="Inaktiv"></span>
                    )}
                  </td>

                  <td className="px-8 py-5 font-bold text-slate-800">{employee.firstName}</td>
                  <td className="px-8 py-5 font-bold text-slate-800">{employee.lastName}</td>
                  
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${employee.employmentType === "MINIJOB_603" ? "bg-blue-100 text-blue-700" : employee.employmentType === "MIDIJOB" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {employee.employmentType.replace("_603", "")}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black text-blue-600">{employee.contractedHoursPerWeek ? `${employee.contractedHoursPerWeek}h` : "-"}</td>
                  <td className="px-8 py-5 text-right font-bold text-slate-700">{employee.hourlyRate ? `${employee.hourlyRate.toFixed(2)} €/h` : "-"}</td>
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
      
      {isOpen && <CreateEmployeeModal onClose={() => setIsOpen(false)} onCreated={handleCreated} />}
    </div>
  )
}