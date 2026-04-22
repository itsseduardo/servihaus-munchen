"use client"
import { useState } from "react"

interface Props {
  task: any
  onOvertimeTriggered: (task: any) => void
  onStatusUpdated: (updatedTask: any) => void
}

export default function TaskCard({ task, onOvertimeTriggered, onStatusUpdated }: Props) {
  const [loading, setLoading] = useState(false)

  // API Call para actualizar el estado del servicio
  const updateStatus = async (newStatus: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/employees/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        const updated = await res.json()
        onStatusUpdated(updated) // Avisamos a la página principal que cambió
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setLoading(false)
    }
  }

  // Lógica inteligente para el botón de "Terminar"
  const handleFinishWork = () => {
    const now = new Date()
    const startTime = task.actualStartTime ? new Date(task.actualStartTime) : new Date(now.getTime() - (2 * 60 * 60 * 1000)) // Fallback seguro
    const workedHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    
    if (workedHours > task.estimatedDuration) {
      onOvertimeTriggered(task) // Dispara el modal en la página principal
    } else {
      updateStatus("completed") // Todo normal, termina y guarda hora
    }
  }

  if (task.status === "completed") return null

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col transition-all ${task.status === 'in_progress' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200'}`}>
      <div className="p-5 flex flex-col gap-4">
        
        {/* CABECERA */}
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-xs font-black tracking-widest uppercase mb-1 ${task.status === 'in_progress' ? 'text-emerald-600' : 'text-[#1173d4]'}`}>
              {task.status === 'assigned' ? 'Anstehend' : task.status === 'traveling' ? 'Unterwegs' : task.status === 'in_progress' ? 'In Arbeit' : 'Geplant'}
            </p>
            <p className="text-2xl font-extrabold text-slate-900">{task.timeWindow}</p>
          </div>
          {task.requiresKey ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
              <span className="material-symbols-outlined text-[16px] font-bold">key</span>
              <span className="text-[10px] font-extrabold uppercase">Key Req.</span>
            </div>
          ) : (
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
              <span className="material-symbols-outlined text-[16px]">key_off</span>
              <span className="text-[10px] font-extrabold uppercase">No Key</span>
            </div>
          )}
        </div>

        {/* INFO CLIENTE */}
        <div className="flex items-center gap-4 py-3 border-y border-gray-50">
          <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center text-[#1173d4]">
            <span className="material-symbols-outlined text-2xl">location_city</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-500">{task.clientName}</p>
            <p className="text-lg font-bold text-slate-900">{task.clientId}</p>
            <p className="text-xs font-semibold text-gray-400 mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">map</span> {task.address}
            </p>
          </div>
        </div>

        {/* BOTONES (MÁQUINA DE ESTADOS) */}
        <div className="flex gap-3 mt-2">
          {task.status === "assigned" && (
            <button disabled={loading} onClick={() => updateStatus("traveling")} className="flex-1 bg-[#1173d4] hover:bg-blue-700 text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined">directions_car</span>
              {loading ? "..." : "Fahrt beginnen"}
            </button>
          )}

          {task.status === "traveling" && (
            <button disabled={loading} onClick={() => updateStatus("in_progress")} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50">
              <span className="material-symbols-outlined">location_on</span>
              {loading ? "..." : "Ankunft & Beginn"}
            </button>
          )}

          {task.status === "in_progress" && (
            <button disabled={loading} onClick={handleFinishWork} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50">
              <span className="material-symbols-outlined animate-pulse">check_circle</span>
              {loading ? "..." : "Arbeit beenden"}
            </button>
          )}

          <button className="w-[56px] h-[56px] border-2 border-gray-200 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined">info</span>
          </button>
        </div>
      </div>
    </div>
  )
}