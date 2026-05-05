"use client"

import { useState, useMemo } from "react"

// Coincide con tu modelo de Prisma
interface AuditLog {
  id: number
  date: string | Date
  type: "ADJUSTMENT" | "ABSENCE" | "LATE" | "OVERTIME"
  hours: number
  reason: string
  performedBy: string
}

interface Props {
  logs: AuditLog[]
}

// Diccionario visual para los tipos de auditoría
const typeLabels = {
  ADJUSTMENT: { label: "Manuelle Anpassung (Ajuste)", color: "bg-slate-100 text-slate-700", icon: "settings_accessibility" },
  ABSENCE: { label: "Fehlzeiten (Falta)", color: "bg-rose-100 text-rose-700 border border-rose-200", icon: "person_off" },
  LATE: { label: "Verspätung (Retraso)", color: "bg-amber-100 text-amber-700 border border-amber-200", icon: "alarm" },
  OVERTIME: { label: "Überstunden (H. Extra)", color: "bg-emerald-100 text-emerald-700 border border-emerald-200", icon: "add_circle" }
}

export default function EmployeeAuditTab({ logs = [] }: Props) {
  const [filter, setFilter] = useState("ALL")
  const [search, setSearch] = useState("")

  // Lógica de filtrado dual (por texto y por tipo)
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesType = filter === "ALL" || log.type === filter
      const matchesSearch = log.reason.toLowerCase().includes(search.toLowerCase())
      return matchesType && matchesSearch
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Ordenar de más reciente a más antiguo
  }, [logs, filter, search])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER Y FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-900">Arbeitszeitkonto Historie</h3>
          <p className="text-slate-500 text-sm mt-1">Überwachen Sie Fehlzeiten, Verspätungen und Anpassungen.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Buscador de texto */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Begründung suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-700"
            />
          </div>
          
          {/* Filtro por tipo */}
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">Alle Vorfälle (Todos)</option>
            <option value="ABSENCE">Fehlzeiten (Faltas)</option>
            <option value="LATE">Verspätungen (Retrasos)</option>
            <option value="ADJUSTMENT">Manuelle Anpassungen</option>
            <option value="OVERTIME">Überstunden (Extras)</option>
          </select>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
              <th className="px-8 py-5">Datum</th>
              <th className="px-8 py-5">Typ</th>
              <th className="px-8 py-5">Stunden</th>
              <th className="px-8 py-5">Begründung (Justificación)</th>
              <th className="px-8 py-5">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-200 mb-3 block">history_toggle_off</span>
                  <p className="text-slate-500 font-bold">Keine Einträge gefunden.</p>
                  <p className="text-slate-400 text-xs mt-1">El historial está limpio para estos filtros.</p>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Fecha */}
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-700">
                      {new Date(log.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">
                      {new Date(log.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                    </p>
                  </td>
                  
                  {/* Tipo de evento */}
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${typeLabels[log.type].color}`}>
                      <span className="material-symbols-outlined text-[14px]">{typeLabels[log.type].icon}</span>
                      {typeLabels[log.type].label}
                    </div>
                  </td>
                  
                  {/* Horas (Verde si es positivo, Rojo si es negativo) */}
                  <td className={`px-8 py-5 font-black text-lg ${log.hours < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {log.hours > 0 ? `+${log.hours}` : log.hours} <span className="text-xs font-bold text-slate-400">h</span>
                  </td>
                  
                  {/* Justificación */}
                  <td className="px-8 py-5">
                    <p className="font-medium text-slate-800 leading-relaxed max-w-md">{log.reason}</p>
                  </td>
                  
                  {/* Admin que lo registró */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-black text-slate-500">
                        {log.performedBy.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {log.performedBy}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}