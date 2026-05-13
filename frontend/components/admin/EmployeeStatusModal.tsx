"use client"

import { useState } from "react"

type Employee = {
  id: number
  firstName: string
  lastName: string
  isActive?: boolean
  active?: boolean
  inactiveReason?: string | null
  inactiveDetails?: string | null
  inactiveUntil?: string | null
}

type Props = {
  employee: Employee
  onClose: () => void
  onSaved: () => void
}

const INACTIVE_REASONS = [
  { value: "SICK_LEAVE", label: "Krankmeldung" },
  { value: "MEDICAL_LEAVE", label: "Medizinische Abwesenheit" },
  { value: "TERMINATED", label: "Kündigung / Entlassung" },
  { value: "SUSPENDED", label: "Suspendiert" },
  { value: "VACATION", label: "Urlaub / Freistellung" },
  { value: "UNPAID_VACATION", label: "Unbezahltener Urlaub" },
  { value: "OTHER", label: "Sonstiges" },
]

function getEmployeeName(employee: Employee) {
  return `${employee.firstName} ${employee.lastName}`.trim()
}

export default function EmployeeStatusModal({
  employee,
  onClose,
  onSaved,
}: Props) {
  const isCurrentlyActive = employee.isActive !== false

  const [mode, setMode] = useState<"activate" | "deactivate">(
    isCurrentlyActive ? "deactivate" : "activate"
  )
  const [inactiveReason, setInactiveReason] = useState(
    employee.inactiveReason || "SICK_LEAVE"
  )
  const [inactiveDetails, setInactiveDetails] = useState(
    employee.inactiveDetails || ""
  )
  const [inactiveUntil, setInactiveUntil] = useState(
    employee.inactiveUntil ? employee.inactiveUntil.slice(0, 10) : ""
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    try {
      setError("")
      setLoading(true)

      const payload =
        mode === "activate"
          ? {
              isActive: true,
            }
          : {
              isActive: false,
              inactiveReason,
              inactiveDetails,
              inactiveUntil: inactiveUntil || null,
            }

      if (mode === "deactivate" && !inactiveReason) {
        setError("Bitte wählen Sie einen Grund aus.")
        setLoading(false)
        return
      }

      const res = await fetch(`/api/employees/${employee.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Status konnte nicht gespeichert werden.")
        return
      }

      onSaved()
      onClose()
    } catch {
      setError("Status konnte nicht gespeichert werden.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Schließen"
      />

      <div className="relative z-10 w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Mitarbeiterstatus
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {getEmployeeName(employee)}
            </h2>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Aktueller Status:{" "}
              <span
                className={
                  isCurrentlyActive
                    ? "font-black text-emerald-600"
                    : "font-black text-rose-600"
                }
              >
                {isCurrentlyActive ? "Aktiv" : "Inaktiv"}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-2">
          <button
            type="button"
            onClick={() => setMode("deactivate")}
            className={`rounded-xl px-4 py-3 text-sm font-black transition-all ${
              mode === "deactivate"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-100"
                : "text-slate-500 hover:bg-white"
            }`}
          >
            Inaktiv setzen
          </button>

          <button
            type="button"
            onClick={() => setMode("activate")}
            className={`rounded-xl px-4 py-3 text-sm font-black transition-all ${
              mode === "activate"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                : "text-slate-500 hover:bg-white"
            }`}
          >
            Aktiv setzen
          </button>
        </div>

        {mode === "deactivate" ? (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Grund
              </label>

              <select
                value={inactiveReason}
                onChange={(event) => setInactiveReason(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                {INACTIVE_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Bis wann? Optional
              </label>

              <input
                type="date"
                value={inactiveUntil}
                onChange={(event) => setInactiveUntil(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Details / interne Notiz
              </label>

              <textarea
                value={inactiveDetails}
                onChange={(event) => setInactiveDetails(event.target.value)}
                rows={4}
                placeholder="z.B. Krankmeldung bis zur nächsten ärztlichen Rückmeldung..."
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-emerald-600">
                check_circle
              </span>

              <div>
                <p className="text-sm font-black text-emerald-800">
                  Mitarbeiter reaktivieren
                </p>

                <p className="mt-1 text-sm font-medium leading-6 text-emerald-700">
                  Der Mitarbeiter kann danach wieder normal auf sein Dashboard
                  zugreifen und Aufgaben bearbeiten.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Abbrechen
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`rounded-2xl px-5 py-3 text-sm font-black text-white disabled:opacity-50 ${
              mode === "activate"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {loading
              ? "Speichern..."
              : mode === "activate"
                ? "Aktivieren"
                : "Inaktiv setzen"}
          </button>
        </div>
      </div>
    </div>
  )
}