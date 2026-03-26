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

  const handleSubmit = async () => {

    if (!firstName || !lastName || !profession || !email) return

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
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96 space-y-4">

        <h2 className="text-xl font-bold">Neuer Mitarbeiter</h2>

        <div className="grid grid-cols-2 gap-2">
          <input
            className="w-full border p-2 rounded"
            placeholder="Vorname"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            className="w-full border p-2 rounded"
            placeholder="Nachname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <input
          className="w-full border p-2 rounded"
          placeholder="Profession"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="number"
          className="w-full border p-2 rounded"
          placeholder="Stundenlohn"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
        />

        <select
          className="w-full border p-2 rounded"
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
        >
          <option value="HOURLY">Arbeitet auf Stundenbasis</option>
          <option value="FIXED">Fest angestellt</option>
        </select>

        {employmentType === "FIXED" && (
          <input
            type="number"
            className="w-full border p-2 rounded"
            placeholder="Vertragliche Stunden pro Tag"
            value={contractedHoursPerDay}
            onChange={(e) => setContractedHoursPerDay(e.target.value)}
          />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose}>Abbrechen</button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Speichern
          </button>
        </div>

      </div>
    </div>
  )
}