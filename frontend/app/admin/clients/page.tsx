"use client"

import { useEffect, useMemo, useState } from "react"
import ClientModal from "@/components/admin/ClientModal"
import { useRouter } from "next/navigation"

export default function ClientsPage() {

  const router = useRouter()

  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any | null>(null)

  // PAGINACIÓN
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

  // ORDEN EMPRESARIAL
  const categoryOrder = ["A","B","C","D","E","Z"]

  const sortedClients = useMemo(() => {
    return [...clients].sort(
      (a, b) =>
        categoryOrder.indexOf(a.category) -
        categoryOrder.indexOf(b.category)
    )
  }, [clients])

  // PAGINACIÓN LÓGICA
  const totalPages = Math.ceil(sortedClients.length / itemsPerPage)

  const paginatedClients = sortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // COLORES
  const categoryStyles: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-800",
    B: "bg-blue-100 text-blue-800",
    C: "bg-gray-100 text-gray-800",
    D: "bg-gray-200 text-gray-700",
    E: "bg-amber-100 text-amber-800",
    Z: "bg-red-100 text-red-800",
  }

  const updateCategory = async (id: number, category: string) => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      })

      if (!res.ok) throw new Error()

      setClients((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, category } : c
        )
      )

    } catch (error) {
      alert("Fehler beim Aktualisieren")
    }
  }

  if (loading) {
    return <div className="p-10">Loading...</div>
  }

  return (
    <div className="p-10 space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Kundenverwaltung
          </h1>
          <p className="text-slate-500 mt-2">
            {clients.length} Kunden insgesamt
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedClient(null)
            setShowModal(true)
          }}
          className="px-6 py-3 bg-primary text-white rounded-xl shadow hover:shadow-lg transition"
        >
          + Neuer Kunde
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <th className="px-8 py-4 text-left">Code</th>
              <th className="px-8 py-4 text-left">Name</th>
              <th className="px-8 py-4 text-left">Kategorie</th>
              <th className="px-8 py-4 text-left">Adresse</th>
              <th className="px-8 py-4 text-left">Email</th>
              <th className="px-8 py-4 text-left">Telefon</th>
            </tr>
          </thead>

          <tbody>
            {paginatedClients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-8 text-center text-slate-500">
                  Keine Kunden vorhanden
                </td>
              </tr>
            )}

            {paginatedClients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition duration-150"
              >
                <td
                  className="px-8 py-5 font-semibold cursor-pointer"
                  onClick={() => router.push(`/admin/clients/${client.id}`)}
                >
                  {client.clientCode}
                </td>

                <td
                  className="px-8 py-5 cursor-pointer"
                  onClick={() => router.push(`/admin/clients/${client.id}`)}
                >
                  {client.name}
                </td>

                <td className="px-8 py-5">
                  <select
                    value={client.category}
                    onChange={(e) =>
                      updateCategory(client.id, e.target.value)
                    }
                    className={`px-3 py-1 rounded-full text-xs font-bold border-none cursor-pointer shadow-sm ${categoryStyles[client.category]}`}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="Z">Z</option>
                  </select>
                </td>

                <td className="px-8 py-5">
                  {client.address ?? "-"}
                </td>

                <td className="px-8 py-5">
                  {client.email ?? "-"}
                </td>

                <td className="px-8 py-5">
                  {client.phone ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-2 text-sm rounded-lg border disabled:opacity-40"
          >
            ←
          </button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm rounded-lg border ${
                  currentPage === page
                    ? "bg-primary text-white border-primary"
                    : "hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            )
          })}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-2 text-sm rounded-lg border disabled:opacity-40"
          >
            →
          </button>

        </div>
      )}

      {/* MODAL */}
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