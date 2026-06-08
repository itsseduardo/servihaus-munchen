"use client"

import { useEffect, useMemo, useState } from "react"
import AddDeliveryModal from "@/components/admin/AddDeliveryModal"

type InventoryItem = {
  id: number
  quantity: number | string
  minStock?: number | string | null
  lastUpdated?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  product: {
    id: number
    name: string
    unit?: string | null
    minStock?: number | string | null
  }
}

type InventoryClientEntry = {
  client: {
    id: number
    name: string
    clientCode?: string | null
    address?: string | null
    email?: string | null
    phone?: string | null
  }
  items: InventoryItem[]
}

type InventoryItemWithClient = InventoryItem & {
  client: {
    id: number
    name: string
    clientCode?: string | null
    address?: string | null
  }
}

type InventoryResponse = {
  alerts?: InventoryItemWithClient[]
  inventoryByClient?: InventoryClientEntry[]
  summary?: {
    totalClients?: number
    totalInventoryItems?: number
    clientsWithInventory?: number
    clientsWithoutInventory?: number
    alerts?: number
  }
}

type FilterMode = "ALL" | "ALERTS" | "OK" | "EMPTY"

function getNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
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

function getItemMinStock(item: InventoryItem) {
  return getNumber(item.minStock ?? item.product?.minStock ?? 0)
}

function getItemLastUpdated(item: InventoryItem) {
  return item.lastUpdated || item.updatedAt || item.createdAt || null
}

function getClientStats(entry: InventoryClientEntry) {
  const items = entry.items || []

  const alertItems = items.filter((item) => {
    const quantity = getNumber(item.quantity)
    const minStock = getItemMinStock(item)
    return quantity <= minStock
  })

  const emptyItems = items.filter((item) => getNumber(item.quantity) <= 0)

  const lowItems = items.filter((item) => {
    const quantity = getNumber(item.quantity)
    const minStock = getItemMinStock(item)

    return quantity > 0 && quantity <= minStock
  })

  const latestDate = items
    .map((item) => getItemLastUpdated(item))
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(String(b)).getTime() - new Date(String(a)).getTime()
    )[0]

  return {
    totalItems: items.length,
    alertItems: alertItems.length,
    emptyItems: emptyItems.length,
    lowItems: lowItems.length,
    okItems: items.length - alertItems.length,
    latestDate,
  }
}

function getItemStatus(item: InventoryItem) {
  const quantity = getNumber(item.quantity)
  const minStock = getItemMinStock(item)

  if (quantity <= 0) {
    return {
      label: "Leer",
      className: "border-rose-100 bg-rose-50 text-rose-700",
      dotClassName: "bg-rose-500",
      icon: "warning",
    }
  }

  if (quantity <= minStock) {
    return {
      label: "Niedrig",
      className: "border-amber-100 bg-amber-50 text-amber-700",
      dotClassName: "bg-amber-500",
      icon: "priority_high",
    }
  }

  return {
    label: "OK",
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
    icon: "check_circle",
  }
}

export default function InventoryPage() {
  const [data, setData] = useState<InventoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] =
    useState<InventoryClientEntry | null>(null)
  const [preselectedClientId, setPreselectedClientId] = useState<
    string | undefined
  >(undefined)

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterMode>("ALL")

  async function fetchInventory() {
    try {
      setLoading(true)
      setError("")

      const res = await fetch("/api/inventory", {
        cache: "no-store",
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        setError(json?.error || "Inventar konnte nicht geladen werden.")
        setData(null)
        return
      }

      setData(json || null)
    } catch (err) {
      console.error("INVENTORY LOAD ERROR:", err)
      setError("Inventar konnte nicht geladen werden.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const inventoryByClient = data?.inventoryByClient || []
  const alerts = data?.alerts || []

  const summary = useMemo(() => {
    const totalClients =
      data?.summary?.totalClients ?? inventoryByClient.length

    const totalItems =
      data?.summary?.totalInventoryItems ??
      inventoryByClient.reduce(
        (sum, entry) => sum + (entry.items?.length || 0),
        0
      )

    const clientsWithAlerts = inventoryByClient.filter((entry) => {
      const stats = getClientStats(entry)
      return stats.alertItems > 0
    }).length

    const clientsWithoutInventory =
      data?.summary?.clientsWithoutInventory ??
      inventoryByClient.filter((entry) => !entry.items || entry.items.length === 0)
        .length

    return {
      totalClients,
      totalItems,
      alerts: data?.summary?.alerts ?? alerts.length,
      clientsWithAlerts,
      clientsWithoutInventory,
    }
  }, [data, inventoryByClient, alerts])

  const filteredClients = useMemo(() => {
    return inventoryByClient.filter((entry) => {
      const query = search.trim().toLowerCase()
      const stats = getClientStats(entry)

      const matchesSearch =
        !query ||
        entry.client.name.toLowerCase().includes(query) ||
        String(entry.client.clientCode || "").toLowerCase().includes(query) ||
        String(entry.client.address || "").toLowerCase().includes(query) ||
        String(entry.client.email || "").toLowerCase().includes(query) ||
        String(entry.client.phone || "").toLowerCase().includes(query)

      const matchesFilter =
        filter === "ALL"
          ? true
          : filter === "ALERTS"
            ? stats.alertItems > 0
            : filter === "OK"
              ? stats.alertItems === 0 && stats.totalItems > 0
              : stats.totalItems === 0

      return matchesSearch && matchesFilter
    })
  }, [inventoryByClient, search, filter])

  function openDeliveryForClient(clientId?: number | string) {
    setPreselectedClientId(clientId ? String(clientId) : undefined)
    setIsDeliveryModalOpen(true)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Kundenmaterial wird geladen
          </p>
        </div>
      </main>
    )
  }

  if (error && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-red-500">
            error
          </span>

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Kundenmaterial nicht verfügbar
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">{error}</p>

          <button
            type="button"
            onClick={fetchInventory}
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
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Material / Kundenmaterial
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Kundenmaterial
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Inventar pro Kunde. Aquí se ve qué material tiene o necesita
                cada cliente, sin mostrar una lista interminable de productos
                repetidos.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => openDeliveryForClient()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-[20px]">
                  local_shipping
                </span>
                Material liefern
              </button>

              <button
                type="button"
                onClick={fetchInventory}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:text-blue-700"
              >
                <span className="material-symbols-outlined text-[20px]">
                  refresh
                </span>
                Aktualisieren
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <CompactKpi
            title="Kunden"
            value={summary.totalClients}
            icon="business_center"
            color="text-blue-600 bg-blue-50"
          />

          <CompactKpi
            title="Positionen"
            value={summary.totalItems}
            icon="inventory_2"
            color="text-indigo-600 bg-indigo-50"
          />

          <CompactKpi
            title="Bedarf"
            value={summary.alerts}
            icon="warning"
            color={
              summary.alerts > 0
                ? "text-rose-600 bg-rose-50"
                : "text-emerald-600 bg-emerald-50"
            }
            alert={summary.alerts > 0}
          />

          <CompactKpi
            title="Kunden mit Bedarf"
            value={summary.clientsWithAlerts}
            icon="person_alert"
            color={
              summary.clientsWithAlerts > 0
                ? "text-amber-600 bg-amber-50"
                : "text-emerald-600 bg-emerald-50"
            }
            alert={summary.clientsWithAlerts > 0}
          />

          <CompactKpi
            title="Ohne Material"
            value={summary.clientsWithoutInventory}
            icon="inventory"
            color="text-slate-600 bg-slate-100"
          />
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-blue-50 px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600">
              info
            </span>

            <p className="text-sm font-medium leading-6 text-blue-800">
              <strong>Kundenmaterial</strong> muestra el inventario por cliente.{" "}
              <strong>Material liefern</strong> registra una entrega y actualiza
              automáticamente el inventario del cliente.
            </p>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="rounded-[2rem] border border-rose-100 bg-rose-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-600">
                  Kritischer Bestand
                </p>

                <h2 className="mt-1 text-xl font-black text-rose-950">
                  {alerts.length} Materialpositionen benötigen Prüfung
                </h2>

                <p className="mt-1 text-sm font-medium leading-6 text-rose-800/80">
                  Estas posiciones están en o por debajo del mínimo definido.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFilter("ALERTS")}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-rose-700 shadow-sm transition-all hover:bg-rose-100"
              >
                <span className="material-symbols-outlined text-[20px]">
                  visibility
                </span>
                Nur Bedarf anzeigen
              </button>
            </div>
          </div>
        )}

        <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Kunde, Kundencode, Adresse, E-Mail oder Telefon suchen..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: "ALL", label: "Alle" },
                { value: "ALERTS", label: "Mit Bedarf" },
                { value: "OK", label: "OK" },
                { value: "EMPTY", label: "Ohne Material" },
              ].map((option) => {
                const isActive = filter === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value as FilterMode)}
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
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Kundenübersicht
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                {filteredClients.length} Kunden
              </h2>
            </div>

            <p className="text-sm font-bold text-slate-400">
              Kompakte Materialübersicht
            </p>
          </div>

          {filteredClients.length === 0 ? (
            <div className="p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">
                inventory_2
              </span>

              <h2 className="mt-4 text-2xl font-black text-slate-950">
                Keine Kunden gefunden
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                Für diese Suche oder diesen Filter gibt es aktuell keine
                passenden Kunden.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr className="text-left">
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Kunde
                        </th>
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Produkte
                        </th>
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Bedarf
                        </th>
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Niedrig
                        </th>
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Status
                        </th>
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Aktualisiert
                        </th>
                        <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Aktion
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredClients.map((entry) => {
                        const stats = getClientStats(entry)
                        const hasAlert = stats.alertItems > 0
                        const hasInventory = stats.totalItems > 0

                        return (
                          <tr key={entry.client.id} className="hover:bg-slate-50">
                            <td className="px-5 py-4">
                              <div>
                                <p className="text-sm font-black text-slate-950">
                                  {entry.client.name}
                                </p>

                                <p className="mt-0.5 text-xs font-bold text-slate-400">
                                  {entry.client.clientCode || "Ohne Kundencode"}
                                </p>

                                {entry.client.address && (
                                  <p className="mt-0.5 max-w-xs truncate text-xs font-medium text-slate-400">
                                    {entry.client.address}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm font-black text-slate-900">
                              {stats.totalItems}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`text-sm font-black ${
                                  stats.emptyItems > 0
                                    ? "text-rose-600"
                                    : "text-slate-700"
                                }`}
                              >
                                {stats.emptyItems}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`text-sm font-black ${
                                  stats.lowItems > 0
                                    ? "text-amber-600"
                                    : "text-slate-700"
                                }`}
                              >
                                {stats.lowItems}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${
                                  !hasInventory
                                    ? "border-slate-200 bg-slate-100 text-slate-600"
                                    : hasAlert
                                      ? "border-rose-100 bg-rose-50 text-rose-700"
                                      : "border-emerald-100 bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    !hasInventory
                                      ? "bg-slate-400"
                                      : hasAlert
                                        ? "bg-rose-500"
                                        : "bg-emerald-500"
                                  }`}
                                />
                                {!hasInventory
                                  ? "Ohne Material"
                                  : hasAlert
                                    ? "Bedarf"
                                    : "OK"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm font-bold text-slate-500">
                              {formatDate(stats.latestDate)}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedClient(entry)}
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition-all hover:border-blue-200 hover:text-blue-700"
                                >
                                  Details
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openDeliveryForClient(entry.client.id)}
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-black text-white transition-all hover:bg-blue-700"
                                >
                                  Liefern
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredClients.map((entry) => {
                  const stats = getClientStats(entry)
                  const hasAlert = stats.alertItems > 0
                  const hasInventory = stats.totalItems > 0

                  return (
                    <div key={entry.client.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950">
                            {entry.client.name}
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-400">
                            {entry.client.clientCode || "Ohne Kundencode"}
                          </p>

                          {entry.client.address && (
                            <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-400">
                              {entry.client.address}
                            </p>
                          )}
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${
                            !hasInventory
                              ? "border-slate-200 bg-slate-100 text-slate-600"
                              : hasAlert
                                ? "border-rose-100 bg-rose-50 text-rose-700"
                                : "border-emerald-100 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {!hasInventory ? "Ohne Material" : hasAlert ? "Bedarf" : "OK"}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <MiniStat
                          label="Produkte"
                          value={stats.totalItems}
                          className="bg-slate-50 text-slate-700"
                        />

                        <MiniStat
                          label="Leer"
                          value={stats.emptyItems}
                          className={
                            stats.emptyItems > 0
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-50 text-slate-700"
                          }
                        />

                        <MiniStat
                          label="Niedrig"
                          value={stats.lowItems}
                          className={
                            stats.lowItems > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-50 text-slate-700"
                          }
                        />
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedClient(entry)}
                          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700"
                        >
                          Details
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeliveryForClient(entry.client.id)}
                          className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white"
                        >
                          Liefern
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {selectedClient && (
        <ClientInventoryModal
          entry={selectedClient}
          onClose={() => setSelectedClient(null)}
          onAddMaterial={() => {
            const clientId = selectedClient.client.id
            setSelectedClient(null)
            openDeliveryForClient(clientId)
          }}
        />
      )}

      {isDeliveryModalOpen && (
        <AddDeliveryModal
          preselectedClientId={preselectedClientId}
          onClose={() => {
            setIsDeliveryModalOpen(false)
            setPreselectedClientId(undefined)
          }}
          onSuccess={() => {
            setIsDeliveryModalOpen(false)
            setPreselectedClientId(undefined)
            fetchInventory()
          }}
        />
      )}
    </main>
  )
}

function CompactKpi({
  title,
  value,
  icon,
  color,
  alert = false,
}: {
  title: string
  value: string | number
  icon: string
  color: string
  alert?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 shadow-sm ${
        alert ? "border-amber-300 ring-4 ring-amber-50" : "border-slate-100"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
            {title}
          </p>

          <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
        </div>

        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${color}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  className,
}: {
  label: string
  value: string | number
  className: string
}) {
  return (
    <div className={`rounded-2xl p-3 text-center ${className}`}>
      <p className="text-xl font-black">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] opacity-70">
        {label}
      </p>
    </div>
  )
}

function ClientInventoryModal({
  entry,
  onClose,
  onAddMaterial,
}: {
  entry: InventoryClientEntry
  onClose: () => void
  onAddMaterial: () => void
}) {
  const stats = getClientStats(entry)

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Schließen"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Kundenmaterial
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {entry.client.name}
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {entry.client.clientCode || "Ohne Kundencode"}
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
        </div>

        <div className="space-y-6 p-6">
          <div className="grid gap-3 sm:grid-cols-4">
            <MiniStat
              label="Produkte"
              value={stats.totalItems}
              className="bg-slate-50 text-slate-700"
            />

            <MiniStat
              label="OK"
              value={stats.okItems}
              className="bg-emerald-50 text-emerald-700"
            />

            <MiniStat
              label="Niedrig"
              value={stats.lowItems}
              className="bg-amber-50 text-amber-700"
            />

            <MiniStat
              label="Leer"
              value={stats.emptyItems}
              className="bg-rose-50 text-rose-700"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100">
            {entry.items.length === 0 ? (
              <div className="p-10 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300">
                  inventory_2
                </span>

                <h3 className="mt-3 text-lg font-black text-slate-950">
                  Noch kein Material registriert
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Für diesen Kunden wurde noch kein Material hinterlegt.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr className="text-left">
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Produkt
                        </th>
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Menge
                        </th>
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Minimum
                        </th>
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Status
                        </th>
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Aktualisiert
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {entry.items.map((item) => {
                        const status = getItemStatus(item)
                        const quantity = getNumber(item.quantity)
                        const minStock = getItemMinStock(item)

                        return (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-5 py-4">
                              <p className="text-sm font-black text-slate-950">
                                {item.product.name}
                              </p>
                              <p className="mt-0.5 text-xs font-bold text-slate-400">
                                {item.product.unit || "Einheiten"}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm font-black text-slate-900">
                              {quantity}
                            </td>

                            <td className="px-5 py-4 text-sm font-bold text-slate-600">
                              {minStock}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${status.className}`}
                              >
                                <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
                                {status.label}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm font-bold text-slate-500">
                              {formatDate(getItemLastUpdated(item))}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                  {entry.items.map((item) => {
                    const status = getItemStatus(item)

                    return (
                      <div key={item.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-950">
                              {item.product.name}
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-400">
                              {getNumber(item.quantity)}{" "}
                              {item.product.unit || "Einheiten"}
                            </p>
                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50"
            >
              Schließen
            </button>

            <button
              type="button"
              onClick={onAddMaterial}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
            >
              Material liefern
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}