"use client"
import { useState } from "react"

export default function AddStockModal({ product, onClose, onSuccess }: any) {
  const [quantity, setQuantity] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!quantity || parseFloat(quantity) <= 0) return
    setLoading(true)

    try {
      const res = await fetch(`/api/products/${product.id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: parseFloat(quantity) })
      })

      if (res.ok) onSuccess()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl border p-8 space-y-6">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter">Stock Aufstocken</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.name}</p>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Menge hinzufügen ({product.unit})</label>
          <input 
            type="number"
            className="w-full h-14 rounded-2xl border-2 border-blue-50 px-4 text-lg font-black focus:border-blue-500 outline-none transition-all" 
            placeholder="z.B. 12"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 font-black uppercase text-xs text-slate-400 hover:text-slate-600 transition-colors">Abbrechen</button>
          <button 
            onClick={handleAdd} 
            disabled={loading}
            className="flex-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {loading ? "..." : "Hinzufügen"}
          </button>
        </div>
      </div>
    </div>
  )
}