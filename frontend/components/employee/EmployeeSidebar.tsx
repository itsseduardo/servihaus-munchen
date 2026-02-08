export default function EmployeeSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
      {/* Brand */}
      <div className="p-6 flex items-center gap-2.5">
        <div className="text-primary">
          <span className="material-symbols-outlined text-3xl font-bold">
            home
          </span>
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">
          ServiHaus
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <SidebarItem
          icon="calendar_month"
          label="My Schedule"
          active
        />
        <SidebarItem icon="history" label="Past Jobs" />
        <SidebarItem icon="account_circle" label="Profile" />
        <SidebarItem icon="help_center" label="Help" />
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
            JD
          </div>
          <div>
            <p className="text-sm font-bold">John Doe</p>
            <p className="text-xs text-slate-500">
              Service Technician
            </p>
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all cursor-pointer
        ${
          active
            ? "bg-primary/10 text-primary"
            : "text-slate-600 hover:bg-slate-100"
        }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {label}
    </div>
  );
}
