"use client"
import { useState, useEffect } from "react"

interface Props {
  tasks: any[] // Tareas de hoy para saber a qué clientes fue
  onClose: () => void
}

export default function MaterialModal({ tasks, onClose }: Props) {
  const [products, setProducts] = useState<any[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [consumedItems, setConsumedItems] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)

  // Extraemos los clientes únicos de las tareas de hoy
  const clients = Array.from(new Set(tasks.map(t => t.clientId))).map(id => {
    return tasks.find(t => t.clientId === id)
  })

  useEffect(() => {
    // Cargamos el catálogo global de productos
    fetch("/api/products").then(res => res.json()).then(setProducts)
  }, [])

  const handleIncrement = (productId: number) => {
    setConsumedItems(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }))
  }

  const handleDecrement = (productId: number) => {
    setConsumedItems(prev => {
      const current = prev[productId] || 0
      if (current <= 0) return prev
      return { ...prev, [productId]: current - 1 }
    })
  }

  const handleSubmit = async () => {
    if (!selectedClientId) return
    
    // Transformamos el objeto a un array para la API
    const items = Object.entries(consumedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ productId: parseInt(id), quantity: qty }))

    if (items.length === 0) return

    setLoading(true)
    try {
      const res = await fetch("/api/employees/inventory/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // En real, aquí usarías el ID numérico del cliente en la BD
        // Para este prototipo enviamos 1 como placeholder
        body: JSON.stringify({ clientId: 1, items }) 
      })

      if (res.ok) {
        onClose()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const totalItems = Object.values(consumedItems).reduce((a, b) => a + b, 0)

  return (
    <div className="absolute inset-0 z-[100] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm p-4 pb-12 font-sans">
      <div className="bg-[#f6f7f8] w-full max-h-[85vh] flex flex-col rounded-3xl shadow-2xl animate-slide-up overflow-hidden">
        
        {/* HEADER DEL MODAL */}
        <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">Materialverbrauch</h2>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mt-1">Material Consumido</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* PASO 1: SELECCIONAR CLIENTE */}
          <div className="space-y-3">
            <label className="text-[10px] font-extrabold text-[#1173d4] uppercase tracking-widest">1. Kunde wählen (Cliente)</label>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {clients.map(client => (
                <button
                  key={client.clientId}
                  onClick={() => setSelectedClientId(client.clientId)}
                  className={`shrink-0 px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    selectedClientId === client.clientId 
                      ? 'border-[#1173d4] bg-blue-50 text-[#1173d4]' 
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {client.clientName}
                </button>
              ))}
            </div>
          </div>

          {/* PASO 2: SELECCIONAR MATERIALES */}
          {selectedClientId && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-[10px] font-extrabold text-[#1173d4] uppercase tracking-widest">2. Verbrauchte Produkte</label>
              <div className="space-y-3">
                {products.length === 0 ? (
                  <p className="text-sm text-gray-400 font-bold text-center py-4">Lade Produkte...</p>
                ) : (
                  products.map(product => {
                    const qty = consumedItems[product.id] || 0
                    return (
                      <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                        <div className="flex-1">
                          <p className="font-extrabold text-slate-800">{product.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{product.unit}</p>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 p-1 rounded-xl border border-gray-100">
                          <button 
                            onClick={() => handleDecrement(product.id)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg transition-colors ${qty > 0 ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-300'}`}
                          >
                            -
                          </button>
                          <span className="w-4 text-center font-black text-slate-900">{qty}</span>
                          <button 
                            onClick={() => handleIncrement(product.id)}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-lg text-[#1173d4]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER - BOTÓN DE GUARDAR */}
        <div className="bg-white p-6 border-t border-gray-200 shrink-0">
          <button 
            disabled={!selectedClientId || totalItems === 0 || loading}
            onClick={handleSubmit}
            className="w-full py-4 bg-[#1173d4] text-white rounded-xl font-extrabold uppercase text-xs tracking-widest disabled:opacity-30 disabled:bg-gray-400 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            {loading ? "Speichern..." : `Beenden (${totalItems} Produkte)`}
          </button>
        </div>

      </div>
    </div>
  )
}