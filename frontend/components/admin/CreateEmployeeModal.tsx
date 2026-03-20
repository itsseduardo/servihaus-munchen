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

  const [name, setName] = useState("")
  const [profession, setProfession] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")

  const handleSubmit = async () => {

    if (!name || !profession || !email) return

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        profession,
        email,
        phone,
        hourlyRate: Number(hourlyRate)
      })
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
      <div className="bg-white p-6 rounded-xl w-100 space-y-4">

        <h2 className="text-xl font-bold">Neuer Mitarbeiter</h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          placeholder="Hourly Rate"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
        />

        <div className="flex justify-end gap-2">
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