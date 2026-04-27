"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession()

  const getDashboardLink = () => {
    if (session?.user?.role === "ADMIN") return "/admin/dashboard"
    if (session?.user?.role === "EMPLOYEE") return "/employee/dashboard"
    return "/client/dashboard"
  }

  return (
    <header className="flex items-center justify-between border-b border-[#f0f2f4] dark:border-[#2d3748] px-4 md:px-10 py-3 md:py-4 bg-white/80 backdrop-blur-md dark:bg-background-dark sticky top-0 z-50">
      
      {/* 1. Logo (Siempre visible, se ajusta el tamaño en móvil) */}
      <Link href="/" className="flex items-center gap-2 sm:gap-3 text-blue-600 shrink-0 min-w-0">
        <div className="size-6 sm:size-8 shrink-0">
          <svg fill="none" viewBox="0 0 48 48">
            <path
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
            />
          </svg>
        </div>
        <h2 className="text-[15px] sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
          ServiHausMünchen
        </h2>
      </Link>

      {/* 2. Nav (Solo visible en Desktop) */}
      <nav className="hidden lg:flex gap-8 text-sm font-bold text-slate-500">
        <a className="hover:text-blue-600 transition-colors" href="#">Leistungen</a>
        <a className="hover:text-blue-600 transition-colors" href="#">Über uns</a>
        <a className="hover:text-blue-600 transition-colors" href="#">Kontakt</a>
      </nav>

      {/* 3. Right Side (Acciones) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">

        {!session ? (
          <Link
            href="/login"
            className="h-8 px-4 text-xs sm:h-10 sm:px-6 sm:text-sm rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
          >
            Login
          </Link>
        ) : (
          <div className="flex items-center gap-2 sm:gap-5">
            
            {/* Botón Inteligente: Icono en móvil, Texto en PC */}
            <Link
              href={getDashboardLink()}
              className="flex h-8 w-8 sm:w-auto sm:h-9 sm:px-4 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold items-center justify-center hover:bg-slate-200 transition-colors"
              title="Zum Dashboard"
            >
              <span className="material-symbols-outlined text-[18px] sm:hidden">dashboard</span>
              <span className="hidden sm:inline">Zum Dashboard</span>
            </Link>

            {/* Texto de usuario solo en PC */}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {session.user?.name}
              </span>
              <span className="text-[10px] font-black tracking-widest uppercase text-blue-500">
                {session.user?.role}
              </span>
            </div>

            {/* Logout con tamaño adaptativo */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="size-8 sm:size-10 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all"
              title="Abmelden (Cerrar Sesión)"
            >
              <span className="material-symbols-outlined text-sm font-black">logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}