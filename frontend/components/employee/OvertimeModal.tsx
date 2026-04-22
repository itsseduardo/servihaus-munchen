"use client"
import { useState } from "react"

interface Props {
  task: any
  onClose: () => void
  onSuccess: (updatedTask: any) => void
}

export default function OvertimeModal({ task, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/employees/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", overtimeReason: reason })
      })

      if (res.ok) {
        const updated = await res.json()
        onSuccess(updated)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm p-4 pb-12">
      <div className="bg-white w-full rounded-3xl p-6 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl font-bold">warning</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <h2 className="text-xl font-black text-slate-900">Zeitüberschreitung</h2>
        <p className="text-sm font-semibold text-gray-500 mt-2">
          Du hast länger gebraucht als die geplanten {task.estimatedDuration} Stunden. Bitte gib kurz den Grund an:
        </p>

        <textarea 
          className="w-full mt-5 h-28 rounded-xl border border-gray-300 p-4 text-sm font-semibold outline-none focus:border-[#1173d4] focus:ring-2 focus:ring-blue-50 transition-all resize-none"
          placeholder="z.B. Extremer Schmutz, Kunde hatte Sonderwünsche..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <button 
          disabled={reason.length < 10 || loading}
          onClick={handleSubmit}
          className="w-full mt-5 py-4 bg-slate-900 text-white rounded-xl font-extrabold uppercase text-xs tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black transition-colors flex justify-center items-center gap-2"
        >
          <span className="material-symbols-outlined">save</span>
          {loading ? "Speichern..." : "Speichern & Beenden"}
        </button>
      </div>
    </div>
  )
}