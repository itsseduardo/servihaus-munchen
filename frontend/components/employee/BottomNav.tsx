"use client"

interface Props {
  activeTab: "today" | "history" | "profile"
  onTabChange: (tab: "today" | "history" | "profile") => void
  onOpenMaterial: () => void
}

export default function BottomNav({ activeTab, onTabChange, onOpenMaterial }: Props) {
  return (
    <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-6 py-3 pb-8 z-30">
      <div className="flex items-center justify-between">
        
        {/* Botón 1: My Jobs */}
        <button 
          onClick={() => onTabChange("today")}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'today' ? 'text-[#1173d4]' : 'text-gray-400 hover:text-[#1173d4]'}`}
        >
          <span className="material-symbols-outlined font-bold">calendar_month</span>
          <span className="text-[10px] font-extrabold uppercase tracking-tighter">My Jobs</span>
        </button>
        
        {/* Botón 2: Material (Abre Modal) */}
        <button 
          onClick={onOpenMaterial}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#1173d4] transition-colors"
        >
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="text-[10px] font-extrabold uppercase tracking-tighter">Material</span>
        </button>
        
        {/* Botón 3: Profile */}
        <button 
          onClick={() => onTabChange("profile")}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-[#1173d4]' : 'text-gray-400 hover:text-[#1173d4]'}`}
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-extrabold uppercase tracking-tighter">Profile</span>
        </button>

      </div>
    </nav>
  )
}