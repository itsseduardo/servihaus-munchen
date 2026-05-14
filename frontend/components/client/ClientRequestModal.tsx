"use client"

import { useState } from "react"

type RequestType =
  | "EXTRA_SERVICE"
  | "SERVICE_ISSUE"
  | "CHANGE_REQUEST"
  | "CANCELLATION_REQUEST"

type ServiceOption = {
  id: number
  date?: string | null
  startTime?: string | null
  serviceCode?: {
    code?: string | null
    description?: string | null
  } | null
}

type Props = {
  type: RequestType
  service?: ServiceOption | null
  onClose: () => void
  onCreated?: () => void
}

function getRequestConfig(type: RequestType) {
  switch (type) {
    case "EXTRA_SERVICE":
      return {
        eyebrow: "Zusatzleistung",
        title: "Extra-Service anfragen",
        description:
          "Teilen Sie uns mit, welche zusätzliche Leistung Sie wünschen. Unser Team prüft Ihre Anfrage und meldet sich bei Ihnen.",
        defaultTitle: "Extra-Service Anfrage",
        icon: "add_circle",
        color: "blue",
      }

    case "SERVICE_ISSUE":
      return {
        eyebrow: "Problem melden",
        title: "Problem zum Service melden",
        description:
          "Beschreiben Sie bitte, was beim Service nicht wie erwartet war. Wir prüfen den Vorgang schnellstmöglich.",
        defaultTitle: "Problem zum Service",
        icon: "report",
        color: "rose",
      }

    case "CHANGE_REQUEST":
      return {
        eyebrow: "Änderung",
        title: "Änderung anfragen",
        description:
          "Sie können eine Änderung der Uhrzeit, des Datums oder der Leistung anfragen.",
        defaultTitle: "Änderungsanfrage",
        icon: "edit_calendar",
        color: "amber",
      }

    case "CANCELLATION_REQUEST":
      return {
        eyebrow: "Stornierung",
        title: "Stornierung anfragen",
        description:
          "Senden Sie uns eine Anfrage, wenn Sie einen geplanten Service stornieren möchten.",
        defaultTitle: "Stornierungsanfrage",
        icon: "event_busy",
        color: "slate",
      }
  }
}

function formatServiceDate(value?: string | null) {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatServiceTime(value?: string | null) {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export default function ClientRequestModal({
  type,
  service = null,
  onClose,
  onCreated,
}: Props) {
  const config = getRequestConfig(type)

  const [title, setTitle] = useState(config.defaultTitle)
  const [message, setMessage] = useState("")
  const [requestedDate, setRequestedDate] = useState("")
  const [requestedTime, setRequestedTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const needsDateFields =
    type === "EXTRA_SERVICE" || type === "CHANGE_REQUEST"

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!title.trim()) {
      setError("Bitte geben Sie einen Titel ein.")
      return
    }

    if (!message.trim()) {
      setError("Bitte beschreiben Sie Ihre Anfrage.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const res = await fetch("/api/client/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          serviceId: service?.id || null,
          title: title.trim(),
          message: message.trim(),
          requestedDate: requestedDate || null,
          requestedTime: requestedTime || null,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Die Anfrage konnte nicht gesendet werden.")
        return
      }

      onCreated?.()
      onClose()
    } catch {
      setError("Die Anfrage konnte nicht gesendet werden.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Schließen"
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div
              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                config.color === "blue"
                  ? "bg-blue-50 text-blue-600"
                  : config.color === "rose"
                    ? "bg-rose-50 text-rose-600"
                    : config.color === "amber"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-slate-100 text-slate-700"
              }`}
            >
              <span className="material-symbols-outlined text-3xl">
                {config.icon}
              </span>
            </div>

            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              {config.eyebrow}
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {config.title}
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              {config.description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {service && (
          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Bezug zum Service
            </p>

            <div className="mt-2 flex flex-col gap-1 text-sm">
              <p className="font-black text-slate-900">
                {service.serviceCode?.code || "Service"}{" "}
                {service.serviceCode?.description
                  ? `· ${service.serviceCode.description}`
                  : ""}
              </p>

              <p className="font-medium text-slate-500">
                {formatServiceDate(service.date) || "-"}{" "}
                {formatServiceTime(service.startTime)
                  ? `· ${formatServiceTime(service.startTime)} Uhr`
                  : ""}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-5">
          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Titel
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {needsDateFields && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Gewünschtes Datum
                </label>

                <input
                  type="date"
                  value={requestedDate}
                  onChange={(event) => setRequestedDate(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Gewünschte Uhrzeit
                </label>

                <input
                  type="time"
                  value={requestedTime}
                  onChange={(event) => setRequestedTime(event.target.value)}
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Nachricht
            </label>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              placeholder={
                type === "EXTRA_SERVICE"
                  ? "Welche zusätzliche Leistung wünschen Sie?"
                  : type === "SERVICE_ISSUE"
                    ? "Was ist passiert? Bitte beschreiben Sie das Problem."
                    : type === "CHANGE_REQUEST"
                      ? "Welche Änderung wünschen Sie?"
                      : "Warum möchten Sie den Service stornieren?"
              }
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm font-medium leading-6 text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            Abbrechen
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Wird gesendet..." : "Anfrage senden"}
          </button>
        </div>
      </form>
    </div>
  )
}