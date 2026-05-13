"use client"

import { useState } from "react"

type Contract = {
  id?: number
  title?: string | null
  contractType?: string | null
  startDate?: string | null
  endDate?: string | null
  frequency?: string | null
  agreedHours?: number | null
  agreedPrice?: number | null
  pricingModel?: string | null
  notes?: string | null
  status?: string | null
}

type Props = {
  clientId: number
  contract?: Contract | null
  onClose: () => void
  onSaved: () => void
}

function toDateInput(value?: string | null) {
  if (!value) return ""

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ""

  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export default function ClientContractModal({
  clientId,
  contract = null,
  onClose,
  onSaved,
}: Props) {
  const [title, setTitle] = useState(contract?.title || "Kundenvertrag")
  const [contractType, setContractType] = useState(
    contract?.contractType || "REGULAR_CLEANING"
  )
  const [startDate, setStartDate] = useState(toDateInput(contract?.startDate))
  const [endDate, setEndDate] = useState(toDateInput(contract?.endDate))
  const [frequency, setFrequency] = useState(contract?.frequency || "WEEKLY")
  const [pricingModel, setPricingModel] = useState(
    contract?.pricingModel || "TIME"
  )
  const [agreedHours, setAgreedHours] = useState<number | "">(
    contract?.agreedHours ?? ""
  )
  const [agreedPrice, setAgreedPrice] = useState<number | "">(
    contract?.agreedPrice ?? ""
  )
  const [status, setStatus] = useState(contract?.status || "ACTIVE")
  const [notes, setNotes] = useState(contract?.notes || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!title.trim()) {
      setError("Bitte geben Sie einen Titel ein.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const payload = {
        title,
        contractType,
        startDate: startDate || null,
        endDate: endDate || null,
        frequency,
        agreedHours,
        agreedPrice,
        pricingModel,
        status,
        notes,
      }

      const url = contract?.id
        ? `/api/client-contracts/${contract.id}`
        : `/api/clients/${clientId}/contracts`

      const res = await fetch(url, {
        method: contract?.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Vertrag konnte nicht gespeichert werden.")
        return
      }

      onSaved()
      onClose()
    } catch {
      setError("Vertrag konnte nicht gespeichert werden.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Schließen"
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Vertragsverwaltung
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {contract?.id ? "Vertrag bearbeiten" : "Vertrag anlegen"}
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              Hinterlegen Sie hier die vertraglichen Bedingungen des Kunden.
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

        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-5">
          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Titel
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Vertragstyp
              </label>

              <select
                value={contractType}
                onChange={(event) => setContractType(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                <option value="REGULAR_CLEANING">Unterhaltsreinigung</option>
                <option value="OFFICE_CLEANING">Büroreinigung</option>
                <option value="PRIVATE_HOME">Privathaushalt</option>
                <option value="MOVE_SERVICE">Umzugsservice</option>
                <option value="HANDYMAN">Handwerkerservice</option>
                <option value="OTHER">Sonstiges</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Status
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                <option value="ACTIVE">Aktiv</option>
                <option value="PAUSED">Pausiert</option>
                <option value="ENDED">Beendet</option>
                <option value="CANCELLED">Storniert</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Startdatum
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Enddatum
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Frequenz
              </label>

              <select
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                <option value="DAILY">Täglich</option>
                <option value="WEEKLY">Wöchentlich</option>
                <option value="BIWEEKLY">Alle 2 Wochen</option>
                <option value="MONTHLY">Monatlich</option>
                <option value="CUSTOM">Individuell</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Stunden
              </label>

              <input
                type="number"
                step="0.25"
                value={agreedHours}
                onChange={(event) =>
                  setAgreedHours(
                    event.target.value === "" ? "" : Number(event.target.value)
                  )
                }
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Preis
              </label>

              <input
                type="number"
                step="0.01"
                value={agreedPrice}
                onChange={(event) =>
                  setAgreedPrice(
                    event.target.value === "" ? "" : Number(event.target.value)
                  )
                }
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Abrechnungsmodell
            </label>

            <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setPricingModel("TIME")}
                className={`rounded-xl px-4 py-3 text-sm font-black transition-all ${
                  pricingModel === "TIME"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Zeitbasiert
              </button>

              <button
                type="button"
                onClick={() => setPricingModel("FIXED")}
                className={`rounded-xl px-4 py-3 text-sm font-black transition-all ${
                  pricingModel === "FIXED"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Pauschal
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Interne Notizen / Vereinbarungen
            </label>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              placeholder="z.B. Kunde bevorzugt Mittwoch vormittags, Schlüsselregelung, besondere Räume..."
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm font-medium leading-6 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            Abbrechen
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Speichern..." : "Vertrag speichern"}
          </button>
        </div>
      </form>
    </div>
  )
}