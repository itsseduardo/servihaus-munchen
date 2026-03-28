"use client"

import { useEffect, useState } from "react"

interface Props {
  client?: any | null
  onClose: () => void
  onSaved: () => void
}

export default function ClientModal({ client, onClose, onSaved }: Props) {

  const isEdit = !!client

  const [clientCode, setClientCode] = useState("")
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (client) {
      setClientCode(client.clientCode ?? "")
      setName(client.name ?? "")
      setAddress(client.address ?? "")
      setEmail(client.email ?? "")
      setPhone(client.phone ?? "")
    }
  }, [client])

  const handleSubmit = async () => {

    if (!clientCode || !name) {
      alert("Code und Name sind erforderlich")
      return
    }

    try {
      setLoading(true)

      const res = await fetch(
        isEdit ? `/api/clients/${client.id}` : "/api/clients",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientCode,
            name,
            address,
            email,
            phone,
          }),
        }
      )

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Fehler beim Speichern")
        return
      }

      onSaved()
      onClose()

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* HEADER */}
        <div className="px-8 py-6 border-b flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Kunde bearbeiten" : "Neuen Kunden anlegen"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isEdit
                ? "Bearbeite die bestehenden Kundendaten"
                : "Erstelle einen neuen Kunden im System"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          <input
            placeholder="Kundencode"
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value)}
            disabled={isEdit}
            className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition disabled:bg-slate-100"
          />

          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition"
          />

          <input
            placeholder="Adresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition"
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition"
          />

          <input
            placeholder="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition"
          />

        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 border-t flex justify-end gap-3 bg-slate-50">

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
          >
            Abbrechen
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2 rounded-lg bg-primary text-white shadow hover:shadow-md transition disabled:opacity-50"
          >
            {loading ? "Speichern..." : "Speichern"}
          </button>

        </div>

      </div>

    </div>
  )
}