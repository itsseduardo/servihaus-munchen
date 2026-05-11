"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

type ServiceHistoryItem = {
  id: string
  dateIso: string
  dateLabel: string
  timeLabel: string
  serviceType: string
  category: string
  durationLabel: string
  durationValue: number
  professionals: string[]
  primaryProfessional: string
  status: string
  notes: string
}

type HistoryResponse = {
  items: ServiceHistoryItem[]
  total: number
}

const PAGE_SIZE = 6

function getStatusStyles(status: string) {
  const normalized = status?.toUpperCase?.() || ""

  if (["DONE", "COMPLETED", "FINISHED"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100"
  }

  if (["CANCELLED", "FAILED"].includes(normalized)) {
    return "bg-rose-50 text-rose-700 border-rose-100"
  }

  if (["IN_PROGRESS", "ONGOING"].includes(normalized)) {
    return "bg-amber-50 text-amber-700 border-amber-100"
  }

  return "bg-slate-100 text-slate-600 border-slate-200"
}

function formatStatus(status: string) {
  const normalized = status?.toUpperCase?.() || ""

  switch (normalized) {
    case "COMPLETED":
    case "DONE":
    case "FINISHED":
      return "Abgeschlossen"
    case "CANCELLED":
      return "Storniert"
    case "IN_PROGRESS":
      return "In Bearbeitung"
    case "PENDING":
      return "Ausstehend"
    default:
      return status || "Unbekannt"
  }
}

function downloadCSV(rows: ServiceHistoryItem[]) {
  const headers = [
    "Datum",
    "Uhrzeit",
    "Service",
    "Kategorie",
    "Dauer",
    "Personal",
    "Status",
    "Notizen",
  ]

  const csvRows = rows.map((row) => [
    row.dateLabel,
    row.timeLabel,
    row.serviceType,
    row.category,
    row.durationLabel,
    row.professionals.join(" | "),
    formatStatus(row.status),
    row.notes.replace(/\n/g, " "),
  ])

  const csvContent = [headers, ...csvRows]
    .map((line) =>
      line
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", "service-history.csv")
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export default function ClientHistoryPage() {
  const [items, setItems] = useState<ServiceHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<ServiceHistoryItem | null>(
    null
  )

  useEffect(() => {
    async function loadHistory() {
      try {
        setError("")

        const res = await fetch("/api/clients/history", {
          method: "GET",
          cache: "no-store",
        })

        const data: HistoryResponse | { error?: string } = await res
          .json()
          .catch(() => ({ error: "Verlauf konnte nicht geladen werden." }))

        if (!res.ok) {
          setError("error" in data ? data.error || "Verlauf konnte nicht geladen werden." : "Verlauf konnte nicht geladen werden.")
          return
        }

        setItems("items" in data ? data.items || [] : [])
      } catch {
        setError("Verlauf konnte nicht geladen werden.")
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.category))).filter(
      Boolean
    )
    return ["ALL", ...unique]
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search ||
        item.serviceType.toLowerCase().includes(search.toLowerCase()) ||
        item.primaryProfessional.toLowerCase().includes(search.toLowerCase()) ||
        item.professionals.join(" ").toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        category === "ALL" ? true : item.category === category

      return matchesSearch && matchesCategory
    })
  }, [items, search, category])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return filteredItems.slice(start, end)
  }, [filteredItems, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, category])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                  Historie wird geladen
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Portal / Historie
          </p>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Service Historie
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Eine Übersicht Ihrer vergangenen Services und Einsätze.
              </p>
            </div>

            <button
              type="button"
              onClick={() => downloadCSV(filteredItems)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:text-blue-700"
            >
              <span className="material-symbols-outlined text-[20px]">
                download
              </span>
              Export CSV
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_220px]">
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by service type or professional..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-300"
            >
              <option value="ALL">All Categories</option>
              {categories
                .filter((item) => item !== "ALL")
                .map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Empty state */}
        {!error && filteredItems.length === 0 && (
          <div className="mt-6 rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-400">
              history
            </span>
            <h2 className="mt-4 text-2xl font-black text-slate-900">
              Keine Einträge gefunden
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Für die aktuelle Suche oder Kategorie gibt es keine vergangenen
              Services.
            </p>
          </div>
        )}

        {/* Desktop table */}
        {!error && filteredItems.length > 0 && (
          <div className="mt-6 hidden overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Service Type
                    </th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Professional
                    </th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-6 py-5 align-top">
                        <div className="font-black text-slate-900">
                          {item.dateLabel}
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-400">
                          {item.timeLabel}
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <span className="material-symbols-outlined text-[20px]">
                              cleaning_services
                            </span>
                          </div>

                          <div>
                            <div className="font-bold text-slate-900">
                              {item.serviceType}
                            </div>
                            <div className="mt-1 text-xs font-medium text-slate-400">
                              {item.category}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 align-top text-sm font-bold text-slate-700">
                        {item.durationLabel}
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="font-bold text-slate-800">
                          {item.primaryProfessional}
                        </div>
                        {item.professionals.length > 1 && (
                          <div className="mt-1 text-xs font-medium text-slate-400">
                            +{item.professionals.length - 1} weitere
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-5 align-top">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getStatusStyles(
                            item.status
                          )}`}
                        >
                          {formatStatus(item.status)}
                        </span>
                      </td>

                      <td className="px-6 py-5 align-top">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="text-sm font-black text-slate-700 transition-colors hover:text-blue-600"
                          >
                            Details
                          </button>

                          <Link
                            href={`/client/support?serviceId=${item.id}`}
                            className="text-sm font-black text-blue-600 transition-colors hover:text-blue-800"
                          >
                            Problem melden
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                {Math.min(currentPage * PAGE_SIZE, filteredItems.length)} of{" "}
                {filteredItems.length} services
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:border-blue-200 hover:text-blue-600"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    chevron_left
                  </span>
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1
                  const isActive = page === currentPage

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-black transition-all ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600"
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:border-blue-200 hover:text-blue-600"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile cards */}
        {!error && filteredItems.length > 0 && (
          <div className="mt-6 grid gap-4 md:hidden">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      {item.dateLabel} · {item.timeLabel}
                    </p>
                    <h3 className="mt-2 text-lg font-black text-slate-950">
                      {item.serviceType}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {item.category}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${getStatusStyles(
                      item.status
                    )}`}
                  >
                    {formatStatus(item.status)}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Duration
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {item.durationLabel}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Professional
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {item.primaryProfessional}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="text-sm font-black text-slate-700"
                  >
                    Details
                  </button>

                  <Link
                    href={`/client/support?serviceId=${item.id}`}
                    className="text-sm font-black text-blue-600"
                  >
                    Problem melden
                  </Link>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-black text-slate-600 disabled:opacity-40"
              >
                Zurück
              </button>

              <span className="text-sm font-black text-slate-600">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-black text-slate-600 disabled:opacity-40"
              >
                Weiter
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Details modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Service Details
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  {selectedItem.serviceType}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid gap-4 px-6 py-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Datum
                </p>
                <p className="mt-2 text-sm font-bold text-slate-800">
                  {selectedItem.dateLabel}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Uhrzeit
                </p>
                <p className="mt-2 text-sm font-bold text-slate-800">
                  {selectedItem.timeLabel}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Kategorie
                </p>
                <p className="mt-2 text-sm font-bold text-slate-800">
                  {selectedItem.category}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Dauer
                </p>
                <p className="mt-2 text-sm font-bold text-slate-800">
                  {selectedItem.durationLabel}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Personal
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedItem.professionals.length > 0 ? (
                    selectedItem.professionals.map((professional) => (
                      <span
                        key={professional}
                        className="rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm"
                      >
                        {professional}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-bold text-slate-500">
                      Nicht hinterlegt
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Notizen
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                  {selectedItem.notes || "Keine zusätzlichen Notizen vorhanden."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:justify-end">
              <Link
                href={`/client/support?serviceId=${selectedItem.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-all hover:border-blue-200 hover:text-blue-700"
              >
                <span className="material-symbols-outlined text-[20px]">
                  support_agent
                </span>
                Problem melden
              </Link>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition-all hover:bg-blue-700"
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