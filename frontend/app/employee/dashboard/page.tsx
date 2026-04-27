"use client"

import { useState, useEffect } from "react"
import TaskCard from "@/components/employee/TaskCard"
import OvertimeModal from "@/components/employee/OvertimeModal"
import BottomNav from "@/components/employee/BottomNav"
import MaterialModal from "@/components/employee/MaterialModal"
import TimeTracker from "@/components/employee/TimeTracker"
import ServiceInfoModal from "@/components/employee/ServiceInfoModal"
import ProfileTab from "@/components/employee/ProfileTab"

export default function EmployeeDashboardPage() {
  const [bottomTab, setBottomTab] = useState<"home" | "profile">("home")
  const [dateFilter, setDateFilter] = useState<"today" | "tomorrow" | "history">("today")
  
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isShiftActive, setIsShiftActive] = useState(false)
  
  //  NUEVO: Estado para el nombre del empleado
  const [employeeName, setEmployeeName] = useState<string>("")
  
  const [taskNeedingOvertime, setTaskNeedingOvertime] = useState<any>(null)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [selectedServiceInfo, setSelectedServiceInfo] = useState<any>(null)

  // Carga de datos de Tareas y Perfil
  useEffect(() => {
    // Buscar el nombre del empleado
    fetch('/api/employees/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.firstName) setEmployeeName(data.firstName)
      })
      .catch(err => console.error(err))

    // Buscar las tareas
    const fetchTasks = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/employees/tasks?filter=${dateFilter}`)
        if (res.ok) {
          const data = await res.json()
          setTasks(data)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (bottomTab === "home") fetchTasks()
  }, [dateFilter, bottomTab])

  const handleTaskUpdate = (updatedTask: any) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
    setTaskNeedingOvertime(null) 
  }

  const currentBottomActive = bottomTab === "profile" ? "profile" : (dateFilter === "history" ? "history" : "today");

  // LÓGICA DE SALUDO DINÁMICO
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Guten Morgen"
    if (hour < 18) return "Guten Tag"
    if (hour < 22) return "Guten Abend"
    return "Gute Nacht"
  }

  // LÓGICA DE FECHA FORMATEADA
  const currentDate = new Date().toLocaleDateString('de-DE', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'long' 
  })

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#f8fafc] flex flex-col relative shadow-2xl font-sans">
      
      {bottomTab === "home" ? (
        <>
          {/* HEADER REDISEÑADO */}
          <header className="bg-white px-6 pt-10 pb-5 rounded-b-[2rem] shadow-sm z-10 relative overflow-hidden border-b border-slate-100">
            {/* Efecto de brillo de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10"></div>

            {/* TOP BAR: Logo + Fecha */}
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                  <span className="material-symbols-outlined text-white text-[18px]">cleaning_services</span>
                </div>
                <span className="font-black text-xl tracking-tighter text-slate-900">SERVIHAUS</span>
              </div>
              <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{currentDate}</p>
              </div>
            </div>

            {/* SALUDO DINÁMICO */}
            <div className="relative z-10 mb-6">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {getGreeting()}, <br/>
                <span className="text-blue-600">{employeeName || "Team"}</span>!
              </h1>
              <p className="text-sm font-bold text-slate-400 mt-1">Hier sind deine Aufgaben für heute.</p>
            </div>

            {/* PÍLDORAS DE NAVEGACIÓN */}
            <div className="flex bg-slate-100 p-1 rounded-2xl w-full relative z-10">
              <button 
                onClick={() => setDateFilter("today")}
                className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all ${dateFilter === "today" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
              >
                Heute
              </button>
              <button 
                onClick={() => setDateFilter("tomorrow")}
                className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all ${dateFilter === "tomorrow" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
              >
                Morgen
              </button>
              <button 
                onClick={() => setDateFilter("history")}
                className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all ${dateFilter === "history" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
              >
                Historie
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-6 pb-28 space-y-6">
            
            {dateFilter === "today" && (
              <TimeTracker onShiftChange={setIsShiftActive} />
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-32 text-blue-500">
                <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-300 space-y-3">
                <span className="material-symbols-outlined text-5xl">task</span>
                <p className="font-bold text-xs tracking-widest uppercase text-center">Keine Aufgaben</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`space-y-4 transition-all duration-300 ${!isShiftActive && dateFilter === "today" ? "opacity-40 pointer-events-none grayscale-[50%]" : ""}`}>
                  {tasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onOvertimeTriggered={setTaskNeedingOvertime} 
                      onStatusUpdated={handleTaskUpdate}
                      onOpenInfo={() => setSelectedServiceInfo(task)} 
                    />
                  ))}
                </div>
                
                {!isShiftActive && dateFilter === "today" && (
                  <div className="bg-orange-50 border border-orange-200 text-orange-600 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                    <span className="material-symbols-outlined text-2xl">lock_clock</span>
                    <p className="text-xs font-bold leading-tight">
                      Starte deine Schicht, um die Aufgaben zu sehen.
                    </p>
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      ) : (
        <main className="flex-1 overflow-y-auto px-4 py-6 pb-28">
          <ProfileTab />
        </main>
      )}

      <BottomNav 
        activeTab={currentBottomActive as any} 
        onTabChange={(tab) => {
          if (tab === "profile") {
            setBottomTab("profile");
          } else if (tab === "history") {
            setBottomTab("home");
            setDateFilter("history");
          } else {
            setBottomTab("home");
            setDateFilter("today");
          }
        }} 
        onOpenMaterial={() => setShowMaterialModal(true)} 
      />

      {taskNeedingOvertime && <OvertimeModal task={taskNeedingOvertime} onClose={() => setTaskNeedingOvertime(null)} onSuccess={handleTaskUpdate} />}
      {showMaterialModal && <MaterialModal tasks={tasks} onClose={() => setShowMaterialModal(false)} />}
      {selectedServiceInfo && <ServiceInfoModal service={selectedServiceInfo} onClose={() => setSelectedServiceInfo(null)} />}

    </div>
  )
}