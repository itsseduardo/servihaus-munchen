"use client"

import { useEffect, useMemo, useState } from "react"

interface Props {
  tasks: any[]
  onClose: () => void
}

type ClientInventory = {
  id: number
  quantity: number
  client?: {
    name?: string | null
  } | null
  product?: {
    name?: string | null
  } | null
}

export default function MaterialModal({ tasks, onClose }: Props) {
  const [clientInventories, setClientInventories] = useState<ClientInventory[]>(
    []
  )
  const [loading, setLoading] = useState(true)
  const [reportingId, setReportingId] = useState<number | null>(null)

  const uniqueClientIds = useMemo(() => {
    return Array.from(
      new Set(
        tasks
          .map((task) => task.clientId || task.client?.id)
          .filter(Boolean)
      )
    )
  }, [tasks])

  useEffect(() => {
    async function fetchInventories() {
      try {
        if (uniqueClientIds.length === 0) {
          setClientInventories([])
          return
        }

        const promises = uniqueClientIds.map((clientId) =>
          fetch(`/api/clients/code/${clientId}/inventory`).then((res) =>
            res.ok ? res.json() : []
          )
        )

        const results = await Promise.all(promises)
        const allInventories = results.flat()

        setClientInventories(allInventories)
      } catch (error) {
        console.error("Error cargando inventarios:", error)
        setClientInventories([])
      } finally {
        setLoading(false)
      }
    }

    fetchInventories()
  }, [uniqueClientIds])

  async function handleReportLowStock(inventoryId: number) {
    setReportingId(inventoryId)

    try {
      const res = await fetch("/api/employees/inventory/alert", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientInventoryId: inventoryId,
        }),
      })

      if (!res.ok) {
        alert("Fehler beim Melden. Error al reportar.")
        return
      }

      setClientInventories((prev) =>
        prev.map((item) =>
          item.id === inventoryId ? { ...item, quantity: 0 } : item
        )
      )
    } catch (error) {
      console.error("Error:", error)
      alert("Fehler beim Melden. Error al reportar.")
    } finally {
      setReportingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Modal schließen"
      />

      <div className="relative z-10 w-full max-w-lg rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Materialbedarf
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Fehlendes Material melden
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              Hier können fehlende Materialien für die heutigen Kunden gemeldet
              werden.
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

        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-slate-50 p-10">
              <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">
                refresh
              </span>

              <p className="mt-3 text-sm font-black uppercase tracking-[0.14em] text-slate-400">
                Materialien werden geladen
              </p>
            </div>
          ) : clientInventories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-400">
                inventory_2
              </span>

              <h3 className="mt-4 text-lg font-black text-slate-900">
                Keine Materialien gefunden
              </h3>

              <p className="mt-2 text-sm font-medium text-slate-500">
                Keine Materialien für die heutigen Kunden gefunden.
              </p>

              <p className="mt-1 text-xs font-bold text-slate-400">
                No se encontraron materiales para los clientes de hoy.
              </p>
            </div>
          ) : (
            <div className="grid max-h-[55vh] gap-3 overflow-y-auto pr-1">
              {clientInventories.map((item) => {
                const isReported = item.quantity <= 0
                const isLoading = reportingId === item.id

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          {item.client?.name || "Kunde"}
                        </p>

                        <h3 className="mt-1 text-sm font-black text-slate-900">
                          {item.product?.name || "Material"}
                        </h3>

                        <p className="mt-1 text-xs font-bold text-slate-500">
                          Bestand: {item.quantity}
                        </p>
                      </div>

                      {isReported ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                          <span className="material-symbols-outlined text-[16px]">
                            warning
                          </span>
                          Gemeldet
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleReportLowStock(item.id)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isLoading ? "refresh" : "notification_important"}
                          </span>
                          {isLoading ? "Meldet..." : "Melden"}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition-all hover:bg-blue-700"
        >
          Schließen
        </button>
      </div>
    </div>
  )
}