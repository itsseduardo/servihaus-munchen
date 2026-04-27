"use client"

import { useEffect, useState } from "react"
import AddProductModal from "@/components/admin/AddProductModal"
import InboundModal from "@/components/admin/InboundModal" // Importamos el nuevo modal transaccional

export default function ProductsCatalogPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados para controlar los dos modales principales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isInboundModalOpen, setIsInboundModalOpen] = useState(false)
  
  // Guardamos el ID del producto si José hace clic desde una fila específica
  const [preselectedProductId, setPreselectedProductId] = useState<string | undefined>(undefined)

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

  // Función para abrir el modal de ingreso pre-seleccionando un producto
  const handleOpenInboundForProduct = (productId: string) => {
    setPreselectedProductId(productId)
    setIsInboundModalOpen(true)
  }

  // Función para abrir el modal de ingreso vacío (desde el botón superior)
  const handleOpenGeneralInbound = () => {
    setPreselectedProductId(undefined)
    setIsInboundModalOpen(true)
  }

  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mb-4"></div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Lade Zentrallager...</p>
    </div>
  )

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen text-slate-900">
      
      {/* 1. CABECERA Y ACCIONES PRINCIPALES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Zentrallager</h1>
          <p className="text-sm text-slate-500 font-medium italic">Bestandsverwaltung & Wareneingang (Bodega Central)</p>
        </div>
        
        <div className="flex gap-3">
          {/* Botón Secundario: Crear Producto Nuevo en Catálogo */}
          <button 
            onClick={() => setIsProductModalOpen(true)}
            className="bg-white border border-slate-300 text-slate-700 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_box</span> 
            Neues Produkt
          </button>

          {/* Botón Principal: Ingresar Mercancía (Compras) */}
          <button 
            onClick={handleOpenGeneralInbound}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">local_shipping</span> 
            Wareneingang
          </button>
        </div>
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
                  Keine Produkte im Katalog. (No hay productos en el catálogo).
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
                        {/* Botón para registrar entrada de este producto específico */}
                        <button 
                          onClick={() => handleOpenInboundForProduct(p.id.toString())}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase"
                          title="Wareneingang für dieses Produkt"
                        >
                          <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                          Einbuchen
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
      
      {/* Modal para Crear Producto Nuevo en el Catálogo */}
      {isProductModalOpen && (
        <AddProductModal 
          onClose={() => setIsProductModalOpen(false)} 
          onSuccess={() => {
            setIsProductModalOpen(false)
            fetchProducts()
          }} 
        />
      )}

      {/* Modal para Ingresar Mercancía (Wareneingang) */}
      {isInboundModalOpen && (
        <InboundModal 
          preselectedProductId={preselectedProductId}
          onClose={() => {
            setIsInboundModalOpen(false)
            setPreselectedProductId(undefined)
          }}
          onSuccess={() => {
            setIsInboundModalOpen(false)
            setPreselectedProductId(undefined)
            fetchProducts()
          }}
        />
      )}
    </div>
  )
}