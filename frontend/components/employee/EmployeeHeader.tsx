"use client"

import { useSession } from "next-auth/react"

interface Props {
  tasksCount: number
  activeTab: "today" | "history"
  onTabChange: (tab: "today" | "history") => void
}

export default function EmployeeHeader({ tasksCount, activeTab, onTabChange }: Props) {
  // 1. Traemos la sesión real
  const { data: session } = useSession()

  // 2. Extraemos el nombre o ponemos un fallback
  const userName = session?.user?.name || "Mitarbeiter"

  // 3. Generamos las iniciales (Ej: "Juan Perez" -> "JP")
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((name: string) => name[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()
    
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[#1173d4]">
          <span className="material-symbols-outlined text-3xl font-bold">home_repair_service</span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">ServiHaus</h1>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {/* AQUÍ ESTABA EL HARDCODE, AHORA ES DINÁMICO */}
          <h2 className="text-2xl font-extrabold text-slate-900">{userName}</h2>
          <p className="text-[#1173d4] font-bold text-sm">
            {tasksCount} Jobs Heute
          </p>
        </div>

        {/* INICIALES DINÁMICAS */}
        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-slate-600">
          {initials}
        </div>
      </div>

      {/* TABS (Se mantienen igual) */}
      <div className="flex border-b border-gray-100 mt-6 gap-6">
        <button
          onClick={() => onTabChange("today")}
          className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 w-1/2 transition-colors ${activeTab === 'today' ? 'border-[#1173d4] text-[#1173d4]' : 'border-transparent text-gray-500'}`}
        >
          <p className="text-sm font-bold tracking-wide">Heute (Jobs)</p>
        </button>
        <button
          onClick={() => onTabChange("history")}
          className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 w-1/2 transition-colors ${activeTab === 'history' ? 'border-[#1173d4] text-[#1173d4]' : 'border-transparent text-gray-500'}`}
        >
          <p className="text-sm font-bold tracking-wide">Historie (KPIs)</p>
        </button>
      </div>
    </header>
  )
}