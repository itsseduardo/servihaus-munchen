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

type TopClient = {
  name: string
  count: number
}

type ClientWithOpenRequests = {
  id: number
  name: string
  clientCode?: string | null
  openRequests: number
}

type ClientWithoutUpcoming = {
  id: number
  name: string
  clientCode?: string | null
  email?: string | null
  phone?: string | null
}

type DashboardStats = {
  clients?: {
    total?: number
    withUpcomingServices?: number
    withoutUpcomingServices?: number
    withOpenRequests?: number
    topClients?: TopClient[]
    clientsWithOpenRequests?: ClientWithOpenRequests[]
    withoutUpcomingList?: ClientWithoutUpcoming[]
  }
}

export default function AdminClientsDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadStats() {
    try {
      setLoading(true)
      setError("")

      const res = await fetch("/api/admin/stats", {
        cache: "no-store",
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        setError(json?.error || "Kunden-Statistiken konnten nicht geladen werden.")
        setData(null)
        return
      }

      setData(json)
    } catch {
      setError("Kunden-Statistiken konnten nicht geladen werden.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const clients = data?.clients || {}
  const topClients = clients.topClients || []
  const clientsWithOpenRequests = clients.clientsWithOpenRequests || []
  const withoutUpcomingList = clients.withoutUpcomingList || []

  const serviceDistributionData = useMemo(
    () => [
      {
        name: "Mit Services",
        Anzahl: clients.withUpcomingServices || 0,
      },
      {
        name: "Ohne Services",
        Anzahl: clients.withoutUpcomingServices || 0,
      },
    ],
    [clients]
  )

  const topClientsChartData = useMemo(() => {
    return topClients.slice(0, 10).map((client) => ({
      name: client.name,
      Services: client.count,
    }))
  }, [topClients])

  const openRequestsChartData = useMemo(() => {
    return clientsWithOpenRequests.slice(0, 10).map((client) => ({
      name: client.name,
      Anfragen: client.openRequests,
    }))
  }, [clientsWithOpenRequests])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Kunden-Dashboard wird geladen
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
            {error || "Die Kunden-Statistiken konnten nicht geladen werden."}
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
              Kunden
            </h1>

            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
              Übersicht über Kundenaktivität, Servicevolumen, offene Anfragen
              und Kunden ohne zukünftige Planung.
            </p>
          </div>

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
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Kunden gesamt"
            value={clients.total || 0}
            subtitle="Registrierte Kunden"
            icon="business_center"
            color="bg-blue-600"
          />

          <KpiCard
            title="Mit Planung"
            value={clients.withUpcomingServices || 0}
            subtitle="Kunden mit zukünftigen Services"
            icon="event_available"
            color="bg-emerald-600"
          />

          <KpiCard
            title="Ohne Planung"
            value={clients.withoutUpcomingServices || 0}
            subtitle="Kunden ohne zukünftige Services"
            icon="event_busy"
            color={(clients.withoutUpcomingServices || 0) > 0 ? "bg-amber-500" : "bg-slate-900"}
            alert={(clients.withoutUpcomingServices || 0) > 0}
          />

          <KpiCard
            title="Mit offenen Anfragen"
            value={clients.withOpenRequests || 0}
            subtitle="Benötigt Aufmerksamkeit"
            icon="mark_unread_chat_alt"
            color={(clients.withOpenRequests || 0) > 0 ? "bg-rose-600" : "bg-slate-900"}
            alert={(clients.withOpenRequests || 0) > 0}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Kunden mit und ohne Planung"
            description="Zeigt, wie viele Kunden bereits zukünftige Services geplant haben."
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={serviceDistributionData}>
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
            title="Top 10 Kunden nach Servicevolumen"
            description="Ranking der Kunden mit den meisten Services in der aktuellen Woche."
          >
            {topClientsChartData.length === 0 ? (
              <EmptyChart message="Noch keine Servicevolumen-Daten vorhanden." />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={topClientsChartData}
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
                  <Bar dataKey="Services" fill="#16a34a" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <ChartCard
            title="Kunden mit offenen Anfragen"
            description="Top Kunden nach Anzahl offener oder in Prüfung befindlicher Anfragen."
          >
            {openRequestsChartData.length === 0 ? (
              <EmptyChart message="Keine offenen Kundenanfragen vorhanden." />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={openRequestsChartData}
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
                  <Bar dataKey="Anfragen" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ClientsTable
            title="Kunden ohne zukünftige Planung"
            description="Clientes que no tienen servicios próximos registrados."
            clients={withoutUpcomingList}
            emptyMessage="Alle Kunden haben zukünftige Services geplant."
          />
        </div>

        <ClientsWithRequestsTable clients={clientsWithOpenRequests} />
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

function ClientsTable({
  title,
  description,
  clients,
  emptyMessage,
}: {
  title: string
  description: string
  clients: ClientWithoutUpcoming[]
  emptyMessage: string
}) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Kundenliste
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>

          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700"
        >
          Kunden öffnen
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
        {clients.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">
              event_available
            </span>

            <p className="mt-3 text-sm font-bold text-slate-500">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {clients.map((client) => (
              <div
                key={client.id}
                className="grid gap-3 p-4 hover:bg-slate-50 sm:grid-cols-[1fr_150px_120px]"
              >
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {client.name}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {client.email || client.phone || "Keine Kontaktdaten"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                    Code
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {client.clientCode || "-"}
                  </p>
                </div>

                <div className="flex items-center sm:justify-end">
                  <Link
                    href={`/admin/clients/${client.id}`}
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
  )
}

function ClientsWithRequestsTable({
  clients,
}: {
  clients: ClientWithOpenRequests[]
}) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Kundenkommunikation
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950">
            Kunden mit offenen Anfragen
          </h2>

          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
            Clientes que tienen solicitudes pendientes o en revisión.
          </p>
        </div>

        <Link
          href="/admin/dashboard/requests"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700"
        >
          Anfragen öffnen
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
        {clients.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">
              mark_email_read
            </span>

            <p className="mt-3 text-sm font-bold text-slate-500">
              Keine offenen Kundenanfragen.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {clients.map((client) => (
              <div
                key={client.id}
                className="grid gap-3 p-4 hover:bg-slate-50 sm:grid-cols-[1fr_150px_120px]"
              >
                <div>
                  <p className="text-sm font-black text-slate-900">
                    {client.name}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {client.clientCode || "Ohne Code"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                    Offene Anfragen
                  </p>
                  <p className="mt-1 text-sm font-bold text-amber-700">
                    {client.openRequests}
                  </p>
                </div>

                <div className="flex items-center sm:justify-end">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700"
                  >
                    Kunde
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}