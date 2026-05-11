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

  const navItems = [
    { name: "Leistungen", href: "#leistungen" },
    { name: "Über uns", href: "#ueber-uns" },
    { name: "Kontakt", href: "#kontakt" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 text-blue-600">
          <span className="material-symbols-outlined text-3xl font-black">
            cleaning_services
          </span>

          <span className="text-lg font-black tracking-tight text-slate-900">
            ServiHausMünchen
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-black text-slate-500 transition-colors hover:text-blue-600"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!session ? (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
            >
              Login
            </Link>
          ) : (
            <>
              <Link
                href={getDashboardLink()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 sm:px-4"
              >
                <span className="material-symbols-outlined text-[20px]">
                  dashboard
                </span>

                <span className="hidden sm:inline">Zum Dashboard</span>
              </Link>

              <div className="hidden leading-tight lg:block">
                <p className="max-w-[160px] truncate text-sm font-black text-slate-800">
                  {session.user?.name}
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  {session.user?.role}
                </p>
              </div>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                title="Abmelden"
              >
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}