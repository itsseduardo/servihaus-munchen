"use client"

import { useState } from "react"

interface Props {
  task: any
  onClose: () => void
  onSuccess: (updatedTask: any) => void
}

function getExpectedDuration(task: any) {
  return task.teamDuration ?? task.duration ?? task.billedHours ?? 2
}

export default function OvertimeModal({ task, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    try {
      setError("")
      setLoading(true)

      const res = await fetch(`/api/employees/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          overtimeReason: reason,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Die Begründung konnte nicht gespeichert werden.")
        return
      }

      onSuccess(data)
    } catch {
      setError("Die Begründung konnte nicht gespeichert werden.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Modal schließen"
      />

      <div className="relative z-10 w-full max-w-lg rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <span className="material-symbols-outlined text-3xl">
              schedule_warning
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-amber-600">
          Zeitüberschreitung
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Warum hat der Service länger gedauert?
        </h2>

        <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
          Die geplante Dauer beträgt ungefähr{" "}
          <span className="font-black text-slate-800">
            {getExpectedDuration(task)} Stunden
          </span>
          . Bitte gib kurz den Grund an, damit der Administrator die Information
          später prüfen kann.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="z.B. zusätzliche Verschmutzung, Kunde bat um extra Bereich, Schlüsselübergabe dauerte länger..."
          className="mt-5 h-36 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-50"
        />

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-600 transition-all hover:bg-slate-50"
          >
            Abbrechen
          </button>

          <button
            type="button"
            disabled={reason.trim().length < 10 || loading}
            onClick={handleSubmit}
            className="flex-1 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Speichern..." : "Speichern & Beenden"}
          </button>
        </div>
      </div>
    </div>
  )
}