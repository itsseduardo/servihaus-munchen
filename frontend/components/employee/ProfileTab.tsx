"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"

export default function ProfileTab() {
  const { data: session, status } = useSession()
  
  // Estados para los datos del empleado
  const [employeeData, setEmployeeData] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Estados para el cambio de contraseña
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" })

  // Cargar los datos extra del empleado al montar el componente
  useEffect(() => {
    if (session?.user) {
      fetch("/api/employees/profile")
        .then(res => res.json())
        .then(data => {
          if (!data.error) setEmployeeData(data)
          setIsLoadingProfile(false)
        })
        .catch(err => {
          console.error(err)
          setIsLoadingProfile(false)
        })
    }
  }, [session])

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres." })
      return
    }

    setIsChangingPassword(true)
    setPasswordMessage({ type: "", text: "" })

    try {
      const res = await fetch("/api/employees/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword })
      })

      if (res.ok) {
        setPasswordMessage({ type: "success", text: "Contraseña actualizada correctamente." })
        setNewPassword("")
        setTimeout(() => setShowPasswordForm(false), 3000) // Ocultar el formulario después de 3 segundos
      } else {
        const data = await res.json()
        setPasswordMessage({ type: "error", text: data.error || "Error al cambiar la contraseña." })
      }
    } catch (error) {
      setPasswordMessage({ type: "error", text: "Error de conexión." })
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Mientras carga la sesión o el perfil, mostramos un estado de carga
  if (status === "loading" || isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-64 text-[#1173d4]">
        <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
      </div>
    )
  }

  if (!session?.user) {
    return <div className="text-center p-10 font-bold text-gray-500">No hay sesión activa.</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Tarjeta de Identidad */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col items-center text-center mt-4">
        <div className="w-24 h-24 rounded-full bg-blue-50 border-4 border-white shadow-lg flex items-center justify-center text-[#1173d4] mb-4 overflow-hidden">
          {session.user.image ? (
             <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
             <span className="material-symbols-outlined text-5xl">person</span>
          )}
        </div>
        <h2 className="text-2xl font-black text-slate-900">{session.user.name}</h2>
        
        {/* Mostramos la profesion real que viene de la base de datos */}
        <p className="text-sm font-bold text-[#1173d4] uppercase tracking-widest mt-1">
          {session.user.role === 'ADMIN' ? 'Administrator' : (employeeData?.profession || 'Mitarbeiter')}
        </p>
        
        <span className="mt-3 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold font-mono border border-green-100 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Status: Aktiv
        </span>
      </div>

      {/* 2. Información General */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest">Persönliche Daten</h3>
        </div>
        <div className="divide-y divide-gray-100">
          
          <div className="p-4 flex items-center gap-4">
            <span className="material-symbols-outlined text-gray-400">mail</span>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">E-Mail</p>
              <p className="text-sm font-extrabold text-slate-900">{session.user.email}</p>
            </div>
          </div>

          {employeeData?.phone && (
            <div className="p-4 flex items-center gap-4">
              <span className="material-symbols-outlined text-gray-400">call</span>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Telefon</p>
                <p className="text-sm font-extrabold text-slate-900">{employeeData.phone}</p>
              </div>
            </div>
          )}

          <div className="p-4 flex items-center gap-4">
            <span className="material-symbols-outlined text-gray-400">work</span>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Vertragstyp (Contrato)</p>
              <p className="text-sm font-extrabold text-slate-900">
                {employeeData?.employmentType === 'MINIJOB_603' ? 'Minijob (603€)' : 
                 employeeData?.employmentType === 'MIDIJOB' ? 'Midijob' : 
                 employeeData?.employmentType === 'FULL_TIME' ? 'Vollzeit / Teilzeit' : 'Nicht angegeben'}
              </p>
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-gray-400 mt-0.5">schedule</span>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Soll-Stunden</p>
                <p className="text-sm font-extrabold text-slate-900">{employeeData?.contractedHoursPerWeek || 0}h / Woche</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-gray-400 mt-0.5">flight_takeoff</span>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Urlaubstage</p>
                <p className="text-sm font-extrabold text-slate-900">{employeeData?.vacationDaysPerYear || 0} Tage</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Cambio de Contraseña */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <button 
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-gray-400">lock</span>
            <span className="text-sm font-extrabold text-slate-900">Passwort ändern (Cambiar Contraseña)</span>
          </div>
          <span className="material-symbols-outlined text-gray-400 transition-transform" style={{ transform: showPasswordForm ? 'rotate(180deg)' : 'none' }}>
            expand_more
          </span>
        </button>

        {showPasswordForm && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4 animate-fade-in">
            {passwordMessage.text && (
              <div className={`p-3 rounded-lg text-xs font-bold ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                {passwordMessage.text}
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Neues Passwort (Nueva Contraseña)</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                className="w-full h-11 px-4 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#1173d4] outline-none mt-1"
              />
            </div>
            <button 
              onClick={handlePasswordChange}
              disabled={isChangingPassword || newPassword.length < 6}
              className="w-full h-11 bg-[#1173d4] text-white rounded-xl text-xs font-extrabold uppercase tracking-widest disabled:opacity-50 transition-colors"
            >
              {isChangingPassword ? 'Speichern...' : 'Speichern (Guardar)'}
            </button>
          </div>
        )}
      </div>

      {/* 4. Botón de Cerrar Sesión */}
      <div className="pt-2 pb-8">
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full py-4 bg-white border-2 border-red-100 text-red-600 rounded-xl font-extrabold uppercase text-xs tracking-widest hover:bg-red-50 active:scale-95 transition-all flex justify-center items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined">logout</span>
          Abmelden (Cerrar Sesión)
        </button>
      </div>

    </div>
  )
}