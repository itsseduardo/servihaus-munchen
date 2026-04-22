"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import EditEmployeeModal from "@/components/admin/EditEmployeeModal"
import AddTimeBlockModal from "@/components/admin/AddTimeBlockModal"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function EmployeeDetailPage() {
  const params = useParams()
  const id = params.id

  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isTimeBlockOpen, setIsTimeBlockOpen] = useState(false)


  useEffect(() => {
    if (id) fetchEmployee()
  }, [id])

  const fetchEmployee = async () => {
    try {
      const res = await fetch(`/api/employees/${id}`)
      const data = await res.json()
      setEmployee(data)
    } catch (error) {
      console.error("Failed to fetch employee", error)
    } finally {
      setLoading(false)
    }
  }

  // Lógica de cálculo siguiendo la normativa alemana
  const calculatedStats = useMemo(() => {
    if (!employee) return null

    let totalServiceHours = 0
    let totalTravelHours = 0

    employee.assignments.forEach((a: any) => {
      if (a.service.status === "completed") {
        // 1. Calcular horas de servicio
        if (a.service.actualStartTime && a.service.actualEndTime) {
          const start = new Date(a.service.actualStartTime)
          const end = new Date(a.service.actualEndTime)
          totalServiceHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        }
        // 2. Sumar tiempo de viaje (TravelTime viene en minutos desde el backend)
        totalTravelHours += (a.service.travelTime || 0) / 60
      }
    })

    const totalIstHours = totalServiceHours + totalTravelHours
    const weeklySoll = employee.contractedHoursPerWeek || 0
    // Balance: Si es negativo, el empleado debe horas.
    const balance = totalIstHours - weeklySoll

    return {
      totalServiceHours,
      totalTravelHours,
      totalIstHours,
      weeklySoll,
      balance,
      earnings: totalIstHours * (employee.hourlyRate || 0)
    }
  }, [employee])

  if (loading) return <div className="p-10 text-center font-bold">Lade Mitarbeiterdaten...</div>
  if (!employee) return <div className="p-10 text-center font-bold">Mitarbeiter nicht gefunden</div>

  const handleExportPDF = () => {
    if (!employee) return

    const doc = new jsPDF()

    // 1. Cabecera del Documento (Estilo Oficial)
    doc.setFontSize(18)
    doc.setTextColor(15, 23, 42) // slate-900
    doc.text("Arbeitszeitnachweis", 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139) // slate-500
    doc.text("Offizielles Protokoll gemäß Arbeitszeitgesetz (ArbZG)", 14, 28)

    // 2. Datos del Empleado y Contrato
    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text(`Mitarbeiter: ${employee.lastName}, ${employee.firstName}`, 14, 40)
    doc.text(`Personal-ID: #${employee.id.toString().padStart(3, '0')}`, 14, 46)

    const empTypeMap: Record<string, string> = {
      MINIJOB_538: "Minijob (538€)",
      MIDIJOB: "Midijob",
      FULL_TIME: "Vollzeit"
    }
    doc.text(`Vertragsart: ${empTypeMap[employee.employmentType] || employee.employmentType}`, 120, 40)
    doc.text(`Soll-Stunden: ${employee.contractedHoursPerWeek || 0} h / Woche`, 120, 46)
    doc.text(`Druckdatum: ${new Date().toLocaleDateString('de-DE')}`, 120, 52)

    // 3. Recopilación y Mezcla de Datos (Servicios + Justificantes)
    const logs: any[] = []

    // A. Servicios completados
    if (employee.assignments) {
      employee.assignments.forEach((a: any) => {
        const s = a.service
        if (s.status === 'completed') {
          const fahrzeit = s.travelTime || 0
          const total = (s.duration || 0) + (fahrzeit / 60)

          logs.push({
            dateObj: new Date(s.date),
            datum: new Date(s.date).toLocaleDateString('de-DE'),
            typ: `Service: ${s.client?.name || 'Kunde'}`,
            start: s.actualStartTime ? new Date(s.actualStartTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '-',
            ende: s.actualEndTime ? new Date(s.actualEndTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '-',
            fahrzeit: `${fahrzeit} min`,
            gesamt: `${total.toFixed(2)} h`
          })
        }
      })
    }

    // B. Bloques de Tiempo (Vacaciones, Enfermedad, Cancelaciones)
    if (employee.timeBlocks) {
      const typeLabels: Record<string, string> = {
        CLIENT_CANCELLED: "Kunden-Stornierung",
        VACATION: "Urlaub",
        SICK: "Krankheit",
        PAID_LEAVE: "Bezahlte Freistellung"
      }

      employee.timeBlocks.forEach((tb: any) => {
        logs.push({
          dateObj: new Date(tb.date),
          datum: new Date(tb.date).toLocaleDateString('de-DE'),
          typ: `Manuell: ${typeLabels[tb.type] || tb.type}`,
          start: "-",
          ende: "-",
          fahrzeit: "-",
          gesamt: `${tb.duration.toFixed(2)} h`
        })
      })
    }

    // 4. Ordenar cronológicamente (Muy importante para la inspección)
    logs.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    // Mapear a formato de tabla
    const tableBody = logs.map(l => [l.datum, l.typ, l.start, l.ende, l.fahrzeit, l.gesamt])

    // 5. Generar la Tabla en el PDF
    autoTable(doc, {
      startY: 65,
      head: [['Datum', 'Aktivität / Kunde', 'Start', 'Ende', 'Fahrzeit', 'Gesamt (h)']],
      body: tableBody,
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' }, // Color primary blue-600
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
      margin: { top: 65 }
    })

    // 6. Firma y Resumen al final
    const finalY = (doc as any).lastAutoTable.finalY || 65
    doc.setFontSize(10)
    doc.text(`Total Dokumentierte Stunden: ${employee.totalPaidHours?.toFixed(2) || 0} h`, 14, finalY + 15)

    doc.line(14, finalY + 40, 80, finalY + 40)
    doc.text("Unterschrift Arbeitgeber (Servihaus)", 14, finalY + 45)

    doc.line(120, finalY + 40, 186, finalY + 40)
    doc.text("Unterschrift Arbeitnehmer", 120, finalY + 45)

    // Guardar y descargar
    doc.save(`Arbeitszeit_${employee.lastName}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="p-10 space-y-8 bg-slate-50/50 min-h-screen">

      {/* HEADER DINÁMICO */}
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-blue-200">
            {employee.firstName[0]}{employee.lastName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-100">
                {employee.employmentType?.replace("_", " ")}
              </span>
              <p className="text-slate-400 font-medium text-sm italic">{employee.profession}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditOpen(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase rounded-xl transition-all"
          >
            Vertrag bearbeiten
          </button>


          <button
            onClick={() => setIsTimeBlockOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Zeit buchen
          </button>


            {/* 🔥 NUEVO BOTÓN: Exportar PDF */}
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              PDF Export
            </button>
         


        </div>

        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wochen-Soll</p>
          <p className="text-2xl font-black text-slate-800">{employee.contractedHoursPerWeek || 0}h <span className="text-sm text-slate-400">/ Woche</span></p>
        </div>
      </div>


      {/* KPI STATS (LIBRO DE HORAS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Ist-Stunden (Arbeit + Weg)</p>
          <p className="text-3xl font-black text-slate-800">{calculatedStats?.totalIstHours.toFixed(2)}h</p>
          <p className="text-[10px] text-slate-400 mt-1">Davon {calculatedStats?.totalTravelHours.toFixed(1)}h Fahrzeit</p>
        </div>

        <div className={`p-6 rounded-2xl border shadow-sm ${calculatedStats && calculatedStats.balance < 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Zeitkonto (Balance)</p>
          <p className={`text-3xl font-black ${calculatedStats && calculatedStats.balance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {calculatedStats?.balance.toFixed(2)}h
          </p>
          <p className="text-[10px] opacity-70 mt-1">{calculatedStats && calculatedStats.balance < 0 ? 'Mitarbeiter schuldet Stunden' : 'Überstunden angesammelt'}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Stundenlohn</p>
          <p className="text-3xl font-black text-slate-800">{employee.hourlyRate?.toFixed(2)} €</p>
          <p className="text-[10px] text-slate-400 mt-1">Brutto pro Stunde</p>
        </div>

        <div className="bg-blue-600 p-6 rounded-2xl border border-blue-700 shadow-lg shadow-blue-200">
          <p className="text-[10px] font-black uppercase text-blue-100 mb-2">Geschätzter Verdienst</p>
          <p className="text-3xl font-black text-white">{calculatedStats?.earnings.toFixed(2)} €</p>
          <p className="text-[10px] text-blue-200 mt-1">Basierend auf Ist-Stunden</p>
        </div>
      </div>

      {/* SERVICE HISTORY - DETALLE LEGAL */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="font-black text-slate-800 uppercase tracking-tighter">Arbeitszeit-Protokoll</h2>
          <button className="text-xs font-bold text-blue-600 hover:underline">Als PDF exportieren (Prüfung)</button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
              <th className="px-8 py-4 text-left">Datum</th>
              <th className="px-8 py-4 text-left">Einsatz / Kunde</th>
              <th className="px-8 py-4 text-left text-blue-600">Arbeitszeit</th>
              <th className="px-8 py-4 text-left text-amber-600">Fahrzeit</th>
              <th className="px-8 py-4 text-left">Total</th>
              <th className="px-8 py-4 text-right">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {employee.assignments.map((a: any) => {
              const start = a.service.actualStartTime ? new Date(a.service.actualStartTime) : null;
              const end = a.service.actualEndTime ? new Date(a.service.actualEndTime) : null;
              const workH = start && end ? (end.getTime() - start.getTime()) / (1000 * 60 * 60) : 0;
              const travelH = (a.service.travelTime || 0) / 60;

              return (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-600">{new Date(a.service.date).toLocaleDateString()}</td>
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800 leading-none">{a.service.serviceCode?.code}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">{a.service.client?.name}</p>
                  </td>
                  <td className="px-8 py-5 font-bold text-blue-600">{workH.toFixed(2)}h</td>
                  <td className="px-8 py-5 font-bold text-amber-600">{travelH.toFixed(2)}h</td>
                  <td className="px-8 py-5 font-black text-slate-800">{(workH + travelH).toFixed(2)}h</td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${a.service.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                      }`}>
                      {a.service.status === "completed" ? "Erledigt" : "Offen"}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDICIÓN DE CONTRATO */}
      {isEditOpen && (
        <EditEmployeeModal
          employee={employee}
          onClose={() => setIsEditOpen(false)}
          onUpdated={fetchEmployee}
        />
      )}

      {/* MODAL PARA JUSTIFICAR HORAS (VACACIONES, CANCELACIONES, ETC) */}
      {isTimeBlockOpen && (
        <AddTimeBlockModal
          employeeId={employee.id}
          onClose={() => setIsTimeBlockOpen(false)}
          onAdded={fetchEmployee} // Esto refrescará los cálculos y el balance automáticamente
        />
      )}

    </div>
  )
}