"use client"

import { useState, useEffect } from "react"

export default function TimeTracker({ onShiftChange }: { onShiftChange?: (isActive: boolean) => void }) {
  const [shift, setShift] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados para el Modal de Justificación
  const [showModal, setShowModal] = useState(false)
  const [justification, setJustification] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar estado inicial del turno
  useEffect(() => {
    fetch("/api/employees/shifts/today")
      .then(res => res.json())
      .then(data => {
        setShift(data)
        if (onShiftChange) onShiftChange(data !== null && data.clockOut === null)
      })
      .finally(() => setLoading(false))
  }, [onShiftChange])

  // Lógica de Entrada (Clock In)
  const handleClockIn = async (forcedJustification?: string) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/employees/shifts/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ justification: forcedJustification })
      })

      const data = await res.json()

      if (!res.ok) {
        // Si el backend dice "Justificación requerida por tardanza", abrimos el modal
        if (data.error === "Justificación requerida por tardanza") {
          setShowModal(true)
        } else {
          alert(data.error)
        }
      } else {
        // Turno iniciado correctamente
        setShift(data)
        setShowModal(false)
        if (onShiftChange) onShiftChange(true)
      }
    } catch (error) {
      console.error(error)
      alert("Fehler bei der Verbindung (Error de conexión)")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Lógica de Salida (Clock Out)
  const handleClockOut = async () => {
    const confirm = window.confirm("Möchtest du deine Schicht beenden? (¿Deseas finalizar tu turno?)")
    if (!confirm) return

    setLoading(true)
    try {
      const res = await fetch("/api/employees/shifts/today", { method: "PATCH" })
      if (res.ok) {
        const data = await res.json()
        setShift(data)
        if (onShiftChange) onShiftChange(false)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="h-24 bg-slate-100 animate-pulse rounded-3xl mb-6"></div>

  // ESTADO 1: Turno Finalizado por hoy
  if (shift?.clockOut) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-emerald-800 font-black text-lg">Schicht beendet</h2>
          <p className="text-emerald-600 font-medium text-xs">Gute Arbeit heute! (¡Buen trabajo hoy!)</p>
        </div>
        <span className="material-symbols-outlined text-4xl text-emerald-400">task_alt</span>
      </div>
    )
  }

  // ESTADO 2: Turno Activo (Trabajando)
  if (shift && !shift.clockOut) {
    const startTime = new Date(shift.clockIn).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    
    return (
      <div className="bg-blue-600 text-white p-6 rounded-3xl mb-6 shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-blue-200 font-bold text-xs uppercase tracking-widest mb-1">Status: Aktiv</p>
            <h2 className="font-black text-2xl">Schicht läuft</h2>
            <p className="text-blue-100 text-sm font-medium mt-1">Gestartet um {startTime} Uhr</p>
          </div>
          <button 
            onClick={handleClockOut}
            className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-4 rounded-2xl font-black text-sm transition-colors shadow-md"
          >
            <span className="material-symbols-outlined block text-center mb-1">logout</span>
            Abmelden
          </button>
        </div>
        <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-9xl text-blue-500 opacity-50">schedule</span>
      </div>
    )
  }

  // ESTADO 3: Turno NO Iniciado
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-3xl mb-6 shadow-sm">
      <div className="text-center mb-4">
        <h2 className="text-slate-900 font-black text-xl">Arbeitsschicht beginnen</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">Bitte stempel dich ein, bevor du startest. (Inicia tu turno antes de trabajar).</p>
      </div>
      
      <button 
        onClick={() => handleClockIn()}
        disabled={isSubmitting}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <span className="material-symbols-outlined">play_circle</span>
        {isSubmitting ? "Wird geladen..." : "Anmelden (Start)"}
      </button>

      {/* MODAL DE JUSTIFICACIÓN (Si llega tarde) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-fade-in">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl">schedule_warning</span>
            </div>
            <h3 className="text-center font-black text-slate-900 text-xl mb-2">Verspätung melden</h3>
            <p className="text-center text-slate-500 text-sm mb-6">
              Du bist zu spät. Bitte gib einen Grund an. (Llegas tarde, por favor justifica el motivo para el administrador).
            </p>
            
            <textarea 
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="z.B. Zug hatte 10 Min. Verspätung..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 mb-4 h-28 resize-none font-medium"
            ></textarea>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-xl"
              >
                Abbrechen
              </button>
              <button 
                onClick={() => handleClockIn(justification)}
                disabled={justification.length < 5 || isSubmitting}
                className="flex-1 py-3 text-white font-bold bg-orange-500 rounded-xl disabled:opacity-50 shadow-md"
              >
                Senden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}