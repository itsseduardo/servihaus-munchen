"use client"

import { useState } from "react"

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function CreateEmployeeModal({
  onClose,
  onCreated,
}: Props) {

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [profession, setProfession] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  
  // NUEVO: El estado para la contraseña
  const [password, setPassword] = useState("") 

  const [hourlyRate, setHourlyRate] = useState("")
  const [employmentType, setEmploymentType] = useState("MINIJOB_538")
  const [contractedHoursPerWeek, setContractedHoursPerWeek] = useState("")
  const [vacationDaysPerYear, setVacationDaysPerYear] = useState("20")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    // Validamos que la contraseña también esté presente
    if (!firstName || !lastName || !profession || !email || !password) return

    try {
      setLoading(true)

      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          profession,
          email,
          phone,
          password, // NUEVO: Enviamos la contraseña al backend
          hourlyRate: hourlyRate ? Number(hourlyRate) : null,
          employmentType,
          contractedHoursPerWeek: contractedHoursPerWeek ? Number(contractedHoursPerWeek) : null,
          vacationDaysPerYear: Number(vacationDaysPerYear),
        }),
      })

      if (!res.ok) {
        console.error("Failed to create employee")
        return
      }

      onCreated()
      onClose()

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border dark:border-slate-800">

        {/* HEADER */}
        <div className="px-8 py-6 border-b dark:border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Neuer Mitarbeiter
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Gesetzliche Vertragskonfiguration & Systemzugang
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* DATOS PERSONALES */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Vorname</label>
              <input className="h-11 w-full rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nachname</label>
              <input className="h-11 w-full rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email (Login)</label>
              <input type="email" className="h-11 w-full rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Telefon</label>
              <input className="h-11 w-full rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          {/* NUEVO: ZONA DE CONTRASEÑA */}
          <div className="grid grid-cols-2 gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
             <div className="space-y-1">
              <label className="text-[10px] font-bold text-blue-600 uppercase ml-1">Start-Passwort</label>
              <input type="text" placeholder="z.B. Servihaus2026!" className="h-11 w-full rounded-xl border border-blue-200 dark:border-blue-800 dark:bg-slate-900 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Profession / Rolle</label>
              <input className="h-11 w-full rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-600" value={profession} onChange={(e) => setProfession(e.target.value)} />
            </div>
          </div>

          <hr className="dark:border-slate-800" />

          {/* CONFIGURACIÓN LABORAL (LÓGICA JOSÉ) */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Vertragsdetails</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Vertragstyp</label>
                <select className="h-11 w-full rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
                  <option value="MINIJOB_603">Minijob (603€)</option>
                  <option value="MIDIJOB">Midijob</option>
                  <option value="FULL_TIME">Vollzeit / Teilzeit</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Stundenlohn (€)</label>
                <input type="number" step="0.5" className="h-11 w-full rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 text-blue-600">Soll-Stunden (Woche)</label>
                <input type="number" step="0.5" className="h-11 w-full rounded-xl border-2 border-blue-100 dark:border-blue-900/30 dark:bg-slate-900 px-4 text-sm font-bold outline-none focus:border-blue-500" placeholder="z.B. 20" value={contractedHoursPerWeek} onChange={(e) => setContractedHoursPerWeek(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Urlaubstage (Jahr)</label>
                <input type="number" className="h-11 w-full rounded-xl border dark:border-slate-700 dark:bg-slate-900 px-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none" value={vacationDaysPerYear} onChange={(e) => setVacationDaysPerYear(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 border-t dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border dark:border-slate-700 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            Abbrechen
          </button>
          <button onClick={handleSubmit} disabled={loading || !password} className="px-10 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50 active:scale-95">
            {loading ? "Speichern..." : "Mitarbeiter anlegen"}
          </button>
        </div>

      </div>
    </div>
  )
}