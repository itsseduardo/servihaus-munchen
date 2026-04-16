"use client"

import { useState } from "react"

interface Props {
  employeeId: number
  onClose: () => void
  onAdded: () => void
}

export default function AddTimeBlockModal({ employeeId, onClose, onAdded }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [duration, setDuration] = useState("")
  const [type, setType] = useState("CLIENT_CANCELLED")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!duration || Number(duration) <= 0) {
      alert("Bitte geben Sie eine gültige Dauer ein.")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/time-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          date,
          duration: Number(duration),
          type,
          reason,
        }),
      })

      if (res.ok) {
        onAdded()
        onClose()
      }
    } catch (error) {
      console.error("Error adding time block:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border">
        <div className="px-8 py-6 border-b bg-slate-50/50">
          <h2 className="text-lg font-black uppercase tracking-tighter">Zeit manuell buchen</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Stundenkonto korrigieren / Justificar Horas</p>
        </div>

        <div className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Grund / Motivo</label>
            <select 
              className="w-full h-11 rounded-xl border px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="CLIENT_CANCELLED">Kunden-Stornierung (Bezahlt)</option>
              <option value="VACATION">Urlaub (Vacaciones)</option>
              <option value="SICK">Krankheit (Enfermedad)</option>
              <option value="PAID_LEAVE">Bezahlte Freistellung</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Datum</label>
              <input 
                type="date" 
                className="w-full h-11 rounded-xl border px-4 text-sm font-medium"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 text-blue-600">Dauer (Stunden)</label>
              <input 
                type="number" 
                step="0.5"
                placeholder="z.B. 2.5"
                className="w-full h-11 rounded-xl border-2 border-blue-100 px-4 text-sm font-black focus:border-blue-500 outline-none"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Notiz (Intern)</label>
            <textarea 
              className="w-full h-20 p-4 rounded-xl border text-sm resize-none outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Zusätzliche Infos..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="px-8 py-6 border-t bg-slate-50/50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border font-bold text-sm hover:bg-white transition-colors">Abbrechen</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? "Wird gebucht..." : "Zeit buchen"}
          </button>
        </div>
      </div>
    </div>
  )
}