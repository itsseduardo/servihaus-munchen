"use client"

import { useEffect, useState } from "react"
import EmployeeSelector from "./EmployeeSelector"

interface Props {
  selectedDate: string
  selectedTime: string
  onClose: () => void
  onCreated: () => void
}

export default function CreateServiceModal({
  selectedDate,
  selectedTime,
  onClose,
  onCreated,
}: Props) {

  // =========================
  // CLIENT STATES
  // =========================
  const [clientCode, setClientCode] = useState<string>("")
  const [clientName, setClientName] = useState<string>("")
  const [address, setAddress] = useState<string>("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<any | null>(null)

  // =========================
  // SERVICE STATES
  // =========================
  const [time, setTime] = useState(selectedTime)
  const [billedHours, setBilledHours] = useState<number | "">("")
  const [requiresKey, setRequiresKey] = useState(false)
  const [notes, setNotes] = useState("")
  const [importantNotes, setImportantNotes] = useState("")
  const [serviceCodes, setServiceCodes] = useState<any[]>([])
  const [selectedServiceCodeId, setSelectedServiceCodeId] = useState<number | null>(null)

  // =========================
  // EMPLOYEES
  // =========================
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  // =========================
  // RECURRENCIA
  // =========================
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceRule, setRecurrenceRule] = useState<string>("WEEKLY")
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1)
  const [recurrenceEnd, setRecurrenceEnd] = useState<string>("")
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([])

  const [pricingModel, setPricingModel] = useState<"TIME" | "FIXED">("TIME");
  const [travelTime, setTravelTime] = useState<number>(0);

  // MEJORA: Pre-seleccionar el día de la semana de la fecha elegida al activar WEEKLY
  useEffect(() => {
    if (isRecurring && recurrenceRule === "WEEKLY" && recurrenceDays.length === 0) {
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const dayName = days[new Date(selectedDate).getDay()];
      setRecurrenceDays([dayName]);
    }
  }, [isRecurring, recurrenceRule, selectedDate]);

  // Sincronizar tiempo inicial
  useEffect(() => {
    setTime(selectedTime)
  }, [selectedTime])

  // Autocomplete por código
  useEffect(() => {
    if (!clientCode || clientCode.length < 2) return
    const fetchByCode = async () => {
      const res = await fetch(`/api/clients?code=${clientCode}`)
      if (!res.ok) return
      const client = await res.json()
      if (client && client.name) {
        setSelectedClient(client)
        setClientName(client.name ?? "")
        setAddress(client.address ?? "")
      }
    }
    const timeout = setTimeout(fetchByCode, 400)
    return () => clearTimeout(timeout)
  }, [clientCode])

  // Autocomplete por nombre
  useEffect(() => {
    if (!clientName || clientName.length < 2) {
      setSuggestions([])
      return
    }
    const fetchClients = async () => {
      const res = await fetch(`/api/clients?search=${clientName}`)
      const data = await res.json()
      setSuggestions(data)
    }
    const timeout = setTimeout(fetchClients, 300)
    return () => clearTimeout(timeout)
  }, [clientName])

  // Carga de maestros
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, codeRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/service-codes")
        ])
        const empData = await empRes.json()
        const codeData = await codeRes.json()
        setEmployees(empData)
        setServiceCodes(codeData)
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async () => {
    // MEJORA: Validaciones de campos obligatorios
    if (!clientName || !address || !time || !billedHours || !selectedServiceCodeId) {
      alert("Bitte alle Pflichtfelder ausfüllen (Kunde, Adresse, Leistungstyp, Stunden, Uhrzeit)");
      return;
    }

    // MEJORA: Validaciones específicas de recurrencia
    if (isRecurring) {
      if (!recurrenceEnd) {
        alert("Bitte ein Enddatum für die Wiederholung festlegen");
        return;
      }
      if (recurrenceRule === "WEEKLY" && recurrenceDays.length === 0) {
        alert("Bitte mindestens einen Wochentag auswählen");
        return;
      }
    }

    setLoading(true)
    const employeeCount = selectedEmployees.length || 1
    const calculatedTeamDuration = Number(billedHours) / employeeCount

    // MEJORA: Construcción de objeto limpia para el backend
    const payload = {
      clientId: selectedClient?.id,
      clientCode,
      clientName,
      serviceCodeId: selectedServiceCodeId,
      address,
      date: selectedDate,
      time,
      duration: Number(billedHours),
      billedHours: pricingModel === "FIXED" ? 0 : Number(billedHours),
      teamDuration: calculatedTeamDuration,
      requiresKey,
      employees: selectedEmployees,
      notes,
      importantNotes,
      // Recurrencia
      isRecurring,
      recurrenceRule: isRecurring ? recurrenceRule : null,
      recurrenceInterval: isRecurring ? recurrenceInterval : null,
      recurrenceEnd: isRecurring ? recurrenceEnd : null,
      recurrenceDays: (isRecurring && recurrenceRule === "WEEKLY") ? recurrenceDays : [],
      // Nuevos campos
      pricingModel,
      travelTime: Number(travelTime),

    }

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onCreated()
        onClose()
      } else {
        const err = await res.json()
        alert(err.error || "Fehler beim Erstellen des Auftrags")
      }
    } catch (error) {
      alert("Serverfehler: Bitte versuchen Sie es später erneut")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border dark:border-slate-800">

        {/* HEADER */}
        <div className="px-8 py-5 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Neuen Auftrag anlegen</h2>
            <p className="text-sm text-slate-500 font-medium">
              Geplant für den <span className="text-blue-600 font-bold">{new Date(selectedDate).toLocaleDateString()}</span> um <span className="text-blue-600 font-bold">{time}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 text-xl"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* COLUMNA IZQUIERDA: CLIENTE Y SERVICIO */}
            <div className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-blue-600 tracking-widest">Kundeninformationen</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Code</label>
                    <input
                      placeholder="z.B. 10234"
                      value={clientCode ?? ""}
                      onChange={(e) => {
                        setClientCode(e.target.value)
                        setSelectedClient(null)
                      }}
                      className="w-full h-11 rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2 relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Name</label>
                    <input
                      placeholder="Kundenname suchen..."
                      value={clientName ?? ""}
                      onChange={(e) => {
                        setClientName(e.target.value)
                        setSelectedClient(null)
                      }}
                      className="w-full h-11 rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 shadow-xl rounded-xl border dark:border-slate-700 overflow-hidden">
                        {suggestions.map((client) => (
                          <div
                            key={client.id}
                            onClick={() => {
                              setSelectedClient(client)
                              setClientCode(client.clientCode)
                              setClientName(client.name)
                              setAddress(client.address || "")
                              setSuggestions([])
                            }}
                            className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm border-b last:border-0 dark:border-slate-700"
                          >
                            <p className="font-bold">{client.name}</p>
                            <p className="text-xs text-slate-400">{client.clientCode}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Adresse</label>
                  <input
                    placeholder="Einsatzort"
                    value={address ?? ""}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-11 rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </section>

              <section className="space-y-4 border-t dark:border-slate-800 pt-6">
                <h3 className="text-xs font-bold uppercase text-blue-600 tracking-widest text-center">Abrechnungsmodell (Facturación)</h3>

                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPricingModel("TIME")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pricingModel === "TIME" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600" : "text-slate-500"}`}
                  >
                    Zeitbasiert (h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingModel("FIXED")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pricingModel === "FIXED" ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600" : "text-slate-500"}`}
                  >
                    Pauschal (Fest)
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {pricingModel === "TIME" && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Soll-Stunden</label>
                      <input
                        type="number"
                        step="0.5"
                        value={billedHours}
                        onChange={(e) => setBilledHours(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full h-11 rounded-xl border dark:bg-slate-900 px-4 text-sm"
                        placeholder="Ej: 3.5"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 text-amber-600">Fahrzeit (Desplazamiento min)</label>
                    <input
                      type="number"
                      value={travelTime}
                      onChange={(e) => setTravelTime(Number(e.target.value))}
                      className="w-full h-11 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10 px-4 text-sm"
                      placeholder="Minutos"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-blue-600 tracking-widest">Service-Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Leistungstyp</label>
                    <select
                      value={selectedServiceCodeId ?? ""}
                      onChange={(e) => setSelectedServiceCodeId(e.target.value ? Number(e.target.value) : null)}
                      className="w-full h-11 rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    >
                      <option value="">Service auswählen</option>
                      {serviceCodes.map((code) => (
                        <option key={code.id} value={code.id}>
                          {code.code} – {code.description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Soll-Stunden</label>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="0.0"
                        value={billedHours}
                        onChange={(e) => setBilledHours(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full h-11 rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Uhrzeit</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full h-11 rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>



            {/* COLUMNA DERECHA: EMPLEADOS Y NOTAS */}
            <div className="space-y-8">
              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-blue-600 tracking-widest">Personalzuweisung</h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border dark:border-slate-800">
                  <EmployeeSelector
                    employees={employees}
                    selected={selectedEmployees}
                    onChange={setSelectedEmployees}
                  />
                </div>
              </section>

              <section className="flex justify-between items-center bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <span className="font-bold text-sm text-amber-800 dark:text-amber-200">Schlüssel erforderlich?</span>
                </div>
                <input
                  type="checkbox"
                  checked={requiresKey}
                  onChange={(e) => setRequiresKey(e.target.checked)}
                  className="w-6 h-6 rounded-md border-amber-300 text-blue-600 focus:ring-blue-500"
                />
              </section>

              <section className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-rose-600 uppercase ml-1 tracking-tighter">Wichtige Notizen (Sicherheit / Alarm)</label>
                  <textarea
                    value={importantNotes}
                    onChange={(e) => setImportantNotes(e.target.value)}
                    placeholder="Besonderheiten vor Ort..."
                    className="w-full h-24 rounded-xl border-2 border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10 p-4 text-sm resize-none focus:ring-0 focus:border-rose-400 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Allgemeine Notizen</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Zusätzliche Infos..."
                    className="w-full h-24 rounded-xl border dark:border-slate-700 dark:bg-slate-900 p-4 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </section>

              {/* RECURRENCE SECTION */}
              <section className="space-y-4 border-t dark:border-slate-800 pt-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Wiederkehrender Auftrag</span>
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {isRecurring && (
                  <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border dark:border-slate-800 animate-in fade-in slide-in-from-top-1">
                    <select
                      value={recurrenceRule}
                      onChange={(e) => setRecurrenceRule(e.target.value)}
                      className="h-11 rounded-xl border dark:bg-slate-900 px-4 w-full text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DAILY">Täglich</option>
                      <option value="WEEKLY">Wöchentlich</option>
                      <option value="BIWEEKLY">Alle 2 Wochen</option>
                      <option value="MONTHLY">Monatlich</option>
                    </select>

                    {recurrenceRule === "WEEKLY" && (
                      <div className="grid grid-cols-7 gap-1">
                        {[
                          { label: "Mo", value: "MON" },
                          { label: "Di", value: "TUE" },
                          { label: "Mi", value: "WED" },
                          { label: "Do", value: "THU" },
                          { label: "Fr", value: "FRI" },
                          { label: "Sa", value: "SAT" },
                          { label: "So", value: "SUN" },
                        ].map((day) => {
                          const selected = recurrenceDays.includes(day.value)
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => {
                                setRecurrenceDays(selected
                                  ? recurrenceDays.filter((d) => d !== day.value)
                                  : [...recurrenceDays, day.value]
                                )
                              }}
                              className={`h-9 rounded-lg border text-[11px] font-bold transition ${selected
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white dark:bg-slate-800 dark:border-slate-700"
                                }`}
                            >
                              {day.label}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Intervall</label>
                        <input
                          type="number"
                          min="1"
                          value={recurrenceInterval}
                          onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                          className="h-11 rounded-xl border dark:bg-slate-900 px-4 w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Enddatum</label>
                        <input
                          type="date"
                          value={recurrenceEnd}
                          onChange={(e) => setRecurrenceEnd(e.target.value)}
                          className="h-11 rounded-xl border dark:bg-slate-900 px-4 w-full text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 border-t dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-6 h-12 rounded-xl border dark:border-slate-700 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Abbrechen
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Speichern...
              </>
            ) : "Auftrag anlegen"}
          </button>
        </div>

      </div>
    </div>
  )
}