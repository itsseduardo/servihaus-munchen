"use client"

import { useState, useEffect } from "react"

interface Props {
  onClose: () => void
  onSuccess: () => void
  preselectedProductId?: string // Opcional, para pre-seleccionar un producto si se abre desde una fila específica
}

export default function InboundModal({ onClose, onSuccess, preselectedProductId }: Props) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Estados del formulario
  const [productId, setProductId] = useState(preselectedProductId || "")
  const [quantity, setQuantity] = useState("")
  const [provider, setProvider] = useState("")
  const [costPerUnit, setCostPerUnit] = useState("")
  const [notes, setNotes] = useState("")

  // Cargamos la lista de productos existentes para el menú desplegable
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = async () => {
    if (!productId || !quantity || Number(quantity) <= 0) {
      alert("Bitte wählen Sie ein Produkt und eine gültige Menge. (Selecciona producto y cantidad)")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/inventory/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: parseFloat(quantity),
          provider,
          costPerUnit: costPerUnit ? parseFloat(costPerUnit) : null,
          notes
        })
      })

      if (res.ok) {
        onSuccess() // Recarga la tabla de inventario
        onClose()
      } else {
        const err = await res.json()
        alert(err.error || "Fehler beim Speichern")
      }
    } catch (error) {
      console.error(error)
      alert("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">local_shipping</span>
              Wareneingang
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Ingreso de mercancía a Bodega Central
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-5">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Produkt auswählen (Producto)</label>
            <select 
              value={productId} 
              onChange={e => setProductId(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">-- Bitte wählen --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Aktuell: {p.globalStock} {p.unit})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Menge (Cantidad)</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={e => setQuantity(e.target.value)}
                placeholder="z.B. 50"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Stückpreis (Costo x Unidad) €</label>
              <input 
                type="number" 
                step="0.01"
                value={costPerUnit} 
                onChange={e => setCostPerUnit(e.target.value)}
                placeholder="z.B. 2.50"
                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Lieferant (Proveedor)</label>
            <input 
              type="text" 
              value={provider} 
              onChange={e => setProvider(e.target.value)}
              placeholder="z.B. Amazon, Metro..."
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Notizen (Notas)</label>
            <input 
              type="text" 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              placeholder="Opcional..."
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-slate-300 font-bold text-sm hover:bg-slate-200 text-slate-700 transition">
            Abbrechen
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Speichern..." : "Einbuchen (Ingresar)"}
          </button>
        </div>

      </div>
    </div>
  )
}