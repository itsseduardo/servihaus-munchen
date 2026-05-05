"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"

interface GlobalIncident {
  id: number
  date: string
  type: "ADJUSTMENT" | "ABSENCE" | "LATE" | "OVERTIME" | "SICK_LEAVE"
  hours: number
  reason: string
  performedBy: string
  employee: {
    firstName: string
    lastName: string
    profession: string
  }
}

const typeLabels = {
  ADJUSTMENT: { label: "Anpassung", color: "bg-slate-100 text-slate-700 border-slate-200", icon: "settings_accessibility" },
  ABSENCE: { label: "Fehlzeit", color: "bg-rose-100 text-rose-700 border-rose-200", icon: "person_off" },
  SICK_LEAVE: { label: "Krankheit (AU)", color: "bg-purple-100 text-purple-700 border-purple-200", icon: "medical_services" }, // El icono médico
  LATE: { label: "Verspätung", color: "bg-amber-100 text-amber-700 border-amber-200", icon: "alarm" },
  OVERTIME: { label: "Überstunden", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "add_circle" }
}

export default function GlobalIncidentsPage() {
  const [incidents, setIncidents] = useState<GlobalIncident[]>([])
  const [loading, setLoading] = useState(true)

  const [filterType, setFilterType] = useState("ALL")
  const [search, setSearch] = useState("")

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch("/api/incidents")
        const data = await res.json()
        setIncidents(data)
      } catch (error) {
        console.error("Fehler", error)
      } finally {
        setLoading(false)
      }
    }
    fetchIncidents()
  }, [])

  // 1. CALCULAR ESTADÍSTICAS DEL MES ACTUAL
  const currentMonthStats = useMemo(() => {
    const now = new Date()
    const thisMonthIncidents = incidents.filter(inc => {
      const incDate = new Date(inc.date)
      return incDate.getMonth() === now.getMonth() && incDate.getFullYear() === now.getFullYear()
    })

    return {
      absences: thisMonthIncidents.filter(i => i.type === "ABSENCE").length,
      lates: thisMonthIncidents.filter(i => i.type === "LATE").length,
      lateHours: thisMonthIncidents.filter(i => i.type === "LATE").reduce((acc, curr) => acc + curr.hours, 0),
      overtime: thisMonthIncidents.filter(i => i.type === "OVERTIME").reduce((acc, curr) => acc + curr.hours, 0),
      adjustments: thisMonthIncidents.filter(i => i.type === "ADJUSTMENT").length
    }
  }, [incidents])

  // 2. LÓGICA DE FILTRADO PARA LA TABLA
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchesType = filterType === "ALL" || inc.type === filterType
      
      const searchLower = search.toLowerCase()
      const employeeFullName = `${inc.employee.firstName} ${inc.employee.lastName}`.toLowerCase()
      
      const matchesSearch = 
        employeeFullName.includes(searchLower) || 
        inc.reason.toLowerCase().includes(searchLower)

      return matchesType && matchesSearch
    })
  }, [incidents, filterType, search])

  if (loading) return (
    <div className="p-10 text-center text-slate-500 font-bold flex flex-col items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
      Lade Vorfälle...
    </div>
  )

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-[#f8fafc]">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sicherheits & Kontrollzentrum</h1>
        <p className="text-slate-500 mt-2 font-medium">Globale Übersicht aller Vorfälle, Fehlzeiten und Anpassungen.</p>
      </div>

      {/* KPI CARDS (Estadísticas del mes) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-rose-100 shadow-sm shadow-rose-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">person_off</span>
            </div>
            <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded">Dieser Monat</span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">{currentMonthStats.absences}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Fehlzeiten (Faltas)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-amber-100 shadow-sm shadow-amber-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">alarm</span>
            </div>
            <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded">Dieser Monat</span>
          </div>
          <div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-slate-900">{currentMonthStats.lates}</p>
              <p className="text-sm font-bold text-rose-500 mb-1">({currentMonthStats.lateHours}h)</p>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Verspätungen</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-sm shadow-emerald-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">add_circle</span>
            </div>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded">Dieser Monat</span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">{currentMonthStats.overtime}h</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Überstunden</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">settings_accessibility</span>
            </div>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded">Dieser Monat</span>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">{currentMonthStats.adjustments}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manuelle Anpassungen</p>
          </div>
        </div>
      </div>

      {/* ÁREA DE FILTROS Y TABLA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Filtros */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="Mitarbeiter oder Begründung suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-blue-100 min-w-[200px]"
          >
            <option value="ALL">Alle Kategorien (Todos)</option>
            <option value="ABSENCE">🔴 Fehlzeiten</option>
            <option value="SICK_LEAVE">🟣 Krankheit (AU)</option>
            <option value="LATE">🟠 Verspätungen</option>
            <option value="OVERTIME">🟢 Überstunden</option>
            <option value="ADJUSTMENT">⚪ Manuelle Anpassungen</option>
          </select>
        </div>

        {/* Tabla Global */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Datum</th>
                <th className="px-8 py-5">Mitarbeiter</th>
                <th className="px-8 py-5">Kategorie</th>
                <th className="px-8 py-5">Stunden</th>
                <th className="px-8 py-5">Begründung (Justificación)</th>
                <th className="px-8 py-5">Erfasst von</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-200 mb-3 block">verified_user</span>
                    <p className="text-slate-500 font-bold text-lg">Keine Vorfälle gefunden.</p>
                    <p className="text-slate-400 text-sm mt-1">Das System ist sauber.</p>
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-4">
                      <p className="font-bold text-slate-700">
                        {new Date(inc.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                        {new Date(inc.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                      </p>
                    </td>
                    
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                          {inc.employee.firstName.charAt(0)}{inc.employee.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{inc.employee.firstName} {inc.employee.lastName}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide">{inc.employee.profession || 'Mitarbeiter'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${typeLabels[inc.type].color}`}>
                        <span className="material-symbols-outlined text-[14px]">{typeLabels[inc.type].icon}</span>
                        {typeLabels[inc.type].label}
                      </div>
                    </td>

                    <td className={`px-8 py-4 font-black text-base ${inc.hours < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {inc.hours > 0 ? `+${inc.hours}` : inc.hours} <span className="text-[10px] font-bold text-slate-400 uppercase">h</span>
                    </td>

                    <td className="px-8 py-4">
                      <p className="font-medium text-slate-700 leading-snug max-w-sm">{inc.reason}</p>
                    </td>

                    <td className="px-8 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-tight">
                        {inc.performedBy}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}