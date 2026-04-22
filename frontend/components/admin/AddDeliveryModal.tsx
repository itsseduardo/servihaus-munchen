"use client"
import { useState, useEffect } from "react"

export default function AddDeliveryModal({ onClose, onSuccess }: any) {
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  
  // Datos del albarán (SAMP)
  const [clientId, setClientId] = useState("")
  const [deliveryCode, setDeliveryCode] = useState("") // Ej: SAMP.0126.100-A.1
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState([{ productId: "", quantity: "" }])

  useEffect(() => {
    // Cargar clientes y catálogo de productos al abrir
    fetch("/api/clients").then(res => res.json()).then(setClients)
    fetch("/api/products").then(res => res.json()).then(setProducts)
  }, [])

  const addItem = () => setItems([...items, { productId: "", quantity: "" }])

  const handleSubmit = async () => {
    const res = await fetch("/api/inventory/delivery", {
      method: "POST",
      body: JSON.stringify({ clientId, deliveryCode, date, items })
    })
    if (res.ok) onSuccess()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20">
        <div className="p-10 bg-slate-50 border-b">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">SAMP Lieferung Registrieren</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Carga de productos según documento oficial</p>
        </div>

        <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Datos Generales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Kunde / Cliente</label>
              <select className="w-full h-12 rounded-2xl border bg-white px-4 text-sm font-bold" value={clientId} onChange={e => setClientId(e.target.value)}>
                <option value="">Wählen...</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">SAMP-Code</label>
              <input className="w-full h-12 rounded-2xl border px-4 text-sm font-bold" placeholder="z.B. SAMP.0126.100-A" value={deliveryCode} onChange={e => setDeliveryCode(e.target.value)} />
            </div>
          </div>

          {/* Listado de Productos (Basado en el doc de Condesa/MOMUC) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Produkte / Productos entregados</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <select 
                  className="flex-1 h-12 rounded-2xl border px-4 text-sm font-bold"
                  onChange={e => {
                    const newItems = [...items]; newItems[idx].productId = e.target.value; setItems(newItems)
                  }}
                >
                  <option value="">Produkt wählen...</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                </select>
                <input 
                  type="number" className="w-24 h-12 rounded-2xl border text-center font-black" placeholder="Qty" 
                  onChange={e => {
                    const newItems = [...items]; newItems[idx].quantity = e.target.value; setItems(newItems)
                  }}
                />
              </div>
            ))}
            <button onClick={addItem} className="text-[10px] font-black text-blue-600 uppercase mt-2">+ Weiteres Produkt hinzufügen</button>
          </div>
        </div>

        <div className="p-10 bg-slate-50 border-t flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 font-black uppercase text-xs text-slate-400">Abbrechen</button>
          <button onClick={handleSubmit} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-500/20">Lieferung Speichern</button>
        </div>
      </div>
    </div>
  )
}