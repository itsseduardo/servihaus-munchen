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

type InventoryAlert = {
  id: number
  clientInventoryId?: number
  clientId?: number
  productId: number
  quantity?: number | string | null
  minimumQuantity?: number | string | null
  client?: {
    id: number
    name: string
    clientCode?: string | null
    address?: string | null
  } | null
  product?: {
    id: number
    name: string
    unit?: string | null
  } | null
}

type InventoryClient = {
  name: string
  count: number
}

type DashboardStats = {
  inventory?: {
    alerts?: number
    totalInventoryItems?: number
    itemsInZero?: number
    itemsPositive?: number
    clientsWithAlerts?: number
    inventoryClients?: InventoryClient[]
    alertsList?: InventoryAlert[]
  }
}

function getNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export default function AdminInventoryDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDispatching, setIsDispatching] = useState<number | null>(null)

  async function loadStats() {
    try {
      setLoading(true)
      setError("")

      const res = await fetch("/api/admin/stats", {
        cache: "no-store",
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        setError(json?.error || "Material-Statistiken konnten nicht geladen werden.")
        setData(null)
        return
      }

      setData(json)
    } catch {
      setError("Material-Statistiken konnten nicht geladen werden.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const inventory = data?.inventory || {}
  const alertsList = inventory.alertsList || []
  const inventoryClients = inventory.inventoryClients || []

  const inventoryStatusData = useMemo(
    () => [
      {
        name: "Verfügbar",
        Anzahl: inventory.itemsPositive || 0,
      },
      {
        name: "Leer / Bedarf",
        Anzahl: inventory.itemsInZero || 0,
      },
    ],
    [inventory]
  )

  const clientsWithAlertsData = useMemo(() => {
    return inventoryClients.slice(0, 10).map((client) => ({
      name: client.name,
      Bedarf: client.count,
    }))
  }, [inventoryClients])

  const productAlertsData = useMemo(() => {
    const productMap = alertsList.reduce<Record<string, number>>((acc, alert) => {
      const productName = alert.product?.name || "Unbekannt"
      acc[productName] = (acc[productName] || 0) + 1
      return acc
    }, {})

    return Object.entries(productMap)
      .map(([name, count]) => ({
        name,
        Bedarf: count,
      }))
      .sort((a, b) => b.Bedarf - a.Bedarf)
      .slice(0, 10)
  }, [alertsList])

  async function handleDispatch(alert: InventoryAlert) {
    const productName = alert.product?.name || "Produkt"
    const clientName = alert.client?.name || "Kunde"

    const qtyStr = window.prompt(
      `Wie viele Einheiten von "${productName}" möchten Sie an ${clientName} liefern?`,
      "1"
    )

    if (!qtyStr) return

    const quantityDelivered = parseFloat(qtyStr)

    if (Number.isNaN(quantityDelivered) || quantityDelivered <= 0) {
      alertDialog("Ungültige Menge.")
      return
    }

    try {
      setIsDispatching(alert.id)
      setError("")

      const res = await fetch("/api/admin/inventory/deliver", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientInventoryId: alert.id,
          productId: alert.productId,
          quantityDelivered,
        }),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        alertDialog(json?.error || "Material konnte nicht geliefert werden.")
        return
      }

      await loadStats()
    } catch {
      alertDialog("Material konnte nicht geliefert werden.")
    } finally {
      setIsDispatching(null)
    }
  }

  function alertDialog(message: string) {
    window.alert(message)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Material-Dashboard wird geladen
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
            {error || "Die Material-Statistiken konnten nicht geladen werden."}
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
              Material & Lieferungen
            </h1>

            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
              Übersicht über Materialbedarf, Produkte auf 0, Kunden mit
              fehlendem Material und direkte Liefererfassung.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/inventory"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-[20px]">
                inventory_2
              </span>
              Inventar öffnen
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
            title="Materialbedarf"
            value={inventory.alerts || 0}
            subtitle="Aktive Materialwarnungen"
            icon="warning"
            color={(inventory.alerts || 0) > 0 ? "bg-rose-600" : "bg-emerald-600"}
            alert={(inventory.alerts || 0) > 0}
          />

          <KpiCard
            title="Inventareinträge"
            value={inventory.totalInventoryItems || 0}
            subtitle="Registrierte Materialpositionen"
            icon="inventory_2"
            color="bg-blue-600"
          />

          <KpiCard
            title="Produkte auf 0"
            value={inventory.itemsInZero || 0}
            subtitle="Müssen geprüft oder geliefert werden"
            icon="remove_shopping_cart"
            color={(inventory.itemsInZero || 0) > 0 ? "bg-orange-500" : "bg-slate-900"}
            alert={(inventory.itemsInZero || 0) > 0}
          />

          <KpiCard
            title="Kunden betroffen"
            value={inventory.clientsWithAlerts || 0}
            subtitle="Mit mindestens einer Materialwarnung"
            icon="business_center"
            color={(inventory.clientsWithAlerts || 0) > 0 ? "bg-amber-500" : "bg-emerald-600"}
            alert={(inventory.clientsWithAlerts || 0) > 0}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Materialstatus"
            description="Vergleich zwischen vorhandenen und leeren Materialpositionen."
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={inventoryStatusData}>
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
            title="Top Kunden mit Materialbedarf"
            description="Kunden mit den meisten Materialwarnungen."
          >
            {clientsWithAlertsData.length === 0 ? (
              <EmptyChart message="Keine Kunden mit Materialbedarf vorhanden." />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={clientsWithAlertsData}
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
                    width={130}
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
                  <Bar dataKey="Bedarf" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <ChartCard
            title="Produkte mit Bedarf"
            description="Produkte, die aktuell bei Kunden fehlen oder auf 0 stehen."
          >
            {productAlertsData.length === 0 ? (
              <EmptyChart message="Keine Produktwarnungen vorhanden." />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={productAlertsData}
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
                    width={130}
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
                  <Bar dataKey="Bedarf" fill="#e11d48" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  Lieferliste
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Aktiver Materialbedarf
                </h2>

                <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                  Materialpositionen, die aktuell auf 0 oder darunter stehen.
                </p>
              </div>

              <Link
                href="/admin/inventory"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:border-blue-200 hover:text-blue-700"
              >
                Inventar verwalten
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </Link>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
              {alertsList.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-5xl text-emerald-500">
                    check_circle
                  </span>

                  <h3 className="mt-3 text-lg font-black text-slate-950">
                    Kein Materialbedarf
                  </h3>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Aktuell stehen keine Kundenmaterialien auf 0.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {alertsList.map((alert) => {
                    const quantity = getNumber(alert.quantity)
                    const unit = alert.product?.unit || "Einheiten"

                    return (
                      <div
                        key={alert.id}
                        className="grid gap-4 p-4 hover:bg-slate-50 lg:grid-cols-[1fr_140px_150px]"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">
                              Bedarf
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                              {quantity} {unit}
                            </span>
                          </div>

                          <h3 className="mt-3 text-sm font-black text-slate-950">
                            {alert.product?.name || "Produkt"}
                          </h3>

                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {alert.client?.name || "Unbekannter Kunde"}
                          </p>

                          {alert.client?.address && (
                            <p className="mt-1 text-xs font-bold text-slate-400">
                              {alert.client.address}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                            Kundencode
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {alert.client?.clientCode || "-"}
                          </p>
                        </div>

                        <div className="flex items-center justify-start lg:justify-end">
                          <button
                            type="button"
                            onClick={() => handleDispatch(alert)}
                            disabled={isDispatching === alert.id}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-black text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {isDispatching === alert.id ? (
                              <span className="material-symbols-outlined animate-spin text-[16px]">
                                sync
                              </span>
                            ) : (
                              <span className="material-symbols-outlined text-[16px]">
                                local_shipping
                              </span>
                            )}
                            Liefern
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
              <span className="material-symbols-outlined">info</span>
            </div>

            <div>
              <p className="text-sm font-black text-blue-900">
                Registro de entregas y reposiciones
              </p>

              <p className="mt-1 text-sm font-medium leading-6 text-blue-800">
                Esta vista resume el material pendiente por cliente. Cuando se
                pulsa <strong>Liefern</strong>, se registra una entrega mediante
                la API de inventario y se actualizan las estadísticas. Esto
                permite saber qué producto se llevó, a qué cliente y cuándo.
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