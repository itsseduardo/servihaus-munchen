"use client"

import { useEffect, useMemo, useState } from "react"

type Client = {
  id: number
  name: string
  clientCode?: string | null
  address?: string | null
}

type Product = {
  id: number
  name: string
  unit?: string | null
  globalStock?: number | string | null
}

type DeliveryItem = {
  productId: string
  quantity: string
}

type Props = {
  onClose: () => void
  onSuccess: () => void
  preselectedClientId?: string | number
}

function getNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export default function AddDeliveryModal({
  onClose,
  onSuccess,
  preselectedClientId,
}: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [clientId, setClientId] = useState(
    preselectedClientId ? String(preselectedClientId) : ""
  )
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<DeliveryItem[]>([
    {
      productId: "",
      quantity: "",
    },
  ])

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true)

        const [clientsRes, productsRes] = await Promise.all([
          fetch("/api/clients", {
            cache: "no-store",
          }),
          fetch("/api/products", {
            cache: "no-store",
          }),
        ])

        const clientsData = await clientsRes.json().catch(() => [])
        const productsData = await productsRes.json().catch(() => [])

        setClients(Array.isArray(clientsData) ? clientsData : [])
        setProducts(Array.isArray(productsData) ? productsData : [])
      } catch (error) {
        console.error("DELIVERY MODAL LOAD ERROR:", error)
        setClients([])
        setProducts([])
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (preselectedClientId) {
      setClientId(String(preselectedClientId))
    }
  }, [preselectedClientId])

  const selectedClient = useMemo(() => {
    return clients.find((client) => String(client.id) === String(clientId))
  }, [clients, clientId])

  const validItems = useMemo(() => {
    return items
      .map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      }))
      .filter(
        (item) =>
          Number.isInteger(item.productId) &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0
      )
  }, [items])

  const totalQuantity = validItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        productId: "",
        quantity: "",
      },
    ])
  }

  function removeItem(index: number) {
    setItems((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  function updateItem(index: number, field: keyof DeliveryItem, value: string) {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    )
  }

  function getProductById(productId: string) {
    return products.find((product) => String(product.id) === String(productId))
  }

  async function handleSubmit() {
    try {
      setError("")

      if (!clientId) {
        setError("Bitte wählen Sie einen Kunden aus.")
        return
      }

      if (!date) {
        setError("Bitte wählen Sie ein Lieferdatum aus.")
        return
      }

      if (validItems.length === 0) {
        setError("Bitte erfassen Sie mindestens ein Produkt mit gültiger Menge.")
        return
      }

      const hasIncompleteRows = items.some((item) => {
        const hasProduct = Boolean(item.productId)
        const hasQuantity = Boolean(item.quantity)
        return hasProduct !== hasQuantity
      })

      if (hasIncompleteRows) {
        setError("Bitte vervollständigen oder entfernen Sie leere Produktzeilen.")
        return
      }

      setSaving(true)

      const res = await fetch("/api/inventory/delivery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: Number(clientId),
          date,
          deliveryCode: reference.trim() || null,
          reference: reference.trim() || null,
          notes: notes.trim() || null,
          items: validItems,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Lieferung konnte nicht gespeichert werden.")
        return
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error("DELIVERY CREATE ERROR:", error)
      setError("Lieferung konnte nicht gespeichert werden.")
    } finally {
      setSaving(false)
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

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] border border-slate-100 bg-white shadow-2xl sm:rounded-[2rem]">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Kundenmaterial
          </p>

          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Material liefern
              </h2>

              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                Erfassen Sie Produkte, die zu einem Kunden gebracht wurden. Das
                aktualisiert das Kundenmaterial und dient als Lieferhistorie.
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

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600">
                info
              </span>

              <p className="text-sm font-medium leading-6 text-blue-800">
                Este formulario no crea productos nuevos. Usa productos del
                catálogo y registra que fueron entregados a un cliente. La
                referencia es opcional y puede usarse para documentos internos o
                servicios adicionales.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Kunde
              </label>

              <select
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                disabled={loadingData || Boolean(preselectedClientId)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {loadingData ? "Kunden werden geladen..." : "Kunde auswählen"}
                </option>

                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                    {client.clientCode ? ` · ${client.clientCode}` : ""}
                  </option>
                ))}
              </select>

              {selectedClient?.address && (
                <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
                  {selectedClient.address}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Lieferdatum
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Referenz / interne Notiznummer
            </label>

            <input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="Optional, z.B. Zusatzservice, Lieferschein, interne Referenz..."
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />

            <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
              Kein Pflichtfeld. Falls es einen internen Nachweis gibt, kann er
              hier notiert werden.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Produkte
                </p>

                <h3 className="mt-1 text-lg font-black text-slate-950">
                  Gelieferte Produkte
                </h3>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-black text-blue-600 shadow-sm hover:bg-blue-50"
              >
                <span className="material-symbols-outlined text-[17px]">
                  add
                </span>
                Produkt hinzufügen
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {items.map((item, index) => {
                const product = getProductById(item.productId)

                return (
                  <div
                    key={index}
                    className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-3 sm:grid-cols-[1fr_130px_44px]"
                  >
                    <div>
                      <label className="sr-only">Produkt</label>

                      <select
                        value={item.productId}
                        onChange={(event) =>
                          updateItem(index, "productId", event.target.value)
                        }
                        disabled={loadingData}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                      >
                        <option value="">
                          {loadingData
                            ? "Produkte werden geladen..."
                            : "Produkt auswählen"}
                        </option>

                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} · Lager:{" "}
                            {getNumber(product.globalStock)}{" "}
                            {product.unit || "Einheiten"}
                          </option>
                        ))}
                      </select>

                      {product && (
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          Einheit: {product.unit || "Einheiten"} · Zentrallager:{" "}
                          {getNumber(product.globalStock)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="sr-only">Menge</label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(index, "quantity", event.target.value)
                        }
                        placeholder="Menge"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-center text-sm font-black text-slate-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Kunde
              </p>

              <p className="mt-1 truncate text-sm font-black text-slate-800">
                {selectedClient?.name || "Nicht ausgewählt"}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Positionen
              </p>

              <p className="mt-1 text-sm font-black text-slate-800">
                {validItems.length}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Gesamtmenge
              </p>

              <p className="mt-1 text-sm font-black text-slate-800">
                {totalQuantity}
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Hinweis
            </label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Optional, z.B. im Putzraum abgelegt, Kunde hat Lieferung erhalten..."
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
            disabled={saving}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-50"
          >
            Abbrechen
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || loadingData}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">
                sync
              </span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">
                local_shipping
              </span>
            )}

            {saving ? "Speichern..." : "Lieferung speichern"}
          </button>
        </div>
      </div>
    </div>
  )
}