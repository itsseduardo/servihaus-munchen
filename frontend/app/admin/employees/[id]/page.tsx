"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function EmployeeDetailPage() {

  const params = useParams()
  const id = params.id

  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) fetchEmployee()
  }, [id])

  const fetchEmployee = async () => {
    try {
      const res = await fetch(`/api/employees/${id}`)
      const data = await res.json()
      setEmployee(data)
    } catch (error) {
      console.error("Failed to fetch employee", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!employee) return <div className="p-8">Not found</div>

  
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h1 className="text-3xl font-black">
          {employee.firstName} {employee.lastName}
        </h1>

        <p className="text-slate-500 font-medium">
          {employee.profession}
        </p>

        <div className="mt-2 text-sm text-slate-500">
          {employee.employmentType === "HOURLY"
            ? "Stundenbasis"
            : `Fest angestellt (${employee.contractedHoursPerDay ?? 0} Std/Tag)`
          }
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">
            Gearbeitete Stunden
          </p>
          <p className="text-2xl font-black">
            {employee.totalWorkedHours?.toFixed(1) ?? 0} h
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">
            Stundenlohn
          </p>
          <p className="text-2xl font-black">
            {employee.hourlyRate ?? 0} €
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
              <th className="px-6 py-3 text-xs font-bold uppercase">Gearbeitete Zeit</th>
              <th className="px-6 py-3 text-xs font-bold uppercase">Status</th>
            </tr>
          </thead>

          <tbody>
            {employee.assignments.map((a: any) => {
              let workedHours = 0

              if (a.service.status === "completed") {
                if (a.service.actualStartTime && a.service.actualEndTime) {
                  const start = new Date(a.service.actualStartTime)
                  const end = new Date(a.service.actualEndTime)

                  workedHours =
                    (end.getTime() - start.getTime()) /
                    (1000 * 60 * 60)
                } else if (a.service.duration) {
                  workedHours = a.service.duration
                }
              }

              return (
                <tr key={a.id} className="border-b hover:bg-slate-50">

                  <td className="px-6 py-4">
                    {new Date(a.service.date).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    {a.service.serviceCode
                      ? `${a.service.serviceCode.code} - ${a.service.serviceCode.description}`
                      : "-"}
                  </td>

                  <td className="px-6 py-4">
                    {workedHours} h
                  </td>

                  <td className="px-6 py-4">
                    {a.service.status}
                  </td>

                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}