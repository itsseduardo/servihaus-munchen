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
  const [importantNotes, setImportantNotes] = useState(service.importantNotes || "")
  const [status, setStatus] = useState(service.status)
  const [loading, setLoading] = useState(false)
  const [actualStartTime, setActualStartTime] = useState<string>("")
  const [actualEndTime, setActualEndTime] = useState<string>("")

  const statusColors: Record<string, string> = {
    assigned: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      const res = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          importantNotes,
          status,
          actualStartTime: actualStartTime || undefined,
          actualEndTime: actualEndTime || undefined,
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

  const handleStartNow = async () => {
    try {
      await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actualStartTime: new Date(),
          status: "in_progress",
        }),
      })

      onUpdated?.()

    } catch (err) {
      console.error("Start error:", err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">

      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">Auftragsdetails</h2>
            <p className="text-sm text-slate-500">{service.serviceCode
              ? `${service.serviceCode.code} - ${service.serviceCode.description}`
            : "Kein Service-Typ"}</p>
          </div>

          <button onClick={onClose}>✕</button>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

          {/* STATUS */}
          <section className="space-y-3">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusColors[status] || "bg-slate-100 text-slate-800"
                }`}
            >
              {status}
            </span>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-lg p-2 text-sm"
            >
              <option value="assigned">Geplant</option>
              <option value="in_progress">In Arbeit</option>
              <option value="completed">Abgeschlossen</option>
              <option value="cancelled">Storniert</option>
            </select>

            {status !== "in_progress" && (
              <button
                onClick={async () => {
                  await fetch(`/api/services / ${service.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      status: "in_progress",
                      actualStartTime: new Date(),
                    }),
                  })

                  window.location.reload()
                }}
              >
                Jetzt starten
              </button>
            )}
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

          {/* SERVICE INFO */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-slate-500">Datum</p>
                <p className="font-bold">
                  {new Date(service.date).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-slate-500">Startzeit</p>
                <p className="font-bold">
                  {service.time}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs uppercase text-slate-500">Geplante Dauer</p>
                <p className="font-bold">
                  {service.duration} h
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

          {service.status === "in_progress" && (
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold">Reale Startzeit</h3>

              <input
                type="datetime-local"
                value={actualStartTime}
                onChange={(e) => setActualStartTime(e.target.value)}
                className="w-full h-12 rounded-lg border px-4"
              />
            </div>
          )}

          {service.status === "completed" && (
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold">Reale Zeiten</h3>

              <input
                type="datetime-local"
                value={actualStartTime}
                onChange={(e) => setActualStartTime(e.target.value)}
                className="w-full h-12 rounded-lg border px-4"
              />

              <input
                type="datetime-local"
                value={actualEndTime}
                onChange={(e) => setActualEndTime(e.target.value)}
                className="w-full h-12 rounded-lg border px-4"
              />
            </div>
          )}

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
                        {a.employee?.firstName} {a.employee?.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {a.employee?.profession}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* IMPORTANT NOTES */}
          <section>
            <h4 className="text-sm font-bold uppercase text-red-600 mb-3">
              Wichtige Notizen
            </h4>

            <textarea
              value={importantNotes}
              onChange={(e) => setImportantNotes(e.target.value)}
              className="w-full h-24 p-4 rounded-xl border border-red-400 text-sm resize-none"
            />
          </section>

          {/* NORMAL NOTES */}
          <section>
            <h4 className="text-sm font-bold uppercase text-primary mb-3">
              Interne Notizen
            </h4>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 p-4 rounded-xl border text-sm resize-none"
            />
          </section>

        </div>

        {/* FOOTER */}
        <footer className="p-6 border-t flex justify-between items-center bg-slate-50">

          <button
            onClick={handleDelete}
            className="text-rose-600 font-bold"
          >
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
    </div >
  )
}