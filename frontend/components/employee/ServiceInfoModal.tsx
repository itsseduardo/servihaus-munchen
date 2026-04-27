"use client"

export default function ServiceInfoModal({ service, onClose }: { service: any, onClose: () => void }) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Cabecera del Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-lg">
              {service.client?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">{service.client?.name}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{service.serviceCode?.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] bg-slate-50">
          
          {/* Dirección */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start">
            <span className="material-symbols-outlined text-blue-500 mt-0.5">location_on</span>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Adresse (Dirección)</p>
              <p className="text-sm font-bold text-slate-800">{service.client?.address || "Keine Adresse angegeben"}</p>
              <p className="text-xs text-slate-500">{service.client?.city}</p>
            </div>
          </div>

          {/* Notas Importantes (Rojo) */}
          {service.importantNotes && (
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex gap-4 items-start">
              <span className="material-symbols-outlined text-rose-500 mt-0.5">warning</span>
              <div>
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Wichtig (Importante)</p>
                <p className="text-sm font-bold text-rose-700 whitespace-pre-wrap">{service.importantNotes}</p>
              </div>
            </div>
          )}

          {/* Notas Generales */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start">
            <span className="material-symbols-outlined text-slate-400 mt-0.5">sticky_note_2</span>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Details (Detalles)</p>
              <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{service.notes || "Keine zusätzlichen Notizen."}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}