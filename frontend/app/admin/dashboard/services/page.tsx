"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

type DashboardStats = {
  services?: {
    today?: {
      total?: number
      assigned?: number
      traveling?: number
      inProgress?: number
      completed?: number
      cancelled?: number
    }
    week?: {
      total?: number
      plannedHours?: number
      realHours?: number
      estimatedHours?: number
      precision?: number
    }
    month?: {
      total?: number
      plannedHours?: number
      growth?: number
    }
    alerts?: {
      unassigned?: number
      withImportantNotes?: number
      withKeys?: number
      recurring?: number
    }
    latestThisWeek?: Array<{
      id: number
      date?: string
      startTime?: string
      status?: string
      client?: string
      serviceCode?: {
        code?: string | null
        description?: string | null
      } | null
      employees?: Array<{
        id: number
        name: string
      }>
      plannedHours?: number
      realHours?: number
    }>
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

function formatTime(value?: string | null) {
  if (!value) return "-"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "assigned":
      return "Geplant"
    case "traveling":
      return "Unterwegs"
    case "in_progress":
      return "In Arbeit"
    case "completed":
      return "Abgeschlossen"
    case "cancelled":
      return "Storniert"
    default:
      return "Unbekannt"
  }
}

function getStatusStyle(status?: string | null) {
  switch (status) {
    case "assigned":
      return "bg-blue-50 text-blue-700 border-blue-100"
    case "traveling":
      return "bg-indigo-50 text-indigo-700 border-indigo-100"
    case "in_progress":
      return "bg-amber-50 text-amber-700 border-amber-100"
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-100"
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-100"
    default:
      return "bg-slate-100 text-slate-700 border-slate-200"
  }
}

export default function AdminServicesDashboardPage() {
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
        setError(json?.error || "Service-Statistiken konnten nicht geladen werden.")
        setData(null)
        return
      }

      setData(json)
    } catch {
      setError("Service-Statistiken konnten nicht geladen werden.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const services = data?.services || {}
  const today = services.today || {}
  const week = services.week || {}
  const month = services.month || {}
  const alerts = services.alerts || {}
  const latestThisWeek = services.latestThisWeek || []

  const todayStatusCards = useMemo(
    () => [
      {
        label: "Geplant",
        value: today.assigned || 0,
        icon: "event_available",
        color: "bg-blue-600",
      },
      {
        label: "Unterwegs",
        value: today.traveling || 0,
        icon: "directions_car",
        color: "bg-indigo-600",
      },
      {
        label: "In Arbeit",
        value: today.inProgress || 0,
        icon: "cleaning_services",
        color: "bg-amber-500",
      },
      {
        label: "Abgeschlossen",
        value: today.completed || 0,
        icon: "check_circle",
        color: "bg-emerald-600",
      },
    ],
    [today]
  )

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Service-Dashboard wird geladen
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
            {error || "Die Service-Statistiken konnten nicht geladen werden."}
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
              Services & Operation
            </h1>

            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
              Übersicht über geplante, laufende und abgeschlossene Services,
              Auslastung, Zeitpräzision und operative Warnungen.
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
            title="Services heute"
            value={today.total || 0}
            subtitle="Nicht stornierte Services"
            icon="today"
            color="bg-blue-600"
          />

          <KpiCard
            title="Services diese Woche"
            value={week.total || 0}
            subtitle={`${week.plannedHours || 0}h geplant`}
            icon="calendar_view_week"
            color="bg-indigo-600"
          />

          <KpiCard
            title="Services diesen Monat"
            value={month.total || 0}
            subtitle={`${month.growth || 0}% vs. Vormonat`}
            icon="calendar_month"
            color={(month.growth || 0) >= 0 ? "bg-emerald-600" : "bg-rose-600"}
          />

          <KpiCard
            title="Zeitpräzision"
            value={`${week.precision || 0}%`}
            subtitle={`${week.realHours || 0}h real / ${week.estimatedHours || 0}h geplant`}
            icon="timer"
            color={(week.precision || 0) > 120 ? "bg-amber-500" : "bg-slate-900"}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {todayStatusCards.map((card) => (
            <KpiCard
              key={card.label}
              title={card.label}
              value={card.value}
              subtitle="Heute"
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          <AlertCard
            title="Ohne Mitarbeiter"
            value={alerts.unassigned || 0}
            description="Zukünftige Services ohne Zuweisung."
            icon="person_alert"
            color="bg-orange-500"
            href="/admin/calendar"
            alert={(alerts.unassigned || 0) > 0}
          />

          <AlertCard
            title="Wichtige Notizen"
            value={alerts.withImportantNotes || 0}
            description="Services mit wichtigen Hinweisen."
            icon="priority_high"
            color="bg-amber-500"
            href="/admin/calendar"
            alert={(alerts.withImportantNotes || 0) > 0}
          />

          <AlertCard
            title="Schlüssel erforderlich"
            value={alerts.withKeys || 0}
            description="Services, bei denen Schlüssel benötigt werden."
            icon="key"
            color="bg-indigo-600"
            href="/admin/calendar"
            alert={(alerts.withKeys || 0) > 0}
          />

          <AlertCard
            title="Wiederkehrend"
            value={alerts.recurring || 0}
            description="Aktive wiederkehrende Services."
            icon="event_repeat"
            color="bg-blue-600"
            href="/admin/calendar"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  Diese Woche
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Aktuelle Services
                </h2>
              </div>

              <Link
                href="/admin/calendar"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700"
              >
                Kalender öffnen
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
              {latestThisWeek.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300">
                    event_busy
                  </span>
                  <h3 className="mt-3 text-lg font-black text-slate-950">
                    Keine Services diese Woche
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Für diese Woche wurden noch keine Services gefunden.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {latestThisWeek.map((service) => (
                    <div
                      key={service.id}
                      className="grid gap-4 p-4 hover:bg-slate-50 lg:grid-cols-[150px_1fr_160px]"
                    >
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {formatDate(service.date)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {formatTime(service.startTime)} Uhr
                        </p>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                            {service.serviceCode?.code || "Service"}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(
                              service.status
                            )}`}
                          >
                            {getStatusLabel(service.status)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-black text-slate-900">
                          {service.client || "Unbekannter Kunde"}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {service.employees?.length
                            ? service.employees.map((employee) => employee.name).join(", ")
                            : "Keine Mitarbeiter zugewiesen"}
                        </p>
                      </div>

                      <div className="flex items-center justify-start lg:justify-end">
                        <Link
                          href={`/admin/calendar?serviceId=${service.id}`}
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

          <div className="space-y-5">
            <MetricPanel
              title="Planung diese Woche"
              icon="schedule"
              items={[
                ["Geplante Stunden", `${week.plannedHours || 0}h`],
                ["Reale Stunden", `${week.realHours || 0}h`],
                ["Schätzung", `${week.estimatedHours || 0}h`],
                ["Präzision", `${week.precision || 0}%`],
              ]}
            />

            <MetricPanel
              title="Monat"
              icon="calendar_month"
              items={[
                ["Services", month.total || 0],
                ["Geplante Stunden", `${month.plannedHours || 0}h`],
                ["Wachstum", `${month.growth || 0}%`],
                ["Storniert heute", today.cancelled || 0],
              ]}
            />
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
}: {
  title: string
  value: string | number
  subtitle: string
  icon: string
  color: string
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
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

function AlertCard({
  title,
  value,
  description,
  icon,
  color,
  href,
  alert = false,
}: {
  title: string
  value: string | number
  description: string
  icon: string
  color: string
  href: string
  alert?: boolean
}) {
  return (
    <Link
      href={href}
      className={`rounded-[2rem] border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
        alert ? "border-amber-300 ring-4 ring-amber-50" : "border-slate-100"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-slate-900">{title}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${color}`}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>
    </Link>
  )
}

function MetricPanel({
  title,
  icon,
  items,
}: {
  title: string
  icon: string
  items: Array<[string, string | number]>
}) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <span className="material-symbols-outlined text-3xl text-slate-300">
          {icon}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
          >
            <span className="text-sm font-bold text-slate-500">{label}</span>
            <span className="text-sm font-black text-slate-950">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}