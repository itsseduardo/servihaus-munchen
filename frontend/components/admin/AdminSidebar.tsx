export default function AdminSidebar() {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#dbe0e6] dark:border-gray-800 bg-white dark:bg-background-dark flex flex-col">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary rounded-lg p-1">
          <span className="material-symbols-outlined text-white">house</span>
        </div>
        <div>
          <h1 className="text-lg font-extrabold">ServiHouse</h1>
          <p className="text-xs uppercase tracking-wider text-[#617589]">
            Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <SidebarItem icon="dashboard" label="Dashboard" />
        <SidebarItem icon="calendar_today" label="Calendar" active />
        <SidebarItem icon="groups" label="Clients" />
        <SidebarItem icon="engineering" label="Employees" />
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
  icon,
  label,
  active,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors
        ${
          active
            ? "bg-primary/10 text-primary border-r-4 border-primary"
            : "text-[#617589] hover:bg-[#f0f2f4] dark:hover:bg-gray-800"
        }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}
