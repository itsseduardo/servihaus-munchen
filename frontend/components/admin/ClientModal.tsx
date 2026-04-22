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
  const [category, setCategory] = useState("C")
  const [clientType, setClientType] = useState("PRIVAT")
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (client) {
      setClientCode(client.clientCode ?? "")
      setName(client.name ?? "")
      setAddress(client.address ?? "")
      setEmail(client.email ?? "")
      setPhone(client.phone ?? "")
      setCategory(client.category ?? "C")
      setClientType(client.clientType ?? "PRIVAT")
    }
  }, [client])

  // Función para GUARDAR (Crear o Actualizar)
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
            category,
            clientType,
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

  // Función para ELIMINAR
  const handleDelete = async () => {
    const confirmed = window.confirm("Bist du sicher? (¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer)")
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        onSaved() // Refresca la lista de clientes en la vista principal
        onClose() // Cierra el modal
      } else {
        console.error("Error al eliminar el cliente")
        alert("Fehler beim Löschen. (Es posible que este cliente tenga servicios asociados y no pueda ser eliminado).")
      }
    } catch (error) {
      console.error("Error de conexión:", error)
      alert("Error de conexión.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">
              {isEdit ? "Kunde bearbeiten" : "Neuer Kunde"}
            </h2>
            <p className="text-xs text-slate-500 font-bold">
              {isEdit
                ? "Bestehende Stammdaten anpassen"
                : "Neuen Kunden im System registrieren"}
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kundennummer</label>
              <input
                placeholder="z.B. 108"
                value={clientCode}
                onChange={(e) => setClientCode(e.target.value)}
                disabled={isEdit}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kategorie (Priorität)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="A">Kategorie A (Hoch)</option>
                <option value="B">Kategorie B</option>
                <option value="C">Kategorie C</option>
                <option value="D">Kategorie D</option>
                <option value="E">Kategorie E</option>
                <option value="Z">Kategorie Z (Gesperrt)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kundenname / Firma</label>
            <input
              placeholder="Vollständiger Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kundentyp</label>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setClientType("PRIVAT")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${clientType === "PRIVAT" ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
              >
                Privatperson
              </button>
              <button
                type="button"
                onClick={() => setClientType("FIRMA")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${clientType === "FIRMA" ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
              >
                Unternehmen / Restaurant
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Adresse</label>
            <input
              placeholder="Strasse, PLZ, Stadt"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">E-Mail</label>
              <input
                placeholder="email@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Telefon</label>
              <input
                placeholder="Mobil o. Festnetz"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 border-t flex justify-between items-center bg-slate-50">
          
          {/* BOTÓN ELIMINAR (IZQUIERDA) */}
          <div>
            {isEdit && (
              <button
                onClick={handleDelete}
                disabled={isDeleting || loading}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                {isDeleting ? "Wird gelöscht..." : "Kunden löschen"}
              </button>
            )}
          </div>

          {/* BOTONES CANCELAR / GUARDAR (DERECHA) */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading || isDeleting}
              className="px-6 py-2.5 rounded-xl border border-slate-300 font-bold text-sm hover:bg-slate-200 transition disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || isDeleting}
              className="px-10 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? "Speichern..." : "Speichern"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}