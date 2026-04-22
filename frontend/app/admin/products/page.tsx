"use client"

import { useEffect, useState } from "react"
import AddProductModal from "@/components/admin/AddProductModal"
import AddStockModal from "@/components/admin/AddStockModal"

export default function ProductsCatalogPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados para controlar los dos modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      setProducts(data)
    } catch (err) {
      console.error("Error al cargar productos:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mb-4"></div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Lade Produktkatalog...</p>
    </div>
  )

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen text-slate-900">
      
      {/* 1. HEADER Y ACCIÓN PRINCIPAL */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Produktkatalog</h1>
          <p className="text-sm text-slate-500 font-medium italic">Zentrallager & Stammdaten (Almacén Central)</p>
        </div>
        <button 
          onClick={() => setIsProductModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2"
        >
          <span className="text-lg">+</span> Neues Produkt
        </button>
      </div>

      {/* 2. TABLA DE PRODUCTOS (CATÁLOGO GLOBAL) */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-6">Produktname / Nombre</th>
              <th className="px-8 py-6 text-center">Einheit / Unidad</th>
              <th className="px-8 py-6 text-center">Servihaus Lager (Stock)</th>
              <th className="px-8 py-6 text-center">Min. Bestand (Alerta)</th>
              <th className="px-8 py-6 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic font-medium">
                  No hay productos en el catálogo. Comienza agregando uno nuevo.
                </td>
              </tr>
            ) : (
              products.map((p: any) => {
                const isLowStock = p.globalStock <= p.minStock;
                
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                          {p.name.toLowerCase().includes('handschuh') ? '🧤' : '🧴'}
                        </div>
                        <span className="text-slate-800 font-black">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center text-slate-500 font-medium">
                      {p.unit}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-base font-black ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>
                          {p.globalStock}
                        </span>
                        {isLowStock && (
                          <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">Einkauf Nötig!</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center text-slate-400 italic">
                      {p.minStock} {p.unit}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Botón para añadir Stock */}
                        <button 
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsStockModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase"
                          title="Stock aufstocken"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                          </svg>
                          Aufstocken
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. MODALES DE GESTIÓN */}
      
      {/* Modal para Crear Producto Nuevo */}
      {isProductModalOpen && (
        <AddProductModal 
          onClose={() => setIsProductModalOpen(false)} 
          onSuccess={() => {
            setIsProductModalOpen(false)
            fetchProducts()
          }} 
        />
      )}

      {/* Modal para Añadir Stock al Almacén Central */}
      {isStockModalOpen && (
        <AddStockModal 
          product={selectedProduct}
          onClose={() => {
            setIsStockModalOpen(false)
            setSelectedProduct(null)
          }}
          onSuccess={() => {
            setIsStockModalOpen(false)
            setSelectedProduct(null)
            fetchProducts()
          }}
        />
      )}
    </div>
  )
}