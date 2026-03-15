"use client"

import { useEffect, useState } from "react"

interface Props {
  selectedDate: string
  selectedTime: string   // ← NUEVO
  onClose: () => void
  onCreated: () => void
}

export default function CreateServiceModal({
  selectedDate,
  selectedTime,
  onClose,
  onCreated,
}: Props) {
  const [clientName, setClientName] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [serviceType, setServiceType] = useState("")
  const [address, setAddress] = useState("")
  const [time, setTime] = useState(selectedTime) // ← inicializa con hora seleccionada
  const [duration, setDuration] = useState("")
  const [requiresKey, setRequiresKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])

  // Si el usuario hace click en otra celda mientras el modal está abierto
  useEffect(() => {
    setTime(selectedTime)
  }, [selectedTime])

  // Autocomplete
  useEffect(() => {
    if (clientName.length < 2) {
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

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees")
        const data = await res.json()
        setEmployees(data)
      } catch (error) {
        console.error("Error loading employees:", error)
      }
    }

    fetchEmployees()
  }, [])

  const handleSubmit = async () => {
    if (!clientName || !address || !time) {
      alert("Please fill required fields")
      return
    }

    setLoading(true)

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: selectedClient?.id,
        clientName,
        serviceType,
        address,
        date: selectedDate,
        time,
        duration,
        requiresKey,
        employees: selectedEmployees,
      }),
    })

    setLoading(false)

    if (res.ok) {
      onCreated()
      onClose()
    } else {
      alert("Error creating service")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Neuen Auftrag anlegen</h2>
            <p className="text-sm text-slate-500">
              Service für {selectedDate} um {selectedTime}
            </p>
          </div>
          <button onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* Cliente */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-primary">
              Kundeninformationen
            </h3>

            <div className="grid grid-cols-2 gap-4 relative">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">
                  Kunde auswählen
                </label>

                <input
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value)
                    setSelectedClient(null)
                  }}
                  className="w-full h-12 rounded-lg border px-4"
                  placeholder="Kundenname eingeben"
                />

                {suggestions.length > 0 && (
                  <div className="absolute top-20 bg-white shadow-lg rounded-lg border w-[calc(100%-1rem)] z-20">
                    {suggestions.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => {
                          setSelectedClient(client)
                          setClientName(client.name)
                          setSuggestions([])
                        }}
                        className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                      >
                        {client.name} – {client.clientCode}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">
                  Kundennummer
                </label>
                <input
                  readOnly
                  value={
                    selectedClient?.clientCode || "Neu wird generiert"
                  }
                  className="w-full h-12 rounded-lg border bg-slate-100 px-4"
                />
              </div>
            </div>
          </section>

          {/* Service Details */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-primary">
              Auftragsdetails
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="Leistungsart"
                className="h-12 rounded-lg border px-4"
              />

              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Dauer (z.B. 2.0 Std)"
                className="h-12 rounded-lg border px-4"
              />

              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Adresse"
                className="col-span-2 h-12 rounded-lg border px-4"
              />
            </div>
          </section>

          {/* Zeitplanung */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-primary">
              Zeitplanung
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-12 rounded-lg border px-4"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-primary">
              Mitarbeiter zuweisen
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {employees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(emp.id)}
                    onChange={() => {
                      if (selectedEmployees.includes(emp.id)) {
                        setSelectedEmployees(
                          selectedEmployees.filter((id) => id !== emp.id)
                        )
                      } else {
                        setSelectedEmployees([...selectedEmployees, emp.id])
                      }
                    }}
                  />

                  <div className="flex flex-col">
                    <span className="font-medium">{emp.name}</span>
                    <span className="text-xs text-gray-500">
                      {emp.profession}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Schlüssel */}
          <section className="flex justify-between items-center bg-primary/5 p-4 rounded-xl">
            <span className="font-semibold">
              Schlüssel erforderlich
            </span>
            <input
              type="checkbox"
              checked={requiresKey}
              onChange={(e) => setRequiresKey(e.target.checked)}
            />
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 h-12 rounded-lg font-bold text-slate-600 hover:bg-slate-200"
          >
            Abbrechen
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 h-12 rounded-lg font-bold bg-primary text-white shadow-lg hover:bg-primary/90"
          >
            {loading ? "Speichern..." : "Auftrag speichern"}
          </button>
        </div>
      </div>
    </div>
  )
}   