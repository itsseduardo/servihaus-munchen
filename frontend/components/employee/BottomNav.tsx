"use client"

type Props = {
  active: string
  onTabChange: (tab: string) => void
  onOpenMaterial: () => void
}

export default function BottomNav({
  active,
  onTabChange,
  onOpenMaterial,
}: Props) {
  const navItems = [
    {
      key: "today",
      label: "MY JOBS",
      icon: "calendar_month",
      onClick: () => onTabChange("today"),
    },
    {
      key: "material",
      label: "MATERIAL",
      icon: "inventory_2",
      onClick: onOpenMaterial,
    },
    {
      key: "profile",
      label: "PROFILE",
      icon: "account_circle",
      onClick: () => onTabChange("profile"),
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-xl grid-cols-3 items-center">
        {navItems.map((item) => {
          const isActive = active === item.key

          return (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className={`flex h-full flex-col items-center justify-center gap-1 rounded-2xl transition-all ${
                isActive
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[26px] ${
                  isActive ? "fill-1" : ""
                }`}
              >
                {item.icon}
              </span>

              <span className="text-[10px] font-black tracking-wide">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}