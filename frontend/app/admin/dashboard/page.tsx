"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

type DashboardStats = {
  overview?: {
    servicesToday?: number
    servicesThisWeek?: number
    employeesActiveToday?: number
    employeesInactiveToday?: number
    pendingRequests?: number
    inReviewRequests?: number
    unassignedUpcoming?: number
    inventoryAlerts?: number
    occupancyToday?: number
    totalWeekHours?: number
    precision?: number
    monthGrowth?: number
  }
  services?: any
  employees?: any
  clients?: any
  requests?: any
  inventory?: any
  finance?: any
}

const DASHBOARD_SECTIONS = [
  {
    title: "Services",
    description: "Operación, servicios, asignaciones, horarios y alertas.",
    href: "/admin/dashboard/services",
    icon: "cleaning_services",
    color: "bg-blue-600",
  },
  {
    title: "Mitarbeiter",
    description: "Equipo, ausencias, carga semanal y disponibilidad.",
    href: "/admin/dashboard/employees",
    icon: "groups",
    color: "bg-emerald-600",
  },
  {
    title: "Kunden",
    description: "Clientes activos, clientes sin servicios y volumen.",
    href: "/admin/dashboard/clients",
    icon: "business_center",
    color: "bg-indigo-600",
  },
  {
    title: "Anfragen",
    description: "Solicitudes del cliente, problemas, extras y cambios.",
    href: "/admin/dashboard/requests",
    icon: "mark_unread_chat_alt",
    color: "bg-amber-500",
  },
  {
    title: "Material",
    description: "Inventario, productos faltantes y entregas pendientes.",
    href: "/admin/dashboard/inventory",
    icon: "inventory_2",
    color: "bg-rose-600",
  },
  {
    title: "Finanzen",
    description: "Horas facturables, modelos de cobro y estimaciones.",
    href: "/admin/dashboard/finance",
    icon: "euro",
    color: "bg-slate-900",
  },
]

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadDashboard() {
    try {
      setLoading(true)
      setError("")

      const res = await fetch("/api/admin/stats", {
        cache: "no-store",
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        setError(json?.error || "Dashboard konnte nicht geladen werden.")
        setData(null)
        return
      }

      setData(json)
    } catch {
      setError("Dashboard konnte nicht geladen werden.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const overview = data?.overview || {}

  const criticalAlerts = useMemo(() => {
    return [
      {
        label: "Services ohne Mitarbeiter",
        value: overview.unassignedUpcoming || 0,
        icon: "person_alert",
        href: "/admin/dashboard/services",
      },
      {
        label: "Offene Kundenanfragen",
        value: overview.pendingRequests || 0,
        icon: "mark_unread_chat_alt",
        href: "/admin/dashboard/requests",
      },
      {
        label: "Materialbedarf",
        value: overview.inventoryAlerts || 0,
        icon: "inventory_2",
        href: "/admin/dashboard/inventory",
      },
      {
        label: "Mitarbeiter inaktiv",
        value: overview.employeesInactiveToday || 0,
        icon: "person_off",
        href: "/admin/dashboard/employees",
      },
    ].filter((item) => Number(item.value) > 0)
  }, [overview])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Dashboard wird geladen
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
            Dashboard nicht verfügbar
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            {error || "Die Statistiken konnten nicht geladen werden."}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
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
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              ServiHaus München / Admin
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Operatives Dashboard
            </h1>

            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
              Vista general del sistema. Desde aquí puedes entrar a las vistas
              individuales de servicios, empleados, clientes, solicitudes,
              material y finanzas.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
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
            value={overview.servicesToday || 0}
            subtitle={`${overview.servicesThisWeek || 0} diese Woche`}
            icon="event_available"
            color="bg-blue-600"
          />

          <KpiCard
            title="Team aktiv"
            value={overview.employeesActiveToday || 0}
            subtitle={`${overview.employeesInactiveToday || 0} inaktiv heute`}
            icon="groups"
            color="bg-emerald-600"
          />

          <KpiCard
            title="Auslastung"
            value={`${overview.occupancyToday || 0}%`}
            subtitle={`${overview.totalWeekHours || 0}h diese Woche`}
            icon="monitoring"
            color={
              (overview.occupancyToday || 0) > 90
                ? "bg-red-500"
                : "bg-indigo-600"
            }
          />

          <KpiCard
            title="Offene Anfragen"
            value={overview.pendingRequests || 0}
            subtitle={`${overview.inReviewRequests || 0} in Prüfung`}
            icon="mark_unread_chat_alt"
            color="bg-amber-500"
            alert={(overview.pendingRequests || 0) > 0}
          />
        </div>

        {criticalAlerts.length > 0 && (
          <div className="rounded-[2rem] border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                <span className="material-symbols-outlined">warning</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                  Aufmerksamkeit erforderlich
                </p>

                <h2 className="mt-1 text-xl font-black text-amber-950">
                  Hay elementos que necesitan revisión
                </h2>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {criticalAlerts.map((alert) => (
                    <Link
                      key={alert.label}
                      href={alert.href}
                      className="rounded-2xl bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {alert.label}
                          </p>
                          <p className="mt-1 text-2xl font-black text-amber-600">
                            {alert.value}
                          </p>
                        </div>

                        <span className="material-symbols-outlined text-amber-500">
                          {alert.icon}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {DASHBOARD_SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-105 ${section.color}`}
              >
                <span className="material-symbols-outlined text-3xl">
                  {section.icon}
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950">
                {section.title}
              </h2>

              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                {section.description}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600">
                Ansicht öffnen
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <SummaryPanel
            title="Services"
            icon="cleaning_services"
            href="/admin/dashboard/services"
            items={[
              ["Heute", overview.servicesToday || 0],
              ["Diese Woche", overview.servicesThisWeek || 0],
              ["Ohne Mitarbeiter", overview.unassignedUpcoming || 0],
              ["Präzision", `${overview.precision || 0}%`],
            ]}
          />

          <SummaryPanel
            title="Team"
            icon="groups"
            href="/admin/dashboard/employees"
            items={[
              ["Aktiv heute", overview.employeesActiveToday || 0],
              ["Inaktiv heute", overview.employeesInactiveToday || 0],
              ["Auslastung", `${overview.occupancyToday || 0}%`],
              ["Wochenstunden", `${overview.totalWeekHours || 0}h`],
            ]}
          />

          <SummaryPanel
            title="Anfragen & Material"
            icon="notifications_active"
            href="/admin/dashboard/requests"
            items={[
              ["Offen", overview.pendingRequests || 0],
              ["In Prüfung", overview.inReviewRequests || 0],
              ["Materialbedarf", overview.inventoryAlerts || 0],
              ["Wachstum Monat", `${overview.monthGrowth || 0}%`],
            ]}
          />
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

function SummaryPanel({
  title,
  icon,
  href,
  items,
}: {
  title: string
  icon: string
  href: string
  items: Array<[string, string | number]>
}) {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Zusammenfassung
          </p>

          <h3 className="mt-1 text-xl font-black text-slate-950">{title}</h3>
        </div>

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
            <span className="text-sm font-black text-slate-900">{value}</span>
          </div>
        ))}
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-800"
      >
        Details ansehen
        <span className="material-symbols-outlined text-[18px]">
          arrow_forward
        </span>
      </Link>
    </div>
  )
}