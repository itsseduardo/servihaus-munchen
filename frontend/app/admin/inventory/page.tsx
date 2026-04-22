"use client"

import { useEffect, useState } from "react"
import AddDeliveryModal from "@/components/admin/AddDeliveryModal"


export default function InventoryPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory")
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  if (loading) return <div className="p-10 font-black animate-pulse text-slate-400">LADE BESTAND...</div>

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Inventar & Logistik</h1>
          <p className="text-sm text-slate-500 font-medium italic">Bestandsverwaltung pro Kunde (SAMP)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <span className="text-lg">+</span> SAMP Registrieren
        </button>
      </div>

      {/* 1. SECCIÓN DE ALERTAS CRÍTICAS (Lo que José quiere ver primero) */}
      {data?.alerts?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">⚠️ Kritischer Bestand / Alertas de Suministros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.alerts.map((alert: any) => (
              <div key={alert.id} className="bg-white border-2 border-rose-100 p-5 rounded-3xl flex items-center gap-4 shadow-sm animate-pulse">
                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-xl">🧴</div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{alert.client.name}</p>
                  <p className="text-sm font-black text-rose-700">{alert.product.name}</p>
                  <p className="text-xs font-bold text-slate-500">Bestand: <span className="text-rose-600">{alert.quantity} {alert.product.unit}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TABLA DE INVENTARIO POR CLIENTE */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kunden-Inventar / Inventario Detallado</h2>
        <div className="grid grid-cols-1 gap-6">
          {data?.inventoryByClient?.map((entry: any) => (
            <div key={entry.client.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-4 bg-slate-50 border-b flex justify-between items-center">
                <h3 className="font-black text-slate-700 uppercase text-xs tracking-wider">{entry.client.name}</h3>
                <span className="text-[10px] font-bold text-slate-400">Letzte Lieferung: {new Date(entry.items[0].lastUpdated).toLocaleDateString()}</span>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {entry.items.map((item: any) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col items-center text-center">
                    <span className="text-xl mb-2">📦</span>
                    <p className="text-[9px] font-black uppercase text-slate-400 leading-tight mb-1">{item.product.name}</p>
                    <p className="text-sm font-black text-slate-800">{item.quantity} <span className="text-[10px] text-slate-400">{item.product.unit}</span></p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <AddDeliveryModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            fetchInventory()
            setIsModalOpen(false)
          }}
        />
      )}
    </div>
  )
}