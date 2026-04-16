"use client"

import { useEffect, useMemo, useState } from "react"
import ClientModal from "@/components/admin/ClientModal"
import { useRouter } from "next/navigation"

interface Client {
  id: number
  clientCode: string
  name: string
  address: string | null
  email: string | null
  phone: string | null
  category: "A" | "B" | "C" | "D" | "E" | "Z"
  clientType: "PRIVAT" | "FIRMA"
}

export default function ClientsPage() {
  const router = useRouter()

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients")
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading clients:", error)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  const categoryOrder = ["A", "B", "C", "D", "E", "Z"]

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => {
      const catA = categoryOrder.indexOf(a.category)
      const catB = categoryOrder.indexOf(b.category)
      
      if (catA !== catB) return catA - catB
      
      return a.clientCode.localeCompare(b.clientCode, undefined, { numeric: true })
    })
  }, [clients])

  const stats = useMemo(() => {
    return {
      total: clients.length,
      catA: clients.filter(c => c.category === "A").length,
      catB: clients.filter(c => c.category === "B").length,
      firmen: clients.filter(c => c.clientType === "FIRMA").length,
    }
  }, [clients])

  const totalPages = Math.ceil(sortedClients.length / itemsPerPage)
  const paginatedClients = sortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const categoryStyles: Record<string, string> = {
    A: "bg-emerald-50 text-emerald-700 border-emerald-200",
    B: "bg-blue-50 text-blue-700 border-blue-200",
    C: "bg-slate-50 text-slate-700 border-slate-200",
    D: "bg-orange-50 text-orange-700 border-orange-200",
    E: "bg-amber-50 text-amber-700 border-amber-200",
    Z: "bg-rose-50 text-rose-700 border-rose-200",
  }

  const updateCategory = async (id: number, category: string) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      })
      if (!res.ok) throw new Error()
      setClients((prev) => prev.map((c) => c.id === id ? { ...c, category: category as any } : c))
    } catch (error) {
      alert("Fehler beim Aktualisieren")
    }
  }

  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Kundenliste wird geladen...</p>
      </div>
    )
  }

  return (
    <div className="p-10 space-y-8 bg-slate-50/30 min-h-screen">

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Kundenverwaltung</h1>
          <p className="text-slate-500 mt-2 font-medium">Stammdaten und Kategorisierung für die Abrechnung</p>
        </div>
        <button
          onClick={() => { setSelectedClient(null); setShowModal(true); }}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          + Neuer Kunde
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gesamt</p>
          <p className="text-3xl font-black mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Klasse A</p>
          <p className="text-3xl font-black mt-2 text-emerald-700">{stats.catA}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Klasse B</p>
          <p className="text-3xl font-black mt-2 text-blue-700">{stats.catB}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm text-indigo-700">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Unternehmen (Firma)</p>
          <p className="text-3xl font-black mt-2">{stats.firmen}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
              <th className="px-8 py-5 text-left">Code</th>
              <th className="px-8 py-5 text-left">Typ</th>
              <th className="px-8 py-5 text-left">Name / Firma</th>
              <th className="px-8 py-5 text-left">Kategorie</th>
              <th className="px-8 py-5 text-left">Standort</th>
              <th className="px-8 py-5 text-left">Kontakt</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedClients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <span 
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                    className="font-black text-blue-600 cursor-pointer hover:underline"
                  >
                    #{client.clientCode}
                  </span>
                </td>

                <td className="px-8 py-5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    client.clientType === "FIRMA" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {client.clientType === "FIRMA" ? "Firma" : "Privat"}
                  </span>
                </td>

                <td className="px-8 py-5">
                  <p 
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                    className="font-bold text-slate-800 cursor-pointer group-hover:text-blue-600 transition-colors"
                  >
                    {client.name}
                  </p>
                </td>

                <td className="px-8 py-5">
                  <select
                    value={client.category}
                    onChange={(e) => updateCategory(client.id, e.target.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-black border-2 cursor-pointer outline-none transition-all ${categoryStyles[client.category]}`}
                  >
                    {categoryOrder.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </td>

                <td className="px-8 py-5 text-slate-500 font-medium">
                  {client.address || "-"}
                </td>

                <td className="px-8 py-5">
                  <p className="text-slate-700 font-bold">{client.phone || "-"}</p>
                  <p className="text-[10px] text-slate-400">{client.email || "-"}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            ←
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            →
          </button>
        </div>
      )}

      {showModal && (
        <ClientModal
          client={selectedClient}
          onClose={() => setShowModal(false)}
          onSaved={fetchClients}
        />
      )}

    </div>
  )
}