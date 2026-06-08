"use client"

import { useEffect, useMemo, useState } from "react"

type Product = {
  id: number
  name: string
  unit?: string | null
  globalStock?: number | string | null
}

type Props = {
  onClose: () => void
  onSuccess: () => void
  preselectedProductId?: string
}

function getNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export default function InboundModal({
  onClose,
  onSuccess,
  preselectedProductId,
}: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [productId, setProductId] = useState(preselectedProductId || "")
  const [quantity, setQuantity] = useState("")
  const [provider, setProvider] = useState("")
  const [costPerUnit, setCostPerUnit] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    async function loadProducts() {
      try {
        setProductsLoading(true)

        const res = await fetch("/api/products", {
          cache: "no-store",
        })

        const data = await res.json().catch(() => [])

        setProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("PRODUCTS LOAD ERROR:", error)
        setProducts([])
      } finally {
        setProductsLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    if (preselectedProductId) {
      setProductId(preselectedProductId)
    }
  }, [preselectedProductId])

  const selectedProduct = useMemo(() => {
    return products.find((product) => String(product.id) === String(productId))
  }, [products, productId])

  const currentStock = getNumber(selectedProduct?.globalStock)
  const parsedQuantity = Number(quantity)
  const parsedCost = costPerUnit ? Number(costPerUnit) : null

  const newStock =
    selectedProduct && Number.isFinite(parsedQuantity) && parsedQuantity > 0
      ? currentStock + parsedQuantity
      : currentStock

  const totalCost =
    parsedCost !== null &&
    Number.isFinite(parsedCost) &&
    Number.isFinite(parsedQuantity) &&
    parsedQuantity > 0
      ? parsedCost * parsedQuantity
      : null

  async function handleSubmit() {
    try {
      setError("")

      if (!productId) {
        setError("Bitte wählen Sie ein Produkt aus.")
        return
      }

      if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
        setError("Bitte geben Sie eine gültige Menge ein.")
        return
      }

      if (
        costPerUnit &&
        (!Number.isFinite(Number(costPerUnit)) || Number(costPerUnit) < 0)
      ) {
        setError("Bitte geben Sie einen gültigen Stückpreis ein.")
        return
      }

      setLoading(true)

      const res = await fetch("/api/admin/inventory/inbound", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: Number(productId),
          quantity: parsedQuantity,
          provider: provider.trim() || null,
          costPerUnit: parsedCost,
          notes: notes.trim() || null,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Wareneingang konnte nicht gespeichert werden.")
        return
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error("INBOUND CREATE ERROR:", error)
      setError("Wareneingang konnte nicht gespeichert werden.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 text-slate-900 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Schließen"
      />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-t-[2rem] border border-slate-100 bg-white shadow-2xl sm:rounded-[2rem]">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Zentrallager
          </p>

          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Wareneingang einbuchen
              </h2>

              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                Erfassen Sie Material, das ins zentrale ServiHaus-Lager kommt.
                Das ist keine Lieferung an einen Kunden.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600">
                info
              </span>

              <p className="text-sm font-medium leading-6 text-blue-800">
                Use este formulario cuando ServiHaus compra o recibe productos
                para su almacén central. Para registrar que un producto fue
                llevado a una casa, use Kundenmaterial / Material liefern.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Produkt
            </label>

            <select
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              disabled={productsLoading || Boolean(preselectedProductId)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {productsLoading ? "Produkte werden geladen..." : "Produkt auswählen"}
              </option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} · Bestand: {getNumber(product.globalStock)}{" "}
                  {product.unit || "Einheiten"}
                </option>
              ))}
            </select>

            {preselectedProductId && (
              <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
                Das Produkt wurde aus dem Katalog vorausgewählt.
              </p>
            )}
          </div>

          {selectedProduct && (
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Aktueller Bestand
                </p>

                <p className="mt-1 text-lg font-black text-slate-900">
                  {currentStock}{" "}
                  <span className="text-sm text-slate-400">
                    {selectedProduct.unit || "Einheiten"}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Eingang
                </p>

                <p className="mt-1 text-lg font-black text-blue-600">
                  +{Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 0}
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Neuer Bestand
                </p>

                <p className="mt-1 text-lg font-black text-emerald-600">
                  {newStock}{" "}
                  <span className="text-sm text-emerald-500">
                    {selectedProduct.unit || "Einheiten"}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Menge
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="z.B. 50"
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />

              <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
                Menge, die ins Zentrallager eingeht.
              </p>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Stückpreis €
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={costPerUnit}
                onChange={(event) => setCostPerUnit(event.target.value)}
                placeholder="z.B. 2.50"
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />

              <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
                Optional. Wird später für Kostenstatistiken genutzt.
              </p>
            </div>
          </div>

          {totalCost !== null && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-600">
                  payments
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
                    Geschätzter Gesamtwert
                  </p>

                  <p className="mt-1 text-xl font-black text-emerald-800">
                    {totalCost.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Lieferant
            </label>

            <input
              type="text"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              placeholder="z.B. Amazon, Metro, DM..."
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Notiz
            </label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Optional, z.B. Rechnung liegt vor, Sonderkauf, Lager aufgefüllt..."
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-50"
          >
            Abbrechen
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || productsLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">
                sync
              </span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">
                warehouse
              </span>
            )}
            {loading ? "Speichern..." : "Wareneingang speichern"}
          </button>
        </div>
      </div>
    </div>
  )
}