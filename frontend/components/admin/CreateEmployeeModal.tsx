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
  const [hourlyRate, setHourlyRate] = useState("")
  const [employmentType, setEmploymentType] = useState("HOURLY")
  const [contractedHoursPerDay, setContractedHoursPerDay] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {

    if (!firstName || !lastName || !profession || !email) return

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
          hourlyRate: hourlyRate ? Number(hourlyRate) : null,
          employmentType,
          contractedHoursPerDay:
            employmentType === "FIXED" && contractedHoursPerDay
              ? Number(contractedHoursPerDay)
              : null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* HEADER */}
        <div className="px-8 py-6 border-b flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Neuer Mitarbeiter
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Erstelle einen neuen Mitarbeiter im System
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* NAME */}
          <div className="grid grid-cols-2 gap-4">
            <input
              className="h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder="Vorname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <input
              className="h-12 rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder="Nachname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <input
            className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition"
            placeholder="Profession"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
          />

          <input
            className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition"
            placeholder="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* EMPLOYMENT TYPE */}
          <select
            className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
          >
            <option value="HOURLY">Stundenbasis</option>
            <option value="FIXED">Fest angestellt</option>
          </select>

          {employmentType === "HOURLY" && (
            <input
              type="number"
              className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder="Stundenlohn (€)"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          )}

          {employmentType === "FIXED" && (
            <input
              type="number"
              className="h-12 w-full rounded-xl border border-slate-200 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder="Vertragliche Stunden pro Tag"
              value={contractedHoursPerDay}
              onChange={(e) => setContractedHoursPerDay(e.target.value)}
            />
          )}

        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 border-t flex justify-end gap-3 bg-slate-50">

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
          >
            Abbrechen
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2 rounded-lg bg-primary text-white shadow hover:shadow-md transition disabled:opacity-50"
          >
            {loading ? "Speichern..." : "Speichern"}
          </button>

        </div>

      </div>

    </div>
  )
}