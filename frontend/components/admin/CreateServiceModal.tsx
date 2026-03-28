"use client"

import { useEffect, useState } from "react"
import EmployeeSelector from "./EmployeeSelector"

interface Props {
  selectedDate: string
  selectedTime: string
  onClose: () => void
  onCreated: () => void
}

export default function CreateServiceModal({
  selectedDate,
  selectedTime,
  onClose,
  onCreated,
}: Props) {

  // =========================
  // CLIENT STATES
  // =========================
  const [clientCode, setClientCode] = useState<string>("")
  const [clientName, setClientName] = useState<string>("")
  const [address, setAddress] = useState<string>("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<any | null>(null)

  // =========================
  // SERVICE STATES
  // =========================


  const [time, setTime] = useState(selectedTime)
  const [duration, setDuration] = useState<number | "">("")
  const [requiresKey, setRequiresKey] = useState(false)

  const [notes, setNotes] = useState("")
  const [importantNotes, setImportantNotes] = useState("")
  const [serviceCodes, setServiceCodes] = useState<any[]>([])
  const [selectedServiceCodeId, setSelectedServiceCodeId] = useState<number | null>(null)

  // =========================
  // EMPLOYEES
  // =========================
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setTime(selectedTime)
  }, [selectedTime])

  // =========================
  // AUTOCOMPLETE POR CÓDIGO
  // =========================
  useEffect(() => {
    if (!clientCode || clientCode.length < 2) return

    const fetchByCode = async () => {
      const res = await fetch(`/api/clients?code=${clientCode}`)
      if (!res.ok) return

      const client = await res.json()
      if (client && client.name) {
        setSelectedClient(client)
        setClientName(client.name ?? "")
        setAddress(client.address ?? "")
      }
    }

    const timeout = setTimeout(fetchByCode, 400)
    return () => clearTimeout(timeout)
  }, [clientCode])

  // =========================
  // AUTOCOMPLETE POR NOMBRE
  // =========================
  useEffect(() => {
    if (!clientName || clientName.length < 2) {
      setSuggestions([])
      return
    }

    const fetchClients = async () => {
      const res = await fetch(`/api/clients?search=${clientName}`)
      const data = await res.json()
      setSuggestions(data)
    }

    const timeout = setTimeout(fetchClients, 300)
    return () => clearTimeout(timeout)
  }, [clientName])

  // =========================
  // CARGAR EMPLEADOS
  // =========================
  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await fetch("/api/employees")
      const data = await res.json()
      setEmployees(data)
    }

    fetchEmployees()
  }, [])

  useEffect(() => {
    const fetchServiceCodes = async () => {
      try {
        const res = await fetch("/api/service-codes")
        const data = await res.json()
        setServiceCodes(data)
      } catch (error) {
        console.error("Error loading service codes:", error)
      }
    }

    fetchServiceCodes()
  }, [])

  const handleSubmit = async () => {
    if (!clientName || !address || !time || !duration) {
      alert("Bitte alle Pflichtfelder ausfüllen")
      return
    }

    setLoading(true)

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: selectedClient?.id,
        clientCode,
        clientName,
        serviceCodeId: selectedServiceCodeId,
        address,
        date: selectedDate,
        time,
        duration: Number(duration),
        requiresKey,
        employees: selectedEmployees,
        notes,
        importantNotes,
      }),
    })

    setLoading(false)

    if (res.ok) {
      onCreated()
      onClose()
    } else {
      const err = await res.json()
      alert(err.error || "Fehler beim Erstellen des Auftrags")
    }
  }



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* HEADER */}
        <div className="px-8 py-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Neuen Auftrag anlegen</h2>
            <p className="text-sm text-slate-500">
              Service für {selectedDate} um {time}
            </p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* CLIENT SECTION */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-primary">
              Kundeninformationen
            </h3>

            <input
              placeholder="Kundencode"
              value={clientCode ?? ""}
              onChange={(e) => {
                setClientCode(e.target.value)
                setSelectedClient(null)
              }}
              className="w-full h-12 rounded-lg border px-4"
            />

            <input
              placeholder="Kundenname"
              value={clientName ?? ""}
              onChange={(e) => {
                setClientName(e.target.value)
                setSelectedClient(null)
              }}
              className="w-full h-12 rounded-lg border px-4"
            />

            {suggestions.length > 0 && (
              <div className="bg-white shadow-lg rounded-lg border">
                {suggestions.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client)
                      setClientCode(client.clientCode)
                      setClientName(client.name)
                      setAddress(client.address || "")
                      setSuggestions([])
                    }}
                    className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                  >
                    {client.name} – {client.clientCode}
                  </div>
                ))}
              </div>
            )}

            <input
              placeholder="Adresse"
              value={address ?? ""}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-12 rounded-lg border px-4"
            />
          </section>

          {/* SERVICE SECTION */}
          <section className="grid grid-cols-1 gap-4">

            <select
              value={selectedServiceCodeId ?? ""}
              onChange={(e) =>
                setSelectedServiceCodeId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="h-12 rounded-lg border px-4"
            >
              <option value="">Service auswählen</option>
              {serviceCodes.map((code) => (
                <option key={code.id} value={code.id}>
                  {code.code} – {code.description}
                </option>
              ))}
            </select>

            <input
              type="number"
              step="0.5"
              placeholder="Dauer (Stunden)"
              value={duration}
              onChange={(e) =>
                setDuration(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="h-12 rounded-lg border px-4"
            />

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-12 rounded-lg border px-4"
            />
          </section>

          {/* EMPLOYEES */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-primary">
              Mitarbeiter zuweisen
            </h3>

            <EmployeeSelector
              employees={employees}
              selected={selectedEmployees}
              onChange={setSelectedEmployees}
            />
          </section>

          {/* NOTES */}
          <section className="space-y-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notizen"
              className="w-full h-24 rounded-lg border p-4"
            />

            <textarea
              value={importantNotes}
              onChange={(e) => setImportantNotes(e.target.value)}
              placeholder="Wichtige Notizen (werden im Kalender angezeigt)"
              className="w-full h-24 rounded-lg border p-4 border-red-400"
            />
          </section>

          {/* KEY */}
          <section className="flex justify-between items-center bg-primary/5 p-4 rounded-xl">
            <span className="font-semibold">Schlüssel erforderlich</span>
            <input
              type="checkbox"
              checked={requiresKey}
              onChange={(e) => setRequiresKey(e.target.checked)}
            />
          </section>

        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-6 h-12 rounded-lg border">
            Abbrechen
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 h-12 rounded-lg bg-primary text-white"
          >
            {loading ? "Speichern..." : "Auftrag speichern"}
          </button>
        </div>

      </div>
    </div >
  )
}