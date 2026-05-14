"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

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
  createdAt: string
  updatedAt: string
  client?: {
    id: number
    name: string
    clientCode?: string | null
    email?: string | null
    phone?: string | null
  } | null
  service?: {
    id: number
    date?: string | null
    startTime?: string | null
    address?: string | null
    status?: string | null
    serviceCode?: {
      code?: string | null
      description?: string | null
    } | null
  } | null
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Offen" },
  { value: "IN_REVIEW", label: "In Prüfung" },
  { value: "RESOLVED", label: "Erledigt" },
  { value: "REJECTED", label: "Abgelehnt" },
]

const FILTER_OPTIONS = [{ value: "ALL", label: "Alle" }, ...STATUS_OPTIONS]

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
      return type || "Anfrage"
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
      return "inbox"
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

export default function AdminClientRequestsPage() {
  const router = useRouter()

  const [requests, setRequests] = useState<ClientRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [search, setSearch] = useState("")
  const [selectedRequest, setSelectedRequest] =
    useState<ClientRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [savingStatus, setSavingStatus] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  async function fetchRequests() {
    try {
      setLoading(true)
      setError("")

      const res = await fetch(
        `/api/admin/client-requests?status=${statusFilter}`,
        {
          cache: "no-store",
        }
      )

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
    fetchRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  useEffect(() => {
    setAdminNotes(selectedRequest?.adminNotes || "")
  }, [selectedRequest])

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return requests

    return requests.filter((request) => {
      const clientName = request.client?.name?.toLowerCase() || ""
      const clientCode = request.client?.clientCode?.toLowerCase() || ""
      const title = request.title?.toLowerCase() || ""
      const message = request.message?.toLowerCase() || ""
      const serviceCode =
        request.service?.serviceCode?.code?.toLowerCase() || ""

      return (
        clientName.includes(query) ||
        clientCode.includes(query) ||
        title.includes(query) ||
        message.includes(query) ||
        serviceCode.includes(query)
      )
    })
  }, [requests, search])

  const stats = useMemo(() => {
    return {
      pending: requests.filter((request) => request.status === "PENDING")
        .length,
      inReview: requests.filter((request) => request.status === "IN_REVIEW")
        .length,
      resolved: requests.filter((request) => request.status === "RESOLVED")
        .length,
      rejected: requests.filter((request) => request.status === "REJECTED")
        .length,
      total: requests.length,
    }
  }, [requests])

  async function updateRequestStatus(requestId: number, status: string) {
    try {
      setSavingStatus(true)
      setError("")
      setSuccessMessage("")

      const res = await fetch(`/api/admin/client-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          adminNotes,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Anfrage konnte nicht aktualisiert werden.")
        return
      }

      setSelectedRequest(data)
      setSuccessMessage("Anfrage wurde aktualisiert.")
      await fetchRequests()

      window.setTimeout(() => {
        setSuccessMessage("")
      }, 5000)
    } catch {
      setError("Anfrage konnte nicht aktualisiert werden.")
    } finally {
      setSavingStatus(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="flex min-h-[60vh] items-center justify-center">
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
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Admin / Kundenanfragen
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Kundenanfragen
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Verwalten Sie Extra-Services, Probleme, Änderungswünsche und
              Stornierungsanfragen von Kunden.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRequests}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:text-blue-700"
          >
            <span className="material-symbols-outlined text-[20px]">
              refresh
            </span>
            Aktualisieren
          </button>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Aktueller Filter
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">
              {filteredRequests.length}
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

          <div className="rounded-[1.75rem] border border-rose-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-400">
              Abgelehnt
            </p>
            <p className="mt-3 text-3xl font-black text-rose-600">
              {stats.rejected}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nach Kunde, Code, Titel oder Nachricht suchen..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none transition-all focus:border-blue-300"
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CONTENT */}
        {filteredRequests.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300">
              inbox
            </span>

            <h2 className="mt-4 text-2xl font-black text-slate-950">
              Keine Anfragen gefunden
            </h2>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Für den aktuellen Filter liegen keine Kundenanfragen vor.
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
                          Kunde
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {request.client?.name || "Unbekannt"}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {request.client?.clientCode || `ID ${request.clientId}`}
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
                          Erstellt
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-800">
                          {formatDateTime(request.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-[190px]">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(request)}
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition-all hover:bg-blue-700"
                    >
                      Anfrage öffnen
                    </button>

                    {request.clientId && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/admin/clients/${request.clientId}`)
                        }
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-all hover:border-blue-200 hover:text-blue-700"
                      >
                        Kunde ansehen
                      </button>
                    )}
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

          <div className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  Kundenanfrage #{selectedRequest.id}
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
                  Kunde
                </p>
                <p className="mt-2 text-sm font-black text-slate-800">
                  {selectedRequest.client?.name || "Unbekannt"}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-400">
                  {selectedRequest.client?.email || "Keine E-Mail"}
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
                  Erstellt
                </p>
                <p className="mt-2 text-sm font-black text-slate-800">
                  {formatDateTime(selectedRequest.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Nachricht des Kunden
              </p>

              <p className="mt-2 whitespace-pre-line text-sm font-medium leading-7 text-slate-700">
                {selectedRequest.message || "Keine Nachricht vorhanden."}
              </p>
            </div>

            <div className="mt-6">
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Interne Notiz
              </label>

              <textarea
                value={adminNotes}
                onChange={(event) => setAdminNotes(event.target.value)}
                rows={4}
                placeholder="Interne Bearbeitungsnotiz..."
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium leading-6 text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={savingStatus}
                  onClick={() =>
                    updateRequestStatus(selectedRequest.id, option.value)
                  }
                  className={`rounded-2xl px-4 py-3 text-sm font-black transition-all disabled:opacity-50 ${
                    selectedRequest.status === option.value
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row">
                {selectedRequest.clientId && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/admin/clients/${selectedRequest.clientId}`)
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-all hover:border-blue-200 hover:text-blue-700"
                  >
                    Kunde öffnen
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition-all hover:bg-black"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}