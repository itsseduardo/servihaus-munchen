"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ClientModal from "@/components/admin/ClientModal"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (id) fetchClient()
  }, [id])

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`)
      const data = await res.json()
      setClient(data)
    } catch (error) {
      console.error("Error loading client:", error)
    } finally {
      setLoading(false)
    }
  }

  const categoryStyles: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-800 border-emerald-200",
    B: "bg-blue-100 text-blue-800 border-blue-200",
    C: "bg-slate-100 text-slate-800 border-slate-200",
    D: "bg-orange-100 text-orange-800 border-orange-200",
    E: "bg-amber-100 text-amber-800 border-amber-200",
    Z: "bg-rose-100 text-rose-800 border-rose-200",
  }

  const stats = useMemo(() => {
    if (!client) return { total: 0, active: 0, completed: 0 }
    const total = client.services.length
    const active = client.services.filter((s: any) => s.status === "assigned" || s.status === "in_progress").length
    const completed = client.services.filter((s: any) => s.status === "completed").length
    return { total, active, completed }
  }, [client])

  if (loading) return <div className="p-10 text-center font-bold">Lade Kundendaten...</div>
  if (!client) return <div className="p-10 text-center font-bold">Kunde nicht gefunden</div>

  return (
    <div className="p-10 space-y-8 bg-slate-50/50 min-h-screen">
      
      {/* NAVEGACIÓN Y ACCIONES */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push("/admin/clients")}
          className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
        >
          <span className="text-lg">←</span> Zurück zur Liste
        </button>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-6 py-2 bg-white border-2 border-slate-200 text-slate-700 font-black text-xs uppercase rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
        >
          Kunde Bearbeiten
        </button>
      </div>

      {/* HEADER CARD */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400">
            {client.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tighter text-slate-900">{client.name}</h1>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                client.clientType === "FIRMA" ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-slate-50 text-slate-500 border-slate-100"
              }`}>
                {client.clientType === "FIRMA" ? "Unternehmen" : "Privatperson"}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-blue-600 text-sm font-black italic">Code: #{client.clientCode}</span>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase border ${categoryStyles[client.category]}`}>
                Kategorie {client.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 px-8 border-l border-slate-100">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
            <p className={`text-sm font-bold mt-1 ${client.category === 'Z' ? 'text-rose-600' : 'text-emerald-600'}`}>
              {client.category === 'Z' ? 'Gesperrt' : 'Aktiv'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gesamt Aufträge</p>
          <p className="text-4xl font-black mt-2 text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">In Planung</p>
          <p className="text-4xl font-black mt-2 text-blue-700">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Abgeschlossen</p>
          <p className="text-4xl font-black mt-2 text-emerald-700">{stats.completed}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INFO COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 border-b pb-4">Kontaktdaten</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">E-Mail Adresse</p>
                <p className="text-sm font-bold text-slate-700 break-all">{client.email ?? "Nicht hinterlegt"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Telefonnummer</p>
                <p className="text-sm font-bold text-slate-700">{client.phone ?? "Keine Nummer"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Standort / Adresse</p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{client.address ?? "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* HISTORY COLUMN */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden font-medium">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="font-black text-slate-800 uppercase text-sm tracking-widest">Service-Historie</h2>
              <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-bold border text-slate-500 shadow-sm">
                {stats.total} Einträge
              </span>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                  <th className="px-8 py-4 text-left">Datum</th>
                  <th className="px-8 py-4 text-left">Service Code</th>
                  <th className="px-8 py-4 text-left">Dauer</th>
                  <th className="px-8 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {client.services.map((service: any) => (
                  <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-600">
                      {new Date(service.date).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-black border border-blue-100">
                        {service.serviceCode?.code || "SC"}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-800">
                      {service.duration ?? 0} h
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        service.status === 'completed' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50'
                      }`}>
                        {service.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {isEditModalOpen && (
        <ClientModal
          client={client}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={fetchClient}
        />
      )}
    </div>
  )
}