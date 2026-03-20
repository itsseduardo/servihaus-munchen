"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function EmployeeDetailPage() {

  const { id } = useParams()
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployee()
  }, [])

  const fetchEmployee = async () => {
    const res = await fetch(`/api/employees/${id}`)
    const data = await res.json()
    setEmployee(data)
    setLoading(false)
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!employee) return <div className="p-8">Not found</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h1 className="text-3xl font-black">
          {employee.name}
        </h1>
        <p className="text-slate-500 font-medium">
          {employee.profession}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">
            Gesamte Stunden
          </p>
          <p className="text-2xl font-black">
            {employee.totalHours.toFixed(1)} h
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">
            Stundenlohn
          </p>
          <p className="text-2xl font-black">
            {employee.hourlyRate || 0} €
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">
            Gesamt verdient
          </p>
          <p className="text-2xl font-black text-primary">
            {(employee.totalEarnings ?? 0).toFixed(2)} €
          </p>
        </div>

      </div>

      {/* SERVICES TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-6 py-3 text-xs font-bold uppercase">Datum</th>
              <th className="px-6 py-3 text-xs font-bold uppercase">Service</th>
              <th className="px-6 py-3 text-xs font-bold uppercase">Dauer</th>
              <th className="px-6 py-3 text-xs font-bold uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {employee.assignments.map((a: any) => (
              <tr key={a.id} className="border-b hover:bg-slate-50">
                <td className="px-6 py-4">
                  {new Date(a.service.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {a.service.serviceType}
                </td>
                <td className="px-6 py-4">
                  {a.service.duration || 0} h
                </td>
                <td className="px-6 py-4">
                  {a.service.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}