"use client"

import { useEffect, useMemo, useState } from "react"
import ClientRequestModal from "@/components/client/ClientRequestModal"

type ClientRequest = {
  id: number
  clientId: number
  serviceId?: number | null
  type: string
  status: string
  title: string
  message?: string | null
  requestedDate?: string | null
  requestedTime?: string | null
  adminNotes?: string | null
  adminResponse?: string | null
  statusChangedAt?: string | null
  resolvedAt?: string | null
  createdAt: string
  updatedAt: string
  service?: {
    id: number
    date?: string | null
    startTime?: string | null
    status?: string | null
    serviceCode?: {
      code?: string | null
      description?: string | null
    } | null
  } | null
}

type RequestType = "EXTRA_SERVICE" | "SERVICE_ISSUE"

const FILTERS = [
  { value: "ALL", label: "Alle" },
  { value: "PENDING", label: "Offen" },
  { value: "IN_REVIEW", label: "In Prüfung" },
  { value: "RESOLVED", label: "Erledigt" },
  { value: "REJECTED", label: "Abgelehnt" },
]

function getTypeLabel(type: string) {
  switch (type) {
    case "EXTRA_SERVICE":
      return "Extra-Service"
    case "SERVICE_ISSUE":
      return "Problem"
    case "CHANGE_REQUEST":
      return "Änderung"
    case "CANCELLATION_REQUEST":
      return "Stornierung"
    default:
      return "Anfrage"
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "EXTRA_SERVICE":
      return "add_circle"
    case "SERVICE_ISSUE":
      return "report"
    case "CHANGE_REQUEST":
      return "edit_calendar"
    case "CANCELLATION_REQUEST":
      return "event_busy"
    default:
      return "support_agent"
  }
}

function getTypeStyle(type: string) {
  switch (type) {
    case "EXTRA_SERVICE":
      return "bg-blue-50 text-blue-700 border-blue-100"
    case "SERVICE_ISSUE":
      return "bg-rose-50 text-rose-700 border-rose-100"
    case "CHANGE_REQUEST":
      return "bg-amber-50 text-amber-700 border-amber-100"
    case "CANCELLATION_REQUEST":
      return "bg-slate-100 text-slate-700 border-slate-200"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200"
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Offen"
    case "IN_REVIEW":
      return "In Prüfung"
    case "RESOLVED":
      return "Erledigt"
    case "REJECTED":
      return "Abgelehnt"
    default:
      return status || "Unbekannt"
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-blue-50 text-blue-700 border-blue-100"
    case "IN_REVIEW":
      return "bg-amber-50 text-amber-700 border-amber-100"
    case "RESOLVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100"
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-100"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200"
  }
}

function formatDate(value?: string | null) {
  if (!value) return "-"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatDateTime(value?: string | null) {
  if (!value) return "-"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatTime(value?: string | null) {
  if (!value) return ""

  if (/^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5)
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export default function ClientSupportPage() {
  const [requests, setRequests] = useState<ClientRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(
    null
  )
  const [requestModalType, setRequestModalType] =
    useState<RequestType | null>(null)

  async function loadRequests() {
    try {
      setLoading(true)
      setError("")

      const res = await fetch("/api/client/requests", {
        cache: "no-store",
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Anfragen konnten nicht geladen werden.")
        setRequests([])
        return
      }

      setRequests(Array.isArray(data) ? data : [])
    } catch {
      setError("Anfragen konnten nicht geladen werden.")
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const filteredRequests = useMemo(() => {
    if (filter === "ALL") return requests

    return requests.filter((request) => request.status === filter)
  }, [requests, filter])

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((request) => request.status === "PENDING")
        .length,
      inReview: requests.filter((request) => request.status === "IN_REVIEW")
        .length,
      resolved: requests.filter((request) => request.status === "RESOLVED")
        .length,
    }
  }, [requests])

  function handleRequestCreated() {
    setRequestModalType(null)
    setSuccessMessage(
      "Ihre Anfrage wurde gesendet. Unser Team wird sie prüfen und sich bei Ihnen melden."
    )

    loadRequests()

    window.setTimeout(() => {
      setSuccessMessage("")
    }, 6000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                Anfragen werden geladen
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Kundenportal / Support
          </p>

          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Meine Anfragen
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Hier sehen Sie Ihre gesendeten Anfragen, den aktuellen
                Bearbeitungsstatus und Antworten von ServiHaus.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setRequestModalType("SERVICE_ISSUE")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-3 text-sm font-black text-rose-600 transition-all hover:bg-rose-100"
              >
                <span className="material-symbols-outlined text-[20px]">
                  report
                </span>
                Problem melden
              </button>

              <button
                type="button"
                onClick={() => setRequestModalType("EXTRA_SERVICE")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add
                </span>
                Extra anfragen
              </button>
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Gesamt
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">
              {stats.total}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-400">
              Offen
            </p>
            <p className="mt-3 text-3xl font-black text-blue-600">
              {stats.pending}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-400">
              In Prüfung
            </p>
            <p className="mt-3 text-3xl font-black text-amber-600">
              {stats.inReview}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-400">
              Erledigt
            </p>
            <p className="mt-3 text-3xl font-black text-emerald-600">
              {stats.resolved}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((option) => {
              const isActive = filter === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={`rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* EMPTY */}
        {filteredRequests.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300">
              support_agent
            </span>

            <h2 className="mt-4 text-2xl font-black text-slate-950">
              Keine Anfragen gefunden
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
              Für den aktuellen Filter liegen keine Anfragen vor. Sie können
              jederzeit ein Problem melden oder einen Extra-Service anfragen.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <article
                key={request.id}
                className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-blue-100 hover:shadow-md"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${getTypeStyle(
                          request.type
                        )}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {getTypeIcon(request.type)}
                        </span>
                        {getTypeLabel(request.type)}
                      </span>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {getStatusLabel(request.status)}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                        #{request.id}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-black text-slate-950">
                      {request.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
                      {request.message || "Keine Nachricht hinterlegt."}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Erstellt
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {formatDateTime(request.createdAt)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Wunschdatum
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {formatDate(request.requestedDate)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {request.requestedTime
                            ? `${formatTime(request.requestedTime)} Uhr`
                            : "Keine Uhrzeit"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Service
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {request.service?.serviceCode?.code ||
                            request.serviceId ||
                            "-"}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {request.service?.serviceCode?.description ||
                            "Ohne Bezug"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Aktualisiert
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {formatDateTime(
                            request.statusChangedAt || request.updatedAt
                          )}
                        </p>
                      </div>
                    </div>

                    {request.adminResponse && (
                      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                          Antwort von ServiHaus
                        </p>

                        <p className="mt-2 whitespace-pre-line text-sm font-bold leading-6 text-blue-900">
                          {request.adminResponse}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="lg:w-[160px]">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(request)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-all hover:border-blue-200 hover:text-blue-700"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* DETAIL MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setSelectedRequest(null)}
            aria-label="Schließen"
          />

          <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  Anfrage #{selectedRequest.id}
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  {selectedRequest.title}
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${getTypeStyle(
                      selectedRequest.type
                    )}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {getTypeIcon(selectedRequest.type)}
                    </span>
                    {getTypeLabel(selectedRequest.type)}
                  </span>

                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(
                      selectedRequest.status
                    )}`}
                  >
                    {getStatusLabel(selectedRequest.status)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Erstellt
                </p>
                <p className="mt-2 text-sm font-black text-slate-800">
                  {formatDateTime(selectedRequest.createdAt)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Aktualisiert
                </p>
                <p className="mt-2 text-sm font-black text-slate-800">
                  {formatDateTime(
                    selectedRequest.statusChangedAt || selectedRequest.updatedAt
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Wunschdatum
                </p>
                <p className="mt-2 text-sm font-black text-slate-800">
                  {formatDate(selectedRequest.requestedDate)}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-400">
                  {selectedRequest.requestedTime
                    ? `${formatTime(selectedRequest.requestedTime)} Uhr`
                    : "Keine Uhrzeit"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Service
                </p>
                <p className="mt-2 text-sm font-black text-slate-800">
                  {selectedRequest.service?.serviceCode?.code ||
                    selectedRequest.serviceId ||
                    "-"}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-400">
                  {selectedRequest.service?.serviceCode?.description ||
                    "Ohne Service-Bezug"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Ihre Nachricht
              </p>

              <p className="mt-2 whitespace-pre-line text-sm font-medium leading-7 text-slate-700">
                {selectedRequest.message || "Keine Nachricht vorhanden."}
              </p>
            </div>

            {selectedRequest.adminResponse ? (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                  Antwort von ServiHaus
                </p>

                <p className="mt-2 whitespace-pre-line text-sm font-bold leading-7 text-blue-900">
                  {selectedRequest.adminResponse}
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Antwort von ServiHaus
                </p>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                  Noch keine Antwort vorhanden. Unser Team prüft Ihre Anfrage.
                </p>
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition-all hover:bg-blue-700"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE REQUEST MODAL */}
      {requestModalType && (
        <ClientRequestModal
          type={requestModalType}
          onClose={() => setRequestModalType(null)}
          onCreated={handleRequestCreated}
        />
      )}
    </main>
  )
}