"use client"

import { useState, useEffect } from "react"
import ClientOnboardingModal from "@/components/client/ClientOnboardingModal"

export default function ClientDashboardPage() {
  const [clientData, setClientData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [extraAdded, setExtraAdded] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setClientData({
        firstName: "Familia",
        lastName: "Müller",
        name: "Familia Müller",
        phone: "+49 176 12345678",
        address: "Hauptstraße 12",
        hasCompletedOnboarding: true, 
        nextService: {
          date: "15. Mai",
          day: "Mittwoch",
          time: "09:00 - 12:00",
          type: "Unterhaltsreinigung",
          staff: "Maria S. & Team",
          status: "confirmed"
          // Eliminado el basePrice
        },
        stats: {
          totalServices: 24,
          pendingInvoices: 1,
          loyaltyPoints: 450
        },
        // Recomendación sin precio, enfocada puramente en el servicio
        recommendation: {
          title: "Dampfdesinfektion",
          reason: "Basierend auf Ihrer letzten Nutzung (vor 3 Monaten)",
          icon: "sanitizer"
        }
      })
      setLoading(false)
    }, 800)
  }, [])

  if (loading) return (
    <div className="p-8 flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )

  if (clientData && !clientData.hasCompletedOnboarding) {
    return <ClientOnboardingModal initialData={{...clientData, postalCode: "", city: ""}} onComplete={() => {}} />
  }

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* 1. BIENVENIDA Y BOTÓN RÁPIDO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Willkommen, <span className="text-blue-600">{clientData.name}</span>!
          </h1>
          <p className="text-slate-500 font-medium">Schön, Sie wiederzusehen. Hier ist Ihre Übersicht.</p>
        </div>
        
        <button className="px-5 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-600/20">
          <span className="material-symbols-outlined text-lg">bolt</span>
          Schnellbuchung (Neue Reinigung)
        </button>
      </div>

      {/* 2. TARJETA DEL PRÓXIMO SERVICIO CON UP-SELLING */}
      <section>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Nächster Termin</p>
        
        <div className="relative group overflow-hidden bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-blue-100/50 flex flex-col md:flex-row items-stretch">
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-12 text-white flex flex-col justify-center items-center md:items-start text-center md:text-left shrink-0 min-w-[280px]">
            <p className="text-blue-100 font-black uppercase tracking-widest text-xs mb-2">
              {clientData.nextService.day}
            </p>
            <h2 className="text-6xl font-black tracking-tighter">
              {clientData.nextService.date}
            </h2>
            <div className="mt-4 flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span className="font-bold text-sm">{clientData.nextService.time} Uhr</span>
            </div>
          </div>

          <div className="p-8 md:p-10 flex-1 flex flex-col justify-between gap-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                  {clientData.nextService.type}
                </h3>
                <p className="text-slate-400 font-medium mt-1">Ihr Zuhause wird wieder glänzen.</p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Bestätigt
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                <span className="material-symbols-outlined">group</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Zugeordnetes Personal</p>
                <p className="font-bold text-slate-700">{clientData.nextService.staff}</p>
              </div>
            </div>

            {/*  EL CUADRADITO DE RECOMENDACIÓN (Sin Precio) */}
            {!extraAdded ? (
              <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{clientData.recommendation.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-800 text-sm">{clientData.recommendation.title}</p>
                      <span className="px-2 py-0.5 bg-amber-200/50 text-amber-700 text-[9px] font-black uppercase rounded">Empfehlung</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{clientData.recommendation.reason}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setExtraAdded(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white border border-amber-200 text-amber-700 rounded-xl text-xs font-black hover:bg-amber-100 transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Hinzufügen
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
                  <div>
                    <p className="font-black text-emerald-800 text-sm">{clientData.recommendation.title} zur Anfrage hinzugefügt!</p>
                    <p className="text-xs font-medium text-emerald-600">Wir bereiten alles für Ihren Termin vor.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setExtraAdded(false)}
                  className="text-emerald-600 hover:text-emerald-800 text-xs font-bold underline"
                >
                  Rückgängig
                </button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all">
                Termin verschieben
              </button>
              <button className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">playlist_add</span>
                Weitere Extras
              </button>
              <button className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-black transition-all shadow-lg" title="Support kontaktieren">
                <span className="material-symbols-outlined">support_agent</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. RESUMEN DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">cleaning_services</span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{clientData.stats.totalServices}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Services gesamt</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">event_available</span>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">Aktive</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Planung</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2rem] text-white flex items-center gap-4 shadow-xl shadow-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center border border-white/10">
            <span className="material-symbols-outlined text-3xl font-fill">star</span>
          </div>
          <div>
            <p className="text-2xl font-black">{clientData.stats.loyaltyPoints}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Treuepunkte</p>
          </div>
        </div>
      </div>
    </div>
  )
}