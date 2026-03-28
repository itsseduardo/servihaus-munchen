"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function ClientDetailPage() {

  const params = useParams()
  const router = useRouter()
  const id = params.id

  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
    A: "bg-emerald-100 text-emerald-800",
    B: "bg-blue-100 text-blue-800",
    C: "bg-gray-100 text-gray-800",
    D: "bg-gray-200 text-gray-700",
    E: "bg-amber-100 text-amber-800",
    Z: "bg-red-100 text-red-800",
  }

  const stats = useMemo(() => {
    if (!client) return { total: 0, active: 0, completed: 0 }

    const total = client.services.length
    const active = client.services.filter((s: any) => s.status === "assigned" || s.status === "in_progress").length
    const completed = client.services.filter((s: any) => s.status === "completed").length

    return { total, active, completed }
  }, [client])

  if (loading) return <div className="p-10">Loading...</div>
  if (!client) return <div className="p-10">Client not found</div>

  return (
    <div className="p-10 space-y-10">

      {/* BACK */}
      <button
        onClick={() => router.push("/admin/clients")}
        className="text-sm text-slate-500 hover:underline"
      >
        ← Zurück zur Kundenliste
      </button>

      {/* HEADER */}
      <div className="flex justify-between items-start">

        <div>
          <h1 className="text-4xl font-black tracking-tight">
            {client.name}
          </h1>

          <div className="flex items-center gap-4 mt-3">
            <span className="text-slate-500 text-sm font-medium">
              Code: {client.clientCode}
            </span>

            <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryStyles[client.category]}`}>
              Kategorie {client.category}
            </span>
          </div>
        </div>

      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Gesamt Services
          </p>
          <p className="text-3xl font-black mt-2">
            {stats.total}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Aktive Services
          </p>
          <p className="text-3xl font-black mt-2 text-blue-600">
            {stats.active}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Abgeschlossen
          </p>
          <p className="text-3xl font-black mt-2 text-emerald-600">
            {stats.completed}
          </p>
        </div>

      </div>

      {/* CLIENT INFO */}
      <div className="bg-white p-8 rounded-2xl border shadow-sm">

        <h2 className="text-lg font-bold mb-6">
          Kundeninformationen
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Email</p>
            <p className="text-lg mt-1">{client.email ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Telefon</p>
            <p className="text-lg mt-1">{client.phone ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Adresse</p>
            <p className="text-lg mt-1">{client.address ?? "-"}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Erstellt am</p>
            <p className="text-lg mt-1">
              {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </div>

        </div>
      </div>

      {/* SERVICE HISTORY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-8 py-6 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">
            Service-Historie
          </h2>

          <span className="text-sm text-slate-500">
            {stats.total} Einträge
          </span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <th className="px-8 py-4 text-left">Datum</th>
              <th className="px-8 py-4 text-left">Code</th>
              <th className="px-8 py-4 text-left">Status</th>
              <th className="px-8 py-4 text-left">Dauer</th>
            </tr>
          </thead>

          <tbody>
            {client.services.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-8 text-center text-slate-500">
                  Keine Services vorhanden
                </td>
              </tr>
            )}

            {client.services.map((service: any) => (
              <tr
                key={service.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="px-8 py-5">
                  {new Date(service.date).toLocaleDateString()}
                </td>

                <td className="px-8 py-5 font-semibold">
                  {service.code ?? "-"}
                </td>

                <td className="px-8 py-5">
                  {service.status}
                </td>

                <td className="px-8 py-5">
                  {service.duration ?? 0} h
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  )
}