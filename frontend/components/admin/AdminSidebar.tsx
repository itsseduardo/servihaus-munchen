"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#dbe0e6] dark:border-gray-800 bg-white dark:bg-background-dark flex flex-col relative">

      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary rounded-lg p-1">
          <span className="material-symbols-outlined text-white">house</span>
        </div>
        <div>
          <h1 className="text-lg font-extrabold">ServiHaus</h1>
          <p className="text-xs uppercase tracking-wider text-[#617589]">
            Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <SidebarItem
          href="/admin/dashboard"
          icon="dashboard"
          label="Dashboard"
          active={pathname === "/admin/dashboard"}
        />
        <SidebarItem
          href="/admin/calendar"
          icon="calendar_today"
          label="Calendar"
          active={pathname === "/admin/calendar"}
        />
        <SidebarItem
          href="/admin/clients"
          icon="groups"
          label="Clients"
          active={pathname === "/admin/clients"}
        />
        <SidebarItem
          href="/admin/employees"
          icon="engineering"
          label="Employees"
          active={pathname === "/admin/employees"}
        />
      </nav>

      {/* User Section */}
      <div className="p-4 mt-auto border-t border-[#dbe0e6] dark:border-gray-800">
        <UserDropdown />
      </div>
    </aside>
  )
}

function SidebarItem({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: string
  label: string
  active?: boolean
}) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
          ${active
            ? "bg-primary/10 text-primary border-r-4 border-primary"
            : "text-[#617589] hover:bg-[#f0f2f4] dark:hover:bg-gray-800"
          }`}
      >
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </Link>
  )
}

function UserDropdown() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const userName = session?.user?.name || "User"
  const userRole = session?.user?.role || "Admin"

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () =>
      document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">

      {/* Clickable User */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition"
      >
        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
          {userName.charAt(0)}
        </div>

        <div>
          <p className="text-sm font-bold">{userName}</p>
          <p className="text-xs text-[#617589]">{userRole}</p>
        </div>

        <span className="material-symbols-outlined text-sm ml-auto">
          {open ? "expand_less" : "expand_more"}
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 bottom-14 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
          <button
            onClick={() =>
              signOut({
                callbackUrl: "/",
              })
            }
            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">
              logout
            </span>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}