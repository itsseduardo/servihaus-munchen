"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="flex items-center justify-between border-b border-[#f0f2f4] dark:border-[#2d3748] px-10 py-4 bg-white dark:bg-background-dark sticky top-0 z-50">
      
      {/* Logo */}
      <div className="flex items-center gap-4 text-primary">
        <div className="size-8">
          <svg fill="none" viewBox="0 0 48 48">
            <path
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-[#111418] dark:text-white">
          ServiHausMünchen
        </h2>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex gap-8 text-sm font-semibold">
        <a className="hover:text-primary transition-colors" href="#">Leistungen</a>
        <a className="hover:text-primary transition-colors" href="#">Über uns</a>
        <a className="hover:text-primary transition-colors" href="#">Kontakt</a>
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        <button className="h-10 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90">
          Jetzt anrufen
        </button>

        {/* AUTH SECTION */}
        {!session ? (
          <Link
            href="/login"
            className="h-10 px-5 rounded-lg border border-primary text-primary text-sm font-bold flex items-center justify-center hover:bg-primary/10"
          >
            Login
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-[#111418] dark:text-white">
                {session.user?.name}
              </span>
              <span className="text-xs text-[#617589]">
                {session.user?.role}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="size-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:opacity-80"
              title="Logout"
            />
          </div>
        )}
      </div>
    </header>
  )
}