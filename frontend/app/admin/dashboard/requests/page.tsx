"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type RequestTypeCard = {
  type: string
  label: string
  count: number
}

type LatestRequest = {
  id: number
  type: string
  typeLabel: string
  status: string
  title: string
  message?: string | null
  createdAt?: string | null
  requestedDate?: string | null
  requestedTime?: string | null
  client?: {
    id: number
    name: string
    clientCode?: string | null
  } | null
  service?: {
    id: number
    date?: string | null
    startTime?: string | null
    serviceCode?: {
      code?: string | null
      description?: string | null
    } | null
  } | null
}

type DashboardStats = {
  requests?: {
    total?: number
    pending?: number
    inReview?: number
    resolved?: number
    rejected?: number
    typeCounts?: RequestTypeCard[]
    latest?: LatestRequest[]
  }
}

function getStatusLabel(status?: string | null) {
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

function getStatusStyle(status?: string | null) {
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

function getTypeIcon(type?: string | null) {
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

function getTypeStyle(type?: string | null) {
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

function formatTime(value?: string | null) {
  if (!value) return "-"

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

export default function AdminRequestsDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("ALL")

  async function loadStats() {
    try {
      setLoading(true)
      setError("")

      const res = await fetch("/api/admin/stats", {
        cache: "no-store",
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        setError(json?.error || "Anfragen-Statistiken konnten nicht geladen werden.")
        setData(null)
        return
      }

      setData(json)
    } catch {
      setError("Anfragen-Statistiken konnten nicht geladen werden.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const requests = data?.requests || {}
  const latest = requests.latest || []
  const typeCounts = requests.typeCounts || []

  const statusChartData = useMemo(
    () => [
      {
        name: "Offen",
        Anzahl: requests.pending || 0,
      },
      {
        name: "In Prüfung",
        Anzahl: requests.inReview || 0,
      },
      {
        name: "Erledigt",
        Anzahl: requests.resolved || 0,
      },
      {
        name: "Abgelehnt",
        Anzahl: requests.rejected || 0,
      },
    ],
    [requests]
  )

  const typeChartData = useMemo(() => {
    return typeCounts.map((item) => ({
      name: item.label,
      Anzahl: item.count,
    }))
  }, [typeCounts])

  const filteredRequests = useMemo(() => {
    if (filter === "ALL") return latest

    return latest.filter((request) => request.status === filter)
  }, [latest, filter])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Anfragen-Dashboard wird geladen
          </p>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-red-500">
            error
          </span>

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Statistiken nicht verfügbar
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            {error || "Die Anfragen-Statistiken konnten nicht geladen werden."}
          </p>

          <button
            type="button"
            onClick={loadStats}
            className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
          >
            Erneut laden
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-600 hover:text-blue-800"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Kundenanfragen
            </h1>

            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
              Übersicht über offene Kundenanfragen, Probleme, Extra-Services,
              Änderungswünsche und Stornierungen.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/client-requests"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-[20px]">
                inbox
              </span>
              Anfragen öffnen
            </Link>

            <button
              type="button"
              onClick={loadStats}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:text-blue-700"
            >
              <span className="material-symbols-outlined text-[20px]">
                refresh
              </span>
              Aktualisieren
            </button>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Anfragen gesamt"
            value={requests.total || 0}
            subtitle="Alle Kundenanfragen"
            icon="support_agent"
            color="bg-blue-600"
          />

          <KpiCard
            title="Offen"
            value={requests.pending || 0}
            subtitle="Noch nicht bearbeitet"
            icon="mark_unread_chat_alt"
            color={(requests.pending || 0) > 0 ? "bg-amber-500" : "bg-slate-900"}
            alert={(requests.pending || 0) > 0}
          />

          <KpiCard
            title="In Prüfung"
            value={requests.inReview || 0}
            subtitle="Aktuell in Bearbeitung"
            icon="hourglass_top"
            color="bg-indigo-600"
          />

          <KpiCard
            title="Erledigt"
            value={requests.resolved || 0}
            subtitle={`${requests.rejected || 0} abgelehnt`}
            icon="check_circle"
            color="bg-emerald-600"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Anfragen nach Status"
            description="Verteilung der Kundenanfragen nach Bearbeitungsstand."
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="Anzahl" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Anfragen nach Typ"
            description="Extra-Services, Probleme, Änderungen und Stornierungen."
          >
            {typeChartData.length === 0 ? (
              <EmptyChart message="Noch keine Anfragedaten vorhanden." />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={typeChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 30, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  />
                  <Bar dataKey="Anzahl" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "ALL", label: "Alle" },
              { value: "PENDING", label: "Offen" },
              { value: "IN_REVIEW", label: "In Prüfung" },
              { value: "RESOLVED", label: "Erledigt" },
              { value: "REJECTED", label: "Abgelehnt" },
            ].map((option) => {
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

        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Aktuelle Kommunikation
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Letzte Kundenanfragen
              </h2>

              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                Las solicitudes más recientes del portal cliente.
              </p>
            </div>

            <Link
              href="/admin/client-requests"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700"
            >
              Alle Anfragen
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            {filteredRequests.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300">
                  inbox
                </span>

                <p className="mt-3 text-sm font-bold text-slate-500">
                  Keine Anfragen für diesen Filter vorhanden.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="grid gap-4 p-4 hover:bg-slate-50 lg:grid-cols-[1fr_170px_150px]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${getTypeStyle(
                            request.type
                          )}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {getTypeIcon(request.type)}
                          </span>
                          {request.typeLabel}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(
                            request.status
                          )}`}
                        >
                          {getStatusLabel(request.status)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-sm font-black text-slate-950">
                        {request.title}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
                        {request.message || "Keine Nachricht hinterlegt."}
                      </p>

                      <p className="mt-2 text-xs font-bold text-slate-400">
                        Kunde: {request.client?.name || "Unbekannt"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                        Erstellt
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {formatDateTime(request.createdAt)}
                      </p>

                      {request.requestedDate && (
                        <p className="mt-2 text-xs font-bold text-slate-400">
                          Wunsch: {formatDate(request.requestedDate)}{" "}
                          {request.requestedTime
                            ? `· ${formatTime(request.requestedTime)} Uhr`
                            : ""}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-start lg:justify-end">
                      <Link
                        href="/admin/client-requests"
                        className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700"
                      >
                        Öffnen
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
              <span className="material-symbols-outlined">info</span>
            </div>

            <div>
              <p className="text-sm font-black text-blue-900">
                Flujo operativo de solicitudes
              </p>

              <p className="mt-1 text-sm font-medium leading-6 text-blue-800">
                Esta vista resume las solicitudes del portal cliente. Para
                responder, cambiar estado, cancelar un servicio real o planificar
                un extra, el administrador debe entrar a la bandeja operativa de
                <strong> /admin/client-requests</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  color,
  alert = false,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: string
  color: string
  alert?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border bg-white p-6 shadow-sm ${
        alert ? "border-amber-300 ring-4 ring-amber-50" : "border-slate-100"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-4xl font-black text-slate-950">{value}</p>

          <p className="mt-2 text-sm font-bold text-slate-500">{subtitle}</p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${color}`}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
    </div>
  )
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <div className="h-[320px]">{children}</div>
    </div>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
      <span className="material-symbols-outlined text-5xl text-slate-300">
        bar_chart
      </span>
      <p className="mt-3 text-sm font-bold text-slate-500">{message}</p>
    </div>
  )
}