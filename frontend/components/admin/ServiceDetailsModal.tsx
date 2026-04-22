"use client"

import { useState, useEffect } from "react"

interface Props {
  service: any
  onClose: () => void
  onUpdated?: () => void
}

const formatToLocalDatetime = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export default function ServiceDetailsModal({
  service,
  onClose,
  onUpdated,
}: Props) {
  const [notes, setNotes] = useState(service.notes || "")
  const [importantNotes, setImportantNotes] = useState(service.importantNotes || "")
  const [status, setStatus] = useState(service.status)
  const [loading, setLoading] = useState(false)

  // NUEVOS CAMPOS SEGÚN REUNIÓN
  const [pricingModel, setPricingModel] = useState(service.pricingModel || "TIME")
  const [travelTime, setTravelTime] = useState(service.travelTime || 0)
  const [changeReason, setChangeReason] = useState("") // Requisito legal alemán

  const [actualStartTime, setActualStartTime] = useState<string>(
    formatToLocalDatetime(service.actualStartTime)
  )
  const [actualEndTime, setActualEndTime] = useState<string>(
    formatToLocalDatetime(service.actualEndTime)
  )

  // Detectar si hubo cambios manuales en las horas para pedir justificación
  const [hasTimeChanged, setHasTimeChanged] = useState(false)
  useEffect(() => {
    if (actualStartTime !== formatToLocalDatetime(service.actualStartTime) ||
      actualEndTime !== formatToLocalDatetime(service.actualEndTime)) {
      setHasTimeChanged(true)
    } else {
      setHasTimeChanged(false)
    }
  }, [actualStartTime, actualEndTime, service.actualStartTime, service.actualEndTime])

  const [scope, setScope] = useState<"THIS" | "THIS_AND_FUTURE" | "ALL">("THIS")
  const [showScopeSelector, setShowScopeSelector] = useState(false)
  const [pendingAction, setPendingAction] = useState<"SAVE" | "DELETE" | null>(null)

  const isRecurringService =
    service?.parentServiceId !== null ||
    (service?.childServices && service.childServices.length > 0)

  const statusColors: Record<string, string> = {
    assigned: "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-amber-100 text-amber-700 border-amber-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  }

  const executeAction = async (selectedScope: string) => {
    // Validación legal: Si cambió horas, necesita motivo
    if (hasTimeChanged && !changeReason) {
      alert("Bitte geben Sie einen Grund für die manuelle Zeitänderung an (Gesetzliche Anforderung).");
      return;
    }

    setLoading(true)
    try {
      const isDelete = pendingAction === "DELETE"
      const body = isDelete ? { scope: selectedScope } : {
        notes,
        importantNotes,
        status,
        pricingModel,
        travelTime: Number(travelTime),
        changeReason, // Enviamos el log al backend
        actualStartTime: actualStartTime ? new Date(actualStartTime).toISOString() : null,
        actualEndTime: actualEndTime ? new Date(actualEndTime).toISOString() : null,
        scope: selectedScope,
      };

      const res = await fetch(`/api/services/${service.id}`, {
        method: isDelete ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        onUpdated?.()
        onClose()
      }
    } catch (err) {
      console.error("Action error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (isRecurringService) {
      setPendingAction("SAVE")
      setShowScopeSelector(true)
    } else {
      setPendingAction("SAVE")
      executeAction("THIS")
    }
  }

  const handleDelete = () => {
    if (!confirm("Auftrag wirklich löschen?")) return
    if (isRecurringService) {
      setPendingAction("DELETE")
      setShowScopeSelector(true)
    } else {
      setPendingAction("DELETE")
      executeAction("THIS")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border dark:border-slate-800 transition-all">

        {/* ALERTA DE LLAVE (SCHLÜSSELALARM) */}
        {service.requiresKey && (
          <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center text-2xl">
              🔑
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Achtung: Schlüssel erforderlich</p>
              <p className="text-sm font-bold text-amber-900 leading-tight">
                Dieser Kunde hat einen Schlüssel hinterlegt. Bitte sicherstellen, dass der Mitarbeiter den Schlüssel dabei hat.
              </p>
            </div>
          </div>
        )}


        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-8 py-5 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Auftragsdetails</h2>
            <p className="text-sm text-slate-500 font-medium italic">
              {service.serviceCode?.code} • {service.client?.name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-2xl">×</button>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">

          {/* STATUS Y MODELO DE COBRO */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border dark:border-slate-800">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="assigned">Geplant</option>
                <option value="in_progress">In Arbeit</option>
                <option value="completed">Abgeschlossen</option>
                <option value="cancelled">Storniert</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400">Abrechnungsmodell</label>
              <select value={pricingModel} onChange={(e) => setPricingModel(e.target.value)} className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="TIME">Zeitbasiert (h)</option>
                <option value="FIXED">Pauschal (Festpreis)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-amber-600">Fahrzeit (min)</label>
              <input type="number" value={travelTime} onChange={(e) => setTravelTime(Number(e.target.value))} className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-2 text-sm font-bold shadow-sm" />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* IZQUIERDA: CLIENTE Y PLAN */}
            <div className="space-y-6">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-[10px] font-bold uppercase text-blue-600 tracking-widest">Einsatzort</h4>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{service.client?.name}</p>
                  <p className="text-sm text-slate-500">{service.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Geplantes Datum</p>
                  <p className="text-sm font-bold">{new Date(service.date).toLocaleDateString()}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Soll-Dauer</p>
                  <p className="text-sm font-bold">{service.time} ({service.duration}h)</p>
                </div>
              </div>
            </div>

            {/* DERECHA: TIEMPOS REALES */}
            <div className="space-y-6">
              <div className="p-5 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                <h4 className="text-[10px] font-bold uppercase text-blue-600 tracking-widest">Echtzeit-Erfassung</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Tatsächlicher Start</label>
                    <input type="datetime-local" value={actualStartTime} onChange={(e) => setActualStartTime(e.target.value)} className="w-full h-11 rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Tatsächliches Ende</label>
                    <input type="datetime-local" value={actualEndTime} onChange={(e) => setActualEndTime(e.target.value)} className="w-full h-11 rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                {/* MOTIVO DE CAMBIO (TRAZABILIDAD LEGAL) */}
                {hasTimeChanged && (
                  <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-black text-rose-600 uppercase mb-1 block">Grund der Änderung (Gesetzlich erforderlich)</label>
                    <input
                      placeholder="z.B. Mitarbeiter hat vergessen zu stempeln..."
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      className="w-full h-10 bg-white dark:bg-slate-900 border-2 border-rose-200 rounded-lg px-3 text-xs outline-none focus:border-rose-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NOTAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-slate-800">
            <section className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-rose-600 tracking-widest">Sicherheit / Wichtige Notizen</h4>
              <textarea value={importantNotes} onChange={(e) => setImportantNotes(e.target.value)} className="w-full h-32 p-4 rounded-xl border-2 border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10 text-sm resize-none outline-none focus:border-rose-400" />
            </section>
            <section className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest">Interne Notizen</h4>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-32 p-4 rounded-xl border dark:border-slate-700 dark:bg-slate-900 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500" />
            </section>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="p-6 border-t dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-slate-900/50 gap-4">
          <button onClick={handleDelete} className="text-rose-500 hover:text-rose-700 text-sm font-bold transition-colors">Auftrag löschen</button>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-2.5 border dark:border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Abbrechen</button>
            <button
              onClick={handleSave}
              disabled={loading || (hasTimeChanged && !changeReason)}
              className="flex-1 sm:flex-none px-10 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
            >
              {loading ? "Speichern..." : "Änderungen speichern"}
            </button>
          </div>
        </footer>
      </div>

      {/* MODAL DE SCOPE - Mismo que antes pero en el flujo correcto */}
      {showScopeSelector && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border dark:border-slate-800">
            <h3 className="text-xl font-black mb-2">Änderungsumfang</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Was soll angepasst werden?</p>
            <div className="space-y-3">
              {[{ id: "THIS", t: "Nur diesen Termin", d: "Nur heute" }, { id: "THIS_AND_FUTURE", t: "Ab heute in Zukunft", d: "Diesen und alle folgenden" }, { id: "ALL", t: "Gesamte Serie", d: "Vergangenheit und Zukunft" }].map((o) => (
                <button key={o.id} onClick={() => setScope(o.id as any)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${scope === o.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-4 ring-blue-500/10" : "border-slate-100 dark:border-slate-800"}`}>
                  <p className="text-sm font-bold">{o.t}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{o.d}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowScopeSelector(false)} className="flex-1 py-3 border rounded-xl font-bold text-sm">Abbrechen</button>
              <button onClick={() => executeAction(scope)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">Bestätigen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}