"use client"

import { useState } from "react"

interface PayrollRecord {
  id: number
  month: number
  year: number
  workedHours: number
  brutto: number
  svAbzuege: number
  steuerAbzuege: number
  netto: number
  totalCost: number
}

interface Props {
  employeeId: number
  records: PayrollRecord[]
  onUpdate: () => void
}

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]

export default function EmployeePayrollTab({ employeeId, records, onUpdate }: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  // Estado del formulario
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    workedHours: "",
    brutto: "",
    svAbzuege: "",
    steuerAbzuege: "",
    netto: "",
    totalCost: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/employees/${employeeId}/payroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Fehler beim Speichern")
        return
      }

      setIsAdding(false)
      onUpdate() // Recarga los datos del empleado
    } catch (error) {
      alert("Systemfehler")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* HEADER DE LA PESTAÑA */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-900">Lohn & Kosten Übersicht</h3>
          <p className="text-slate-500 text-sm mt-1">Reale Arbeitgeberkosten basierend auf der Lohnabrechnung.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">{isAdding ? 'close' : 'add'}</span>
          {isAdding ? 'Abbrechen' : 'Neuen Monat eintragen'}
        </button>
      </div>

      {/* FORMULARIO PARA AGREGAR NUEVO MES (Se oculta/muestra) */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Monat</label>
              <select 
                value={formData.month} onChange={e => setFormData({...formData, month: Number(e.target.value)})}
                className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-700 outline-none focus:border-blue-500"
              >
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Jahr</label>
              <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-700 outline-none focus:border-blue-500"/>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Ist-Stunden (Gearbeitet)</label>
              <input type="number" step="0.5" required placeholder="z.B. 42.5" value={formData.workedHours} onChange={e => setFormData({...formData, workedHours: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-700 outline-none focus:border-blue-500"/>
            </div>
          </div>

          {/* LA TABLITA DEL EXCEL */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Bruttolohn (€)</label>
              <input type="number" step="0.01" required value={formData.brutto} onChange={e => setFormData({...formData, brutto: e.target.value})} className="w-full p-2 bg-slate-50 rounded-lg border-none font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"/>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-rose-500 mb-1 block">SV-Abzüge (€)</label>
              <input type="number" step="0.01" required value={formData.svAbzuege} onChange={e => setFormData({...formData, svAbzuege: e.target.value})} className="w-full p-2 bg-rose-50 rounded-lg border-none font-bold text-rose-700 outline-none focus:ring-2 focus:ring-rose-100"/>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-rose-500 mb-1 block">Steuer-Abzüge (€)</label>
              <input type="number" step="0.01" required value={formData.steuerAbzuege} onChange={e => setFormData({...formData, steuerAbzuege: e.target.value})} className="w-full p-2 bg-rose-50 rounded-lg border-none font-bold text-rose-700 outline-none focus:ring-2 focus:ring-rose-100"/>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-emerald-500 mb-1 block">Netto (€)</label>
              <input type="number" step="0.01" required value={formData.netto} onChange={e => setFormData({...formData, netto: e.target.value})} className="w-full p-2 bg-emerald-50 rounded-lg border-none font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-100"/>
            </div>
            <div className="border-l-2 border-indigo-100 pl-4">
              <label className="text-[10px] font-black uppercase text-indigo-600 mb-1 block">Arbeitgeberkosten</label>
              <input type="number" step="0.01" required placeholder="Total Cost" value={formData.totalCost} onChange={e => setFormData({...formData, totalCost: e.target.value})} className="w-full p-2 bg-indigo-50 rounded-lg border-none font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-200"/>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all">
              {loading ? "Speichern..." : "Daten speichern"}
            </button>
          </div>
        </form>
      )}

      {/* TABLA HISTÓRICA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {records.length === 0 ? (
          <div className="p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">request_quote</span>
            <p className="text-slate-500 font-medium">Noch keine Lohnabrechnungen hinterlegt.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4 text-left">Zeitraum</th>
                <th className="px-6 py-4 text-center">Stunden</th>
                <th className="px-6 py-4 text-right">Brutto</th>
                <th className="px-6 py-4 text-right text-rose-500">Abzüge (SV + Steuer)</th>
                <th className="px-6 py-4 text-right text-emerald-600">Netto</th>
                <th className="px-6 py-4 text-right text-indigo-600">Gesamtkosten</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.sort((a,b) => b.year - a.year || b.month - a.month).map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{MONTHS[rec.month - 1]} {rec.year}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-600">{rec.workedHours}h</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-600">{rec.brutto.toFixed(2)} €</td>
                  <td className="px-6 py-4 text-right font-medium text-rose-500">
                    -{(rec.svAbzuege + rec.steuerAbzuege).toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">{rec.netto.toFixed(2)} €</td>
                  <td className="px-6 py-4 text-right font-black text-indigo-700 bg-indigo-50/30">{rec.totalCost.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}