"use client"

import { useState } from "react"

interface Props {
  service: any
  onClose: () => void
  onUpdated?: () => void
}

export default function ServiceDetailsModal({
  service,
  onClose,
  onUpdated,
}: Props) {

  const [notes, setNotes] = useState(service.notes || "")
  const [status, setStatus] = useState(service.status)
  const [loading, setLoading] = useState(false)

  const statusMap: Record<string, string> = {
    pending: "Geplant",
    confirmed: "Bestätigt",
    on_route: "Unterwegs",
    completed: "Abgeschlossen",
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    on_route: "bg-blue-100 text-blue-800",
    completed: "bg-gray-200 text-gray-700",
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      const res = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          status,
        }),
      })

      if (!res.ok) {
        console.error("Update failed")
        return
      }

      onUpdated?.()

    } catch (err) {
      console.error("Save error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = confirm("Auftrag wirklich löschen?")
    if (!confirmDelete) return

    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        console.error("Delete failed")
        return
      }

      onUpdated?.()

    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">

      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">Auftragsdetails</h2>
            <p className="text-sm text-slate-500">{service.code}</p>
          </div>

          <button onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

          {/* STATUS */}
          <section className="space-y-3">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                statusColors[status] || "bg-slate-100 text-slate-800"
              }`}
            >
              {statusMap[status] || status}
            </span>

            <div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded-lg p-2 text-sm"
              >
                <option value="pending">Geplant</option>
                <option value="confirmed">Bestätigt</option>
                <option value="on_route">Unterwegs</option>
                <option value="completed">Abgeschlossen</option>
              </select>
            </div>
          </section>

          {/* CLIENT */}
          <section>
            <h4 className="text-sm font-bold uppercase text-primary mb-3">
              Kundeninformationen
            </h4>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-slate-500 text-xs uppercase">Kunde</p>
                <p className="font-semibold">{service.client?.name}</p>
                <p className="text-xs text-slate-400">
                  {service.client?.clientCode}
                </p>
              </div>

              <div>
                <p className="text-slate-500 text-xs uppercase">Adresse</p>
                <p>{service.address}</p>
              </div>
            </div>
          </section>

          {/* SERVICE DETAILS */}
          <section>
            <h4 className="text-sm font-bold uppercase text-primary mb-3">
              Service-Details
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-slate-500">Datum</p>
                <p className="font-bold">
                  {new Date(service.date).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-slate-500">Uhrzeit</p>
                <p className="font-bold">{service.time}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-slate-500">Dauer</p>
                <p className="font-bold text-primary">
                  {service.duration || "—"}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-slate-500">
                  Schlüssel nötig
                </p>
                <p className="font-bold">
                  {service.requiresKey ? "Ja" : "Nein"}
                </p>
              </div>

            </div>
          </section>

          {/* TEAM */}
          <section>
            <h4 className="text-sm font-bold uppercase text-primary mb-3">
              Mitarbeiter
            </h4>

            {service.assignments?.length === 0 ? (
              <p className="text-sm text-slate-500">
                Kein Mitarbeiter zugewiesen
              </p>
            ) : (
              <div className="space-y-3">
                {service.assignments?.map((a: any) => (
                  <div
                    key={a.id}
                    className="flex justify-between items-center bg-slate-50 p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">
                        {a.employee?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {a.employee?.profession}
                      </p>
                    </div>
                    <div className="text-xs text-slate-400">
                      {a.workedHours || 0}h
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* NOTES */}
          <section>
            <h4 className="text-sm font-bold uppercase text-primary mb-3">
              Interne Notizen
            </h4>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 p-4 rounded-xl border bg-slate-50 text-sm resize-none focus:ring-2 focus:ring-primary/50"
              placeholder="Details oder spezielle Anweisungen hinzufügen..."
            />
          </section>

        </div>

        {/* FOOTER */}
        <footer className="p-6 border-t flex justify-between items-center bg-slate-50">

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 text-rose-600 font-bold"
          >
            <span className="material-symbols-outlined">delete</span>
            Auftrag löschen
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-lg font-bold"
            >
              Abbrechen
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-2 bg-primary text-white rounded-lg font-bold"
            >
              {loading ? "Speichern..." : "Speichern"}
            </button>
          </div>

        </footer>

      </div>
    </div>
  )
}