"use client"

import { useState } from "react"

interface Props {
  employee: any
  onClose: () => void
  onUpdated: () => void
}

export default function EditEmployeeModal({ employee, onClose, onUpdated }: Props) {
  const [firstName, setFirstName] = useState(employee.firstName)
  const [lastName, setLastName] = useState(employee.lastName)
  const [profession, setProfession] = useState(employee.profession)
  const [email, setEmail] = useState(employee.email)
  const [phone, setPhone] = useState(employee.phone || "")
  const [hourlyRate, setHourlyRate] = useState(employee.hourlyRate?.toString() || "")
  const [employmentType, setEmploymentType] = useState(employee.employmentType || "MINIJOB_538")
  const [contractedHoursPerWeek, setContractedHoursPerWeek] = useState(employee.contractedHoursPerWeek?.toString() || "")
  const [vacationDaysPerYear, setVacationDaysPerYear] = useState(employee.vacationDaysPerYear?.toString() || "20")
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          profession,
          email,
          phone,
          hourlyRate: hourlyRate ? Number(hourlyRate) : null,
          employmentType,
          contractedHoursPerWeek: contractedHoursPerWeek ? Number(contractedHoursPerWeek) : null,
          vacationDaysPerYear: Number(vacationDaysPerYear),
        }),
      })

      if (res.ok) {
        onUpdated()
        onClose()
      }
    } catch (error) {
      console.error("Update error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-8 py-6 border-b flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Vertrag bearbeiten</h2>
            <p className="text-xs text-slate-500 font-bold">Änderungen am Arbeitsverhältnis von {employee.firstName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Datos básicos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Vorname</label>
              <input className="w-full h-11 rounded-xl border px-4 text-sm font-medium" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nachname</label>
              <input className="w-full h-11 rounded-xl border px-4 text-sm font-medium" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          {/* Configuración de Contrato */}
          <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Konditionen</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Anstellungsart</label>
                <select className="w-full h-11 rounded-xl border bg-white px-3 text-sm font-bold" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
                  <option value="MINIJOB_603">Minijob (603€)</option>
                  <option value="MIDIJOB">Midijob</option>
                  <option value="FULL_TIME">Vollzeit</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Stundenlohn (€)</label>
                <input type="number" step="0.5" className="w-full h-11 rounded-xl border px-4 text-sm font-black text-blue-700" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase text-blue-600">Soll-Stunden (Woche)</label>
                <input type="number" className="w-full h-11 rounded-xl border-2 border-blue-200 px-4 text-sm font-black" value={contractedHoursPerWeek} onChange={(e) => setContractedHoursPerWeek(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Urlaubstage (Jahr)</label>
                <input type="number" className="w-full h-11 rounded-xl border px-4 text-sm" value={vacationDaysPerYear} onChange={(e) => setVacationDaysPerYear(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 border-t flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border font-bold text-sm">Abbrechen</button>
          <button onClick={handleUpdate} disabled={loading} className="px-8 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg">
            {loading ? "Wird aktualisiert..." : "Vertrag aktualisieren"}
          </button>
        </div>
      </div>
    </div>
  )
}