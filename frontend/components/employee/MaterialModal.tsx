"use client"

import { useState, useEffect } from "react"

interface Props {
  tasks: any[] // Tareas del día para saber a qué clientes visitó
  onClose: () => void
}

export default function MaterialModal({ tasks, onClose }: Props) {
  const [clientInventories, setClientInventories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reportingId, setReportingId] = useState<number | null>(null)

  // Extraemos los IDs de los clientes únicos que visitó hoy
  const uniqueClientIds = Array.from(new Set(tasks.map(t => t.clientId)))

  useEffect(() => {
    // Si no hay tareas hoy, no hay materiales que reportar
    if (uniqueClientIds.length === 0) {
      setLoading(false)
      return
    }

    // Buscamos el inventario de los clientes visitados hoy
    // Nota: Como no tenemos una ruta específica múltiple, hacemos fetch individuales 
    // o puedes crear una ruta en el futuro que reciba un array de clientIds.
    // Por ahora, asumiremos que usamos la ruta estándar de inventario de cliente.
    const fetchInventories = async () => {
      try {
        const promises = uniqueClientIds.map(clientId => 
          // Ajusta esta ruta si tu endpoint para obtener inventario de un cliente es diferente
          fetch(`/api/clients/code/${clientId}/inventory`).then(res => res.ok ? res.json() : [])
        )
        const results = await Promise.all(promises)
        
        // Aplanamos el array de arrays y lo guardamos
        const allInventories = results.flat()
        setClientInventories(allInventories)
      } catch (error) {
        console.error("Error cargando inventarios:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInventories()
  }, [])

  const handleReportLowStock = async (inventoryId: number) => {
    setReportingId(inventoryId)
    try {
      const res = await fetch("/api/employees/inventory/alert", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientInventoryId: inventoryId })
      })

      if (res.ok) {
        // Actualizamos el estado local para reflejar que ya se reportó
        setClientInventories(prev => 
          prev.map(inv => inv.id === inventoryId ? { ...inv, quantity: 0 } : inv)
        )
      } else {
        alert("Fehler beim Melden. (Error al reportar)")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setReportingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-slate-900">Materialbedarf</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              Fehlendes Material melden
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#f6f7f8]">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="material-symbols-outlined animate-spin text-3xl text-[#1173d4]">refresh</span>
            </div>
          ) : clientInventories.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">inventory_2</span>
              <p className="text-sm font-bold text-gray-500">Keine Materialien für die heutigen Kunden gefunden.</p>
              <p className="text-xs text-gray-400 mt-1">(No se encontraron materiales para los clientes de hoy)</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientInventories.map((inv) => (
                <div key={inv.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#1173d4] mb-1">{inv.client?.name || "Kunde"}</p>
                    <p className="text-sm font-black text-slate-900">{inv.product?.name}</p>
                  </div>
                  
                  {inv.quantity <= 0 ? (
                    <span className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-100 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Gemeldet
                    </span>
                  ) : (
                    <button
                      onClick={() => handleReportLowStock(inv.id)}
                      disabled={reportingId === inv.id}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold shadow-sm hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {reportingId === inv.id ? (
                        <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">notification_important</span>
                      )}
                      Melden (Falta)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}