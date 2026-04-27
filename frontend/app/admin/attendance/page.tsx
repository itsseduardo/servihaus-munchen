"use client"
import { useState, useEffect } from "react"

export default function AttendancePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchAttendance = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/attendance")
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { fetchAttendance() }, [])

  if (loading || !data) return <div className="p-20 text-center font-black animate-pulse text-blue-600">LADE PROTOKOLL...</div>

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-6 lg:p-12">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Audit-Log & Zeiterfassung</h1>
        <p className="text-sm font-bold text-slate-500 mt-1">Historial completo de asistencias y ajustes manuales de José</p>
      </header>

      <div className="space-y-12">
        
        {/* BLOQUE A: ASISTENCIA DIARIA (Clock-In/Out) */}
        <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">history</span>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Tägliche Anwesenheit (Asistencia)</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">Mitarbeiter</th>
                <th className="px-6 py-4">Datum</th>
                <th className="px-6 py-4">Clock In/Out</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Justificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.shifts.map((shift: any) => (
                <tr key={shift.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-900">{shift.employee.firstName}</td>
                  <td className="px-6 py-4 text-slate-500 font-bold">{new Date(shift.date).toLocaleDateString('de-DE')}</td>
                  <td className="px-6 py-4 font-mono text-xs text-blue-600">
                    {new Date(shift.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                    {shift.clockOut && ` - ${new Date(shift.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${shift.status === 'LATE' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {shift.status === 'LATE' ? 'Verspätung' : 'Pünktlich'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs italic text-slate-500 font-medium max-w-xs truncate">
                    {shift.justification || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* BLOQUE B: HISTORIAL DE AJUSTES MANUALES (Zeit buchen) */}
        <section className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-purple-50/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">edit_calendar</span>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Manuelle Korrekturen (Ajustes de José)</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-[10px] font-black uppercase text-slate-400 tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">Mitarbeiter</th>
                <th className="px-6 py-4">Kunde / Service</th>
                <th className="px-6 py-4">Datum</th>
                <th className="px-6 py-4">Ajuste / Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.manualAdjustments.map((srv: any) => (
                <tr key={srv.id} className="hover:bg-purple-50/30 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-900">
                    {srv.assignments?.[0]?.employee?.firstName || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{srv.client.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{srv.serviceCodeId || "Standard"}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-bold">{new Date(srv.date).toLocaleDateString('de-DE')}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {srv.overtimeJustification && (
                        <p className="text-[10px] bg-slate-100 text-slate-600 p-1.5 rounded-lg border border-slate-200 italic">
                          <span className="font-black not-italic mr-1">EE:</span> "{srv.overtimeJustification}"
                        </p>
                      )}
                      {srv.adminNotes && (
                        <p className="text-[10px] bg-purple-100 text-purple-700 p-1.5 rounded-lg border border-purple-200 font-bold">
                          <span className="font-black mr-1">JOSÉ:</span> {srv.adminNotes}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}