"use client"
import { useState } from "react"

export default function AddProductModal({ onClose, onSuccess }: any) {
  const [name, setName] = useState("")
  const [unit, setUnit] = useState("")
  const [minStock, setMinStock] = useState("1")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name || !unit) return
    setLoading(true)

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, unit, minStock })
      })

      if (res.ok) {
        onSuccess()
      } else {
        alert("Fehler beim Speichern des Produkts.")
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border">
        <div className="p-8 bg-slate-50 border-b">
          <h2 className="text-xl font-black uppercase tracking-tighter">Neues Produkt</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Catálogo Global / Stammdateien</p>
        </div>

        <div className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Produktname / Nombre</label>
            <input 
              className="w-full h-12 rounded-2xl border px-4 text-sm font-bold focus:ring-2 outline-none" 
              placeholder="z.B. Dr. Becher Fettlöser" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Einheit / Unidad</label>
              <input 
                className="w-full h-12 rounded-2xl border px-4 text-sm font-bold focus:ring-2 outline-none" 
                placeholder="z.B. 1L, 200Stk" 
                value={unit} 
                onChange={e => setUnit(e.target.value)} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-rose-400 uppercase ml-1">Min. Bestand / Alerta</label>
              <input 
                type="number"
                className="w-full h-12 rounded-2xl border-2 border-rose-100 px-4 text-sm font-black focus:border-rose-400 outline-none" 
                placeholder="z.B. 2" 
                value={minStock} 
                onChange={e => setMinStock(e.target.value)} 
              />
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 font-black uppercase text-xs text-slate-400">Abbrechen</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-3 bg-slate-800 text-white rounded-xl font-black uppercase text-xs shadow-lg disabled:opacity-50 hover:bg-slate-900 transition-colors">
            {loading ? "Speichern..." : "Produkt Speichern"}
          </button>
        </div>
      </div>
    </div>
  )
}