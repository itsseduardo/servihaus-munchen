"use client"

import { useState } from "react"

type Props = {
  onClose: () => void
  onSuccess: () => void
}

const UNIT_OPTIONS = [
  "Flasche",
  "Liter",
  "Kanister",
  "Packung",
  "Rolle",
  "Stück",
  "Paar",
  "Box",
  "Sack",
  "Einheiten",
]

export default function AddProductModal({ onClose, onSuccess }: Props) {
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("Flasche")
  const [customUnit, setCustomUnit] = useState("")
  const [globalStock, setGlobalStock] = useState("0")
  const [minStock, setMinStock] = useState("1")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const finalUnit = unit === "CUSTOM" ? customUnit.trim() : unit

  const handleSubmit = async () => {
    try {
      setError("")

      const cleanName = name.trim()

      if (!cleanName) {
        setError("Bitte geben Sie einen Produktnamen ein.")
        return
      }

      if (!finalUnit) {
        setError("Bitte geben Sie eine Einheit ein.")
        return
      }

      const parsedGlobalStock = Number(globalStock)
      const parsedMinStock = Number(minStock)

      if (!Number.isFinite(parsedGlobalStock) || parsedGlobalStock < 0) {
        setError("Der zentrale Bestand muss eine gültige Zahl sein.")
        return
      }

      if (!Number.isFinite(parsedMinStock) || parsedMinStock < 0) {
        setError("Der Mindestbestand muss eine gültige Zahl sein.")
        return
      }

      setLoading(true)

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          unit: finalUnit,
          globalStock: parsedGlobalStock,
          minStock: parsedMinStock,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Produkt konnte nicht gespeichert werden.")
        return
      }

      onSuccess()
    } catch (error) {
      console.error("PRODUCT CREATE ERROR:", error)
      setError("Produkt konnte nicht gespeichert werden.")
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

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-t-[2rem] border border-slate-100 bg-white shadow-2xl sm:rounded-[2rem]">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Produktkatalog
          </p>

          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Neues Produkt
              </h2>

              <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                Legen Sie ein Produkt an, das ServiHaus zentral verwaltet oder
                später einem Kundenmaterial zuordnet.
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
                Este formulario crea un producto del catálogo, por ejemplo
                lejía, jabón, papel o bolsas. No crea un servicio ni lo asigna
                automáticamente a un cliente.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Produktname
            </label>

            <input
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              placeholder="z.B. Lejía, Handseife, Müllsäcke..."
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Einheit
              </label>

              <select
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                {UNIT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}

                <option value="CUSTOM">Andere Einheit...</option>
              </select>
            </div>

            {unit === "CUSTOM" ? (
              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Eigene Einheit
                </label>

                <input
                  className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                  placeholder="z.B. 5L Kanister"
                  value={customUnit}
                  onChange={(event) => setCustomUnit(event.target.value)}
                />
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Ausgewählte Einheit
                </p>

                <p className="mt-1 text-sm font-black text-slate-800">
                  {finalUnit}
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Bestand Zentrallager
              </label>

              <input
                type="number"
                min="0"
                step="1"
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                value={globalStock}
                onChange={(event) => setGlobalStock(event.target.value)}
              />

              <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
                Optionaler Startbestand im zentralen Lager.
              </p>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Mindestbestand
              </label>

              <input
                type="number"
                min="0"
                step="1"
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                value={minStock}
                onChange={(event) => setMinStock(event.target.value)}
              />

              <p className="mt-1 text-xs font-medium leading-5 text-slate-400">
                Ab diesem Wert erscheint eine Lagerwarnung.
              </p>
            </div>
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
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">
                sync
              </span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">
                save
              </span>
            )}
            {loading ? "Speichern..." : "Produkt speichern"}
          </button>
        </div>
      </div>
    </div>
  )
}