"use client"

import { useState, useEffect } from "react"
import EmployeeHeader from "@/components/employee/EmployeeHeader"
import TaskCard from "@/components/employee/TaskCard"
import OvertimeModal from "@/components/employee/OvertimeModal"
import BottomNav from "@/components/employee/BottomNav"
import MaterialModal from "@/components/employee/MaterialModal"
import ProfileTab from "@/components/employee/ProfileTab"

export default function EmployeeDashboardPage() {
  // Navegación
  const [activeTab, setActiveTab] = useState<"today" | "history" | "profile">("today")
  
  // Datos
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Control de Modales
  const [taskNeedingOvertime, setTaskNeedingOvertime] = useState<any>(null)
  const [showMaterialModal, setShowMaterialModal] = useState(false)

  // Carga de Datos Real desde la Base de Datos
  useEffect(() => {
    const fetchTodayTasks = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/employees/tasks')
        if (res.ok) {
          const data = await res.json()
          setTasks(data)
        } else {
          console.error("Error al cargar las tareas")
        }
      } catch (error) {
        console.error("Error de conexión:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Solo cargamos los datos si estamos en la pestaña principal para no saturar el servidor
    if (activeTab === "today") {
      fetchTodayTasks()
    }
  }, [activeTab])

  // Esta función actualiza el estado local cuando la tarjeta o el modal cambian algo
  const handleTaskUpdate = (updatedTask: any) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
    setTaskNeedingOvertime(null) 
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#f6f7f8] flex flex-col relative shadow-2xl font-sans">
      
      {activeTab !== "profile" && (
        <EmployeeHeader 
          tasksCount={tasks.filter(t => t.status !== 'completed').length} 
          activeTab={activeTab === "history" ? "history" : "today"} 
          onTabChange={(tab) => setActiveTab(tab)} 
        />
      )}

      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-28">
        
        {activeTab === "today" && (
          isLoading ? (
            <div className="flex justify-center items-center h-32 text-[#1173d4]">
              <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-3">
              <span className="material-symbols-outlined text-5xl">task</span>
              <p className="font-bold text-sm tracking-widest uppercase text-center">
                Keine Jobs für heute<br/>
                <span className="text-[10px]">(No hay trabajos asignados hoy)</span>
              </p>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onOvertimeTriggered={setTaskNeedingOvertime} 
                onStatusUpdated={handleTaskUpdate} 
              />
            ))
          )
        )}

        {activeTab === "history" && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 space-y-4">
            <span className="material-symbols-outlined text-4xl">construction</span>
            <p className="font-bold text-sm tracking-widest uppercase">Historie in Arbeit</p>
          </div>
        )}

        {activeTab === "profile" && (
          <ProfileTab />
        )}

      </main>

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onOpenMaterial={() => setShowMaterialModal(true)} 
      />

      {taskNeedingOvertime && (
        <OvertimeModal 
          task={taskNeedingOvertime} 
          onClose={() => setTaskNeedingOvertime(null)} 
          onSuccess={handleTaskUpdate} 
        />
      )}

      {showMaterialModal && (
        <MaterialModal 
          tasks={tasks} 
          onClose={() => setShowMaterialModal(false)} 
        />
      )}

    </div>
  )
}