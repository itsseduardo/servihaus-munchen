"use client"

import { useState } from "react"

interface Props {
  task: any
  onClose: () => void
  onSuccess: (updatedTask: any) => void
}

function getPlannedHours(task: any) {
  return Number(
    task.teamDuration ??
      task.duration ??
      task.billedHours ??
      task.estimatedDuration ??
      0
  )
}

function formatHours(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "geplanten"

  const totalMinutes = Math.round(value * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`
  if (hours > 0) return `${hours}h`
  return `${minutes}min`
}

function getWorkedHours(task: any) {
  const startValue =
    task.assignmentActualStartTime ||
    task.actualStartTime ||
    null

  if (!startValue) return null

  const start = new Date(startValue)

  if (Number.isNaN(start.getTime())) return null

  const now = new Date()

  return (now.getTime() - start.getTime()) / (1000 * 60 * 60)
}

export default function OvertimeModal({ task, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const plannedHours = getPlannedHours(task)
  const workedHours = getWorkedHours(task)

  async function handleSubmit() {
    try {
      setError("")

      const cleanReason = reason.trim()

      if (cleanReason.length < 10) {
        setError("Bitte gib mindestens 10 Zeichen als Begründung ein.")
        return
      }

      setLoading(true)

      const res = await fetch(`/api/employees/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          overtimeReason: cleanReason,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Die Aufgabe konnte nicht beendet werden.")
        return
      }

      onSuccess(data)
    } catch (error) {
      console.error("OVERTIME SUBMIT ERROR:", error)
      setError("Die Aufgabe konnte nicht beendet werden.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-4 pb-8 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Schließen"
      />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-red-50 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                <span className="material-symbols-outlined text-2xl">
                  warning
                </span>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-500">
                  Zeitüberschreitung
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  Begründung erforderlich
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <p className="text-sm font-semibold leading-6 text-slate-500">
            Du hast länger gebraucht als die geplante Dauer von{" "}
            <span className="font-black text-slate-900">
              {formatHours(plannedHours)}
            </span>
            . Bitte gib kurz den Grund an.
          </p>

          {workedHours !== null && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Geplant
                </p>

                <p className="mt-1 text-lg font-black text-slate-900">
                  {formatHours(plannedHours)}
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-red-400">
                  Deine Zeit
                </p>

                <p className="mt-1 text-lg font-black text-red-700">
                  {formatHours(workedHours)}
                </p>
              </div>
            </div>
          )}

          <textarea
            className="h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            placeholder="z.B. Extremer Schmutz, Kunde hatte Sonderwünsche, Material musste nachgefüllt werden..."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />

          <p className="text-xs font-bold text-slate-400">
            Diese Begründung wird auf deiner persönlichen Zuordnung zum Auftrag
            gespeichert.
          </p>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-50"
          >
            Abbrechen
          </button>

          <button
            type="button"
            disabled={reason.trim().length < 10 || loading}
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-30"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">
                sync
              </span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">
                save
              </span>
            )}

            {loading ? "Speichern..." : "Speichern & Beenden"}
          </button>
        </div>
      </div>
    </div>
  )
}