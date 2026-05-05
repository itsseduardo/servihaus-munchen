"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Menú de navegación del cliente
  const navItems = [
    { name: "Übersicht", href: "/client/dashboard", icon: "dashboard" },
    { name: "Historie", href: "/client/history", icon: "history_edu" },
    { name: "Rechnungen", href: "/client/invoices", icon: "receipt_long" },
    { name: "Support", href: "/client/support", icon: "support_agent" }
  ]

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      
      {/* 💻 DESKTOP: SIDEBAR IZQUIERDA */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-slate-200 fixed h-full z-20">
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-3 text-blue-600">
            <span className="material-symbols-outlined text-3xl font-black">cleaning_services</span>
            <span className="text-lg font-black tracking-tight text-slate-900">ServiHaus</span>
          </div>
        </div>

        {/* Menú Desktop */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                <span className={`material-symbols-outlined ${isActive ? 'fill-1' : ''}`}>{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Botón Logout Desktop */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            Abmelden
          </button>
        </div>
      </aside>

      {/* 📱 MOBILE: TOP HEADER */}
      <header className="md:hidden fixed top-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 text-blue-600">
          <span className="material-symbols-outlined text-2xl font-black">cleaning_services</span>
          <span className="font-black text-slate-900">ServiHaus</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="text-slate-400 hover:text-rose-500">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL (Donde vivirán las páginas) */}
      <main className="flex-1 md:ml-[260px] pt-16 md:pt-0 pb-24 md:pb-0 min-h-screen">
        {children}
      </main>

      {/* 📱 MOBILE: BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-20 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.name} href={item.href} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                <div className={`px-4 py-1 rounded-full transition-all ${isActive ? 'bg-blue-100/50' : 'bg-transparent'}`}>
                  <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill-1' : ''}`}>{item.icon}</span>
                </div>
                <span className="text-[10px] font-bold">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      
    </div>
  )
}