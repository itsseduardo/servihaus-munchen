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

type EmployeeWorkload = {
    id: number
    name: string
    fullName: string
    weekHours: number
    weekPlannedHours?: number
    weekRealHours?: number
    todayHours: number
    todayPlannedHours?: number
    todayRealHours?: number
    contractedHoursPerWeek: number
    availableToday: number
    isInactiveToday: boolean
    inactiveReason?: string | null
    inactiveReasonLabel?: string | null
    inactiveSince?: string | null
    inactiveUntil?: string | null
}

type DashboardStats = {
    employees?: {
        total?: number
        activeToday?: number
        inactiveToday?: number
        inactiveByReason?: Array<{
            reason: string
            label: string
            count: number
        }>
        upcomingReturns?: Array<{
            id: number
            name: string
            reason?: string | null
            reasonLabel?: string | null
            inactiveSince?: string | null
            inactiveUntil?: string | null
        }>
        workload?: EmployeeWorkload[]
        topEmployees?: EmployeeWorkload[]
        withoutAssignments?: EmployeeWorkload[]
        capacity?: {
            totalCapacityToday?: number
            totalAssignedToday?: number
            occupancyToday?: number
        }
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

export default function AdminEmployeesDashboardPage() {
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
                setError(
                    json?.error || "Mitarbeiter-Statistiken konnten nicht geladen werden."
                )
                setData(null)
                return
            }

            setData(json)
        } catch {
            setError("Mitarbeiter-Statistiken konnten nicht geladen werden.")
            setData(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStats()
    }, [])

    const employees = data?.employees || {}
    const workload = employees.workload || []
    const topEmployees = employees.topEmployees || []
    const inactiveByReason = employees.inactiveByReason || []
    const upcomingReturns = employees.upcomingReturns || []
    const withoutAssignments = employees.withoutAssignments || []
    const capacity = employees.capacity || {}

    const capacityChartData = useMemo(
        () => [
            {
                name: "Heute",
                Kapazität: Number(capacity.totalCapacityToday || 0),
                Zugewiesen: Number(capacity.totalAssignedToday || 0),
            },
        ],
        [capacity]
    )

    const workloadChartData = useMemo(() => {
        return topEmployees.slice(0, 10).map((employee) => ({
            name: employee.name || employee.fullName,
            Geplant: Number(employee.weekPlannedHours ?? employee.weekHours ?? 0),
            Gearbeitet: Number(employee.weekRealHours ?? 0),
            Vertrag: Number(employee.contractedHoursPerWeek || 0),
        }))
    }, [topEmployees])

    const inactiveReasonChartData = useMemo(() => {
        return inactiveByReason.map((item) => ({
            name: item.label,
            Anzahl: item.count,
        }))
    }, [inactiveByReason])

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                        Mitarbeiter-Dashboard wird geladen
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
                        {error || "Die Mitarbeiter-Statistiken konnten nicht geladen werden."}
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
                            Mitarbeiter
                        </h1>

                        <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                            Übersicht über aktive Mitarbeiter, Inaktivitäten, Urlaub,
                            Rückkehrdaten, Kapazität und Arbeitslast.
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
                        title="Mitarbeiter gesamt"
                        value={employees.total || 0}
                        subtitle="Im System registriert"
                        icon="groups"
                        color="bg-blue-600"
                    />

                    <KpiCard
                        title="Aktiv heute"
                        value={employees.activeToday || 0}
                        subtitle="Verfügbar für Planung"
                        icon="person_check"
                        color="bg-emerald-600"
                    />

                    <KpiCard
                        title="Inaktiv heute"
                        value={employees.inactiveToday || 0}
                        subtitle="Urlaub, Krankheit oder Sperre"
                        icon="person_off"
                        color={(employees.inactiveToday || 0) > 0 ? "bg-rose-600" : "bg-slate-900"}
                        alert={(employees.inactiveToday || 0) > 0}
                    />

                    <KpiCard
                        title="Auslastung heute"
                        value={`${capacity.occupancyToday || 0}%`}
                        subtitle={`${capacity.totalAssignedToday || 0}h von ${capacity.totalCapacityToday || 0}h`}
                        icon="monitoring"
                        color={(capacity.occupancyToday || 0) > 90 ? "bg-red-500" : "bg-indigo-600"}
                        alert={(capacity.occupancyToday || 0) > 90}
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <ChartCard
                        title="Arbeitslast diese Woche"
                        description="Vergleich zwischen zugewiesenen Wochenstunden und Vertragsstunden."
                    >
                        {workloadChartData.length === 0 ? (
                            <EmptyChart message="Keine Arbeitslastdaten vorhanden." />
                        ) : (
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart
                                    data={workloadChartData}
                                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12, fill: "#64748b", fontWeight: 700 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    <YAxis
                                        tick={{ fontSize: 12, fill: "#64748b" }}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
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

                                    <Bar
                                        dataKey="Geplant"
                                        fill="#2563eb"
                                        radius={[8, 8, 0, 0]}
                                    />

                                    <Bar
                                        dataKey="Gearbeitet"
                                        fill="#16a34a"
                                        radius={[8, 8, 0, 0]}
                                    />

                                    <Bar
                                        dataKey="Vertrag"
                                        fill="#94a3b8"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Kapazität heute"
                        description="Zeigt, ob die geplante Arbeit die verfügbare Tageskapazität übersteigt."
                    >
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={capacityChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="Kapazität" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="Zugewiesen" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                    <ChartCard
                        title="Inaktivität nach Grund"
                        description="Auswertung der aktuell inaktiven Mitarbeiter nach Grund."
                    >
                        {inactiveReasonChartData.length === 0 ? (
                            <EmptyChart message="Heute gibt es keine inaktiven Mitarbeiter." />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={inactiveReasonChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="Anzahl" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                                    Rückkehrplanung
                                </p>

                                <h2 className="mt-1 text-xl font-black text-slate-950">
                                    Nächste Rückkehrdaten
                                </h2>
                            </div>

                            <Link
                                href="/admin/employees"
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700"
                            >
                                Mitarbeiter öffnen
                                <span className="material-symbols-outlined text-[18px]">
                                    arrow_forward
                                </span>
                            </Link>
                        </div>

                        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
                            {upcomingReturns.length === 0 ? (
                                <div className="p-8 text-center">
                                    <span className="material-symbols-outlined text-5xl text-slate-300">
                                        event_available
                                    </span>
                                    <h3 className="mt-3 text-lg font-black text-slate-950">
                                        Keine geplanten Rückkehrdaten
                                    </h3>
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        Aktuell gibt es keine inaktiven Mitarbeiter mit Enddatum.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {upcomingReturns.map((employee) => (
                                        <div
                                            key={employee.id}
                                            className="grid gap-3 p-4 hover:bg-slate-50 sm:grid-cols-[1fr_150px_130px]"
                                        >
                                            <div>
                                                <p className="text-sm font-black text-slate-900">
                                                    {employee.name}
                                                </p>
                                                <p className="mt-1 text-xs font-bold text-slate-400">
                                                    {employee.reasonLabel || "Nicht angegeben"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                                                    Seit
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-slate-700">
                                                    {formatDate(employee.inactiveSince)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                                                    Bis
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-emerald-700">
                                                    {formatDate(employee.inactiveUntil)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    <EmployeeTable
                        title="Top Arbeitslast"
                        description="Mitarbeiter mit den meisten zugewiesenen Stunden diese Woche."
                        employees={topEmployees}
                        emptyMessage="Keine Mitarbeiter mit Wochenstunden vorhanden."
                    />

                    <EmployeeTable
                        title="Ohne Zuweisung"
                        description="Aktive Mitarbeiter ohne zugewiesene Stunden in dieser Woche."
                        employees={withoutAssignments}
                        emptyMessage="Alle aktiven Mitarbeiter haben diese Woche Zuweisungen."
                    />
                </div>

                <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                            <span className="material-symbols-outlined">info</span>
                        </div>

                        <div>
                            <p className="text-sm font-black text-blue-900">
                                Hinweis zur Inaktivität
                            </p>

                            <p className="mt-1 text-sm font-medium leading-6 text-blue-800">
                                Die Auswertung berücksichtigt <strong>inactiveSince</strong> und{" "}
                                <strong>inactiveUntil</strong>. Ein Mitarbeiter zählt nur dann
                                als inaktiv, wenn das heutige Datum innerhalb dieses Zeitraums
                                liegt. Dadurch können Urlaub, Krankheit und Rückkehrdaten später
                                sauber für Statistiken ausgewertet werden.
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
            className={`relative overflow-hidden rounded-[2rem] border bg-white p-6 shadow-sm ${alert ? "border-amber-300 ring-4 ring-amber-50" : "border-slate-100"
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

function EmployeeTable({
    title,
    description,
    employees,
    emptyMessage,
}: {
    title: string
    description: string
    employees: EmployeeWorkload[]
    emptyMessage: string
}) {
    return (
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                    Mitarbeiterliste
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>

                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                    {description}
                </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
                {employees.length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300">
                            groups
                        </span>

                        <p className="mt-3 text-sm font-bold text-slate-500">
                            {emptyMessage}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {employees.map((employee) => (
                            <div
                                key={employee.id}
                                className="grid gap-3 p-4 hover:bg-slate-50 sm:grid-cols-[1fr_110px_110px]"
                            >
                                <div>
                                    <p className="text-sm font-black text-slate-900">
                                        {employee.fullName || employee.name}
                                    </p>

                                    <p className="mt-1 text-xs font-bold text-slate-400">
                                        {employee.isInactiveToday
                                            ? employee.inactiveReasonLabel || "Inaktiv"
                                            : "Aktiv"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                                        Woche
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-700">
                                        {employee.weekPlannedHours ?? employee.weekHours ?? 0}h geplant
                                    </p>
                                    <p className="mt-0.5 text-xs font-bold text-emerald-600">
                                        {employee.weekRealHours ?? 0}h gearbeitet
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                                        Heute
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-slate-700">
                                        {employee.todayPlannedHours ?? employee.todayHours ?? 0}h geplant
                                    </p>
                                    <p className="mt-0.5 text-xs font-bold text-emerald-600">
                                        {employee.todayRealHours ?? 0}h gearbeitet
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}