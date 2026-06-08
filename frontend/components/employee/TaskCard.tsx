"use client"

import { useState } from "react"

type TaskStatus = "assigned" | "traveling" | "in_progress" | "completed"

interface Props {
  task: any
  onOvertimeTriggered: (task: any) => void
  onStatusUpdated: (updatedTask: any) => void
  onOpenInfo?: () => void
}

function getStatusLabel(status: string) {
  switch (status) {
    case "assigned":
      return "Anstehend"
    case "traveling":
      return "Unterwegs"
    case "in_progress":
      return "In Arbeit"
    case "completed":
      return "Abgeschlossen"
    default:
      return "Geplant"
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "assigned":
      return "bg-slate-100 text-slate-600"
    case "traveling":
      return "bg-blue-50 text-blue-700"
    case "in_progress":
      return "bg-amber-50 text-amber-700"
    case "completed":
      return "bg-emerald-50 text-emerald-700"
    default:
      return "bg-slate-100 text-slate-600"
  }
}

function normalizeStatus(status?: string | null): TaskStatus {
  if (
    status === "assigned" ||
    status === "traveling" ||
    status === "in_progress" ||
    status === "completed"
  ) {
    return status
  }

  return "assigned"
}

function formatTime(dateValue?: string | Date | null) {
  if (!dateValue) return ""

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function formatDate(dateValue?: string | Date | null) {
  if (!dateValue) return ""

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

function getTimeDisplay(task: any) {
  if (task.timeWindow) return `${task.timeWindow} Uhr`

  if (task.startTime) {
    const start = formatTime(task.startTime)
    const duration = task.teamDuration ?? task.duration ?? task.billedHours

    if (duration) {
      const endDate = new Date(task.startTime)
      endDate.setMinutes(endDate.getMinutes() + Number(duration) * 60)

      return `${start} - ${formatTime(endDate)} Uhr`
    }

    return `${start} Uhr`
  }

  return "Zeit ausstehend"
}

function getDurationLabel(task: any) {
  const duration = task.teamDuration ?? task.duration ?? task.billedHours

  if (!duration) return "Dauer offen"

  const totalMinutes = Math.round(Number(duration) * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`
  if (hours > 0) return `${hours}h`
  return `${minutes}min`
}

function getAssignmentStartTime(task: any) {
  return task.assignmentActualStartTime || null
}

function getAssignmentTravelStartTime(task: any) {
  return task.assignmentActualTravelStartTime || null
}

function getAssignmentEndTime(task: any) {
  return task.assignmentActualEndTime || null
}

function getWorkedHours(task: any, endDate = new Date()) {
  const startValue = getAssignmentStartTime(task)

  if (!startValue) return 0

  const startDate = new Date(startValue)

  if (Number.isNaN(startDate.getTime())) return 0

  return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
}

function getActualTimeSummary(task: any) {
  const travelStart = getAssignmentTravelStartTime(task)
  const start = getAssignmentStartTime(task)
  const end = getAssignmentEndTime(task)

  if (!travelStart && !start && !end) return null

  return {
    travelStart: formatTime(travelStart),
    start: formatTime(start),
    end: formatTime(end),
  }
}

export default function TaskCard({
  task,
  onOvertimeTriggered,
  onStatusUpdated,
  onOpenInfo,
}: Props) {
  const [loadingStatus, setLoadingStatus] = useState<TaskStatus | null>(null)
  const [error, setError] = useState("")

  const status = normalizeStatus(task.assignmentStatus || task.status)
  const serviceStatus = normalizeStatus(task.serviceStatus || task.status)

  const clientName = task.client?.name || "Kunde"
  const serviceCode = task.serviceCode?.code || task.code || "Service"
  const serviceDescription =
    task.serviceCode?.description || task.code || "Reinigung"
  const address = task.address || task.client?.address || "Keine Adresse angegeben"
  const requiresKey = Boolean(task.requiresKey || task.client?.requiresKey)
  const importantNotes = task.importantNotes || ""
  const notes = task.notes || ""
  const actualTimeSummary = getActualTimeSummary(task)

  async function updateStatus(newStatus: TaskStatus) {
    try {
      setError("")
      setLoadingStatus(newStatus)

      const res = await fetch(`/api/employees/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Status konnte nicht aktualisiert werden.")
        return
      }

      onStatusUpdated(data)
    } catch {
      setError("Status konnte nicht aktualisiert werden.")
    } finally {
      setLoadingStatus(null)
    }
  }

  function handleFinishWork() {
    const now = new Date()
    const expectedHours =
      Number(task.teamDuration ?? task.duration ?? task.billedHours ?? 2) || 2

    const workedHours = getWorkedHours(task, now)

    if (workedHours > expectedHours + 0.15) {
      onOvertimeTriggered(task)
      return
    }

    updateStatus("completed")
  }

  if (status === "completed") {
    return (
      <article className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              Abgeschlossen
            </span>

            <h3 className="mt-3 text-lg font-black text-slate-950">
              {clientName}
            </h3>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {serviceDescription}
            </p>

            {actualTimeSummary?.start && (
              <p className="mt-2 text-xs font-bold text-emerald-700">
                Deine Zeit: {actualTimeSummary.start}
                {actualTimeSummary.end ? ` - ${actualTimeSummary.end}` : ""}
              </p>
            )}
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <span className="material-symbols-outlined">task_alt</span>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${getStatusStyles(
                  status
                )}`}
              >
                {getStatusLabel(status)}
              </span>

              {serviceStatus !== status && (
                <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                  Auftrag: {getStatusLabel(serviceStatus)}
                </span>
              )}

              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                {serviceCode}
              </span>
            </div>

            <h3 className="mt-3 text-xl font-black text-slate-950">
              {clientName}
            </h3>

            <p className="mt-1 text-sm font-bold text-blue-600">
              {serviceDescription}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenInfo}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 transition-all hover:bg-blue-50 hover:text-blue-600"
            aria-label="Service Details öffnen"
          >
            <span className="material-symbols-outlined">info</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">
                  schedule
                </span>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Geplante Zeit
                </p>
                <p className="mt-1 text-sm font-black text-slate-800">
                  {getTimeDisplay(task)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">
                  timer
                </span>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Dauer
                </p>
                <p className="mt-1 text-sm font-black text-slate-800">
                  {getDurationLabel(task)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {actualTimeSummary && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600">
                punch_clock
              </span>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-500">
                  Deine Zeiterfassung
                </p>

                <div className="mt-2 grid gap-1 text-sm font-bold text-blue-800">
                  {actualTimeSummary.travelStart && (
                    <p>Fahrt begonnen: {actualTimeSummary.travelStart}</p>
                  )}

                  {actualTimeSummary.start && (
                    <p>Arbeit begonnen: {actualTimeSummary.start}</p>
                  )}

                  {actualTimeSummary.end && (
                    <p>Arbeit beendet: {actualTimeSummary.end}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">
                location_on
              </span>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Adresse
              </p>
              <p className="mt-1 text-sm font-bold leading-6 text-slate-800">
                {address}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className={`rounded-2xl p-4 ${
              requiresKey
                ? "bg-amber-50 text-amber-800"
                : "bg-slate-50 text-slate-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">
                {requiresKey ? "key" : "key_off"}
              </span>
              <p className="text-sm font-black">
                {requiresKey ? "Schlüssel erforderlich" : "Kein Schlüssel"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-500">
                calendar_month
              </span>
              <p className="text-sm font-black text-slate-700">
                {formatDate(task.date)}
              </p>
            </div>
          </div>
        </div>

        {importantNotes && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600">
                warning
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-red-500">
                  Wichtig
                </p>
                <p className="mt-1 text-sm font-bold leading-6 text-red-800">
                  {importantNotes}
                </p>
              </div>
            </div>
          </div>
        )}

        {!importantNotes && notes && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-slate-500">
                sticky_note_2
              </span>
              <p className="text-sm font-medium leading-6 text-slate-600">
                {notes}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60 p-5">
        {status === "assigned" && (
          <button
            type="button"
            onClick={() => updateStatus("traveling")}
            disabled={!!loadingStatus}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined">directions_car</span>
            {loadingStatus === "traveling"
              ? "Wird gespeichert..."
              : "Fahrt beginnen"}
          </button>
        )}

        {status === "traveling" && (
          <button
            type="button"
            onClick={() => updateStatus("in_progress")}
            disabled={!!loadingStatus}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-amber-100 transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined">location_on</span>
            {loadingStatus === "in_progress"
              ? "Wird gespeichert..."
              : "Ankunft & Beginn"}
          </button>
        )}

        {status === "in_progress" && (
          <button
            type="button"
            onClick={handleFinishWork}
            disabled={!!loadingStatus}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined">check_circle</span>
            {loadingStatus === "completed"
              ? "Wird gespeichert..."
              : "Arbeit beenden"}
          </button>
        )}
      </div>
    </article>
  )
}