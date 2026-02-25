"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#dbe0e6] dark:border-gray-800 bg-white dark:bg-background-dark flex flex-col">
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

      {/* User */}
      <div className="p-4 mt-auto border-t border-[#dbe0e6] dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gray-300" />
          <div>
            <p className="text-sm font-bold">José Vazquez</p>
            <p className="text-xs text-[#617589]">System Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
          ${
            active
              ? "bg-primary/10 text-primary border-r-4 border-primary"
              : "text-[#617589] hover:bg-[#f0f2f4] dark:hover:bg-gray-800"
          }`}
      >
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
    </Link>
  );
}
