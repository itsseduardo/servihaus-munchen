"use client"

import { useEffect, useMemo, useState } from "react"

import AddProductModal from "@/components/admin/AddProductModal"
import InboundModal from "@/components/admin/InboundModal"

type Product = {
  id: number
  name: string
  unit?: string | null
  globalStock?: number | string | null
  minStock?: number | string | null
  createdAt?: string | null
  updatedAt?: string | null
}

type FilterMode = "ALL" | "LOW" | "OK" | "EMPTY"

function getNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function getProductIcon(productName: string) {
  const name = productName.toLowerCase()

  if (name.includes("handschuh") || name.includes("guante") || name.includes("glove")) {
    return "back_hand"
  }

  if (name.includes("papier") || name.includes("paper") || name.includes("papel") || name.includes("rolle")) {
    return "article"
  }

  if (name.includes("sack") || name.includes("beutel") || name.includes("bolsa")) {
    return "delete"
  }

  if (name.includes("seife") || name.includes("jabon") || name.includes("soap")) {
    return "soap"
  }

  if (
    name.includes("desinfektion") ||
    name.includes("reiniger") ||
    name.includes("lejía") ||
    name.includes("bleach") ||
    name.includes("chlor")
  ) {
    return "sanitizer"
  }

  return "inventory_2"
}

function getStockStatus(product: Product) {
  const stock = getNumber(product.globalStock)
  const minStock = getNumber(product.minStock)

  if (stock <= 0) {
    return {
      label: "Leer",
      description: "Kein Bestand",
      className: "border-rose-100 bg-rose-50 text-rose-700",
      dotClassName: "bg-rose-500",
      icon: "warning",
    }
  }

  if (stock <= minStock) {
    return {
      label: "Niedrig",
      description: "Nachfüllen empfohlen",
      className: "border-amber-100 bg-amber-50 text-amber-700",
      dotClassName: "bg-amber-500",
      icon: "priority_high",
    }
  }

  return {
    label: "OK",
    description: "Ausreichender Bestand",
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
    icon: "check_circle",
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

export default function ProductsCatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isInboundModalOpen, setIsInboundModalOpen] = useState(false)
  const [preselectedProductId, setPreselectedProductId] = useState<string | undefined>()

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterMode>("ALL")

  async function fetchProducts() {
    try {
      setLoading(true)

      const res = await fetch("/api/products", {
        cache: "no-store",
      })

      const data = await res.json().catch(() => [])
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("PRODUCTS LOAD ERROR:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  function handleOpenInboundForProduct(productId: number | string) {
    setPreselectedProductId(String(productId))
    setIsInboundModalOpen(true)
  }

  function handleOpenGeneralInbound() {
    setPreselectedProductId(undefined)
    setIsInboundModalOpen(true)
  }

  const summary = useMemo(() => {
    const total = products.length

    const empty = products.filter((product) => getNumber(product.globalStock) <= 0).length

    const low = products.filter((product) => {
      const stock = getNumber(product.globalStock)
      const minStock = getNumber(product.minStock)
      return stock > 0 && stock <= minStock
    }).length

    const ok = total - empty - low

    const totalStock = products.reduce(
      (sum, product) => sum + getNumber(product.globalStock),
      0
    )

    return {
      total,
      empty,
      low,
      ok,
      totalStock,
      needsAttention: empty + low,
    }
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = search.trim().toLowerCase()
      const stock = getNumber(product.globalStock)
      const minStock = getNumber(product.minStock)

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        String(product.unit || "").toLowerCase().includes(query)

      const matchesFilter =
        filter === "ALL"
          ? true
          : filter === "EMPTY"
            ? stock <= 0
            : filter === "LOW"
              ? stock > 0 && stock <= minStock
              : stock > minStock

      return matchesSearch && matchesFilter
    })
  }, [products, search, filter])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
            Produktkatalog wird geladen
          </p>
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
                Material / Produktkatalog
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Produktkatalog & Zentrallager
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
                Catálogo maestro de productos y stock central de ServiHaus. Aquí
                no se asigna material a clientes; eso se gestiona en Kundenmaterial.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:text-blue-700"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add_box
                </span>
                Neues Produkt
              </button>

              <button
                type="button"
                onClick={handleOpenGeneralInbound}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-[20px]">
                  warehouse
                </span>
                Wareneingang
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <CompactKpi
            title="Produkte"
            value={summary.total}
            icon="inventory_2"
            color="text-blue-600 bg-blue-50"
          />

          <CompactKpi
            title="Bestand gesamt"
            value={summary.totalStock}
            icon="warehouse"
            color="text-indigo-600 bg-indigo-50"
          />

          <CompactKpi
            title="OK"
            value={summary.ok}
            icon="check_circle"
            color="text-emerald-600 bg-emerald-50"
          />

          <CompactKpi
            title="Niedrig"
            value={summary.low}
            icon="priority_high"
            color={
              summary.low > 0
                ? "text-amber-600 bg-amber-50"
                : "text-slate-600 bg-slate-100"
            }
            alert={summary.low > 0}
          />

          <CompactKpi
            title="Leer"
            value={summary.empty}
            icon="warning"
            color={
              summary.empty > 0
                ? "text-rose-600 bg-rose-50"
                : "text-slate-600 bg-slate-100"
            }
            alert={summary.empty > 0}
          />
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-blue-50 px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600">
              info
            </span>

            <p className="text-sm font-medium leading-6 text-blue-800">
              <strong>Produktkatalog</strong> define qué productos existen y el
              stock central. <strong>Kundenmaterial</strong> define qué material
              tiene o necesita cada cliente.
            </p>
          </div>
        </div>

        {summary.needsAttention > 0 && (
          <div className="rounded-[2rem] border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                  Einkauf / Lagerprüfung
                </p>

                <h2 className="mt-1 text-xl font-black text-amber-950">
                  {summary.needsAttention} Produkte benötigen Aufmerksamkeit
                </h2>

                <p className="mt-1 text-sm font-medium leading-6 text-amber-800/80">
                  Produkte mit leerem oder niedrigem Bestand sollten geprüft oder
                  per Wareneingang aufgefüllt werden.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenGeneralInbound}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-amber-700 shadow-sm transition-all hover:bg-amber-100"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add_shopping_cart
                </span>
                Bestand auffüllen
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
                placeholder="Produktname oder Einheit suchen..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: "ALL", label: "Alle" },
                { value: "LOW", label: "Niedrig" },
                { value: "EMPTY", label: "Leer" },
                { value: "OK", label: "OK" },
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
                Produktliste
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                {filteredProducts.length} Produkte
              </h2>
            </div>

            <p className="text-sm font-bold text-slate-400">
              Kompakte Lagerübersicht
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">
                inventory_2
              </span>

              <h2 className="mt-4 text-2xl font-black text-slate-950">
                Keine Produkte gefunden
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                Für diese Suche oder diesen Filter gibt es aktuell keine Produkte.
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
                          Produkt
                        </th>
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Einheit
                        </th>
                        <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Zentrallager
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
                        <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Aktion
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((product) => {
                        const status = getStockStatus(product)
                        const stock = getNumber(product.globalStock)
                        const minStock = getNumber(product.minStock)

                        return (
                          <tr key={product.id} className="hover:bg-slate-50">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                                  <span className="material-symbols-outlined text-[20px]">
                                    {getProductIcon(product.name)}
                                  </span>
                                </div>

                                <div>
                                  <p className="text-sm font-black text-slate-950">
                                    {product.name}
                                  </p>
                                  <p className="mt-0.5 text-xs font-bold text-slate-400">
                                    ID #{product.id}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm font-bold text-slate-600">
                              {product.unit || "Einheiten"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`text-sm font-black ${
                                  stock <= 0
                                    ? "text-rose-600"
                                    : stock <= minStock
                                      ? "text-amber-600"
                                      : "text-slate-900"
                                }`}
                              >
                                {stock}
                              </span>
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
                              {formatDate(product.updatedAt || product.createdAt)}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenInboundForProduct(product.id)}
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-black text-white transition-all hover:bg-blue-700"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    add_shopping_cart
                                  </span>
                                  Einbuchen
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
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product)
                  const stock = getNumber(product.globalStock)
                  const minStock = getNumber(product.minStock)

                  return (
                    <div key={product.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                            <span className="material-symbols-outlined">
                              {getProductIcon(product.name)}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-950">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-400">
                              {product.unit || "Einheiten"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <MiniStat
                          label="Bestand"
                          value={stock}
                          className="bg-slate-50 text-slate-700"
                        />

                        <MiniStat
                          label="Minimum"
                          value={minStock}
                          className="bg-slate-50 text-slate-700"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenInboundForProduct(product.id)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          add_shopping_cart
                        </span>
                        Wareneingang einbuchen
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {isProductModalOpen && (
        <AddProductModal
          onClose={() => setIsProductModalOpen(false)}
          onSuccess={() => {
            setIsProductModalOpen(false)
            fetchProducts()
          }}
        />
      )}

      {isInboundModalOpen && (
        <InboundModal
          preselectedProductId={preselectedProductId}
          onClose={() => {
            setIsInboundModalOpen(false)
            setPreselectedProductId(undefined)
          }}
          onSuccess={() => {
            setIsInboundModalOpen(false)
            setPreselectedProductId(undefined)
            fetchProducts()
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