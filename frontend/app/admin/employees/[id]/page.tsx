"use client"

import { useEffect, useMemo, useState } from "react"
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

  const typeBadge =
    employee?.employmentType === "HOURLY"
      ? "bg-blue-100 text-blue-800"
      : "bg-emerald-100 text-emerald-800"

  const statusStyles: Record<string, string> = {
    assigned: "bg-gray-100 text-gray-700",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const stats = useMemo(() => {
    if (!employee) return { services: 0 }

    return {
      services: employee.assignments.length
    }
  }, [employee])

  if (loading) return <div className="p-10">Loading...</div>
  if (!employee) return <div className="p-10">Not found</div>

  return (
    <div className="p-10 space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-start">

        <div>
          <h1 className="text-4xl font-black tracking-tight">
            {employee.firstName} {employee.lastName}
          </h1>

          <p className="text-slate-500 mt-2 font-medium">
            {employee.profession}
          </p>

          <div className="flex items-center gap-4 mt-4">

            <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeBadge}`}>
              {employee.employmentType === "HOURLY"
                ? "Stundenbasis"
                : `Fest angestellt (${employee.contractedHoursPerDay ?? 0} Std/Tag)`
              }
            </span>

            {employee.hourlyRate && (
              <span className="text-slate-600 text-sm">
                {employee.hourlyRate.toFixed(2)} € / Stunde
              </span>
            )}

          </div>
        </div>

      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Gearbeitete Stunden
          </p>
          <p className="text-3xl font-black mt-2">
            {employee.totalWorkedHours?.toFixed(1) ?? 0} h
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Bezahlte Stunden
          </p>
          <p className="text-3xl font-black mt-2">
            {employee.totalPaidHours?.toFixed(1) ?? 0} h
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Stundenlohn
          </p>
          <p className="text-3xl font-black mt-2">
            {employee.hourlyRate ?? 0} €
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">
            Gesamt verdient
          </p>
          <p className="text-3xl font-black mt-2 text-primary">
            {(employee.totalEarnings ?? 0).toFixed(2)} €
          </p>
        </div>

      </div>

      {/* SERVICE HISTORY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-8 py-6 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">
            Service-Historie
          </h2>

          <span className="text-sm text-slate-500">
            {stats.services} Einträge
          </span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
              <th className="px-8 py-4 text-left">Datum</th>
              <th className="px-8 py-4 text-left">Service</th>
              <th className="px-8 py-4 text-left">Gearbeitete Zeit</th>
              <th className="px-8 py-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {employee.assignments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-8 text-center text-slate-500">
                  Keine Services vorhanden
                </td>
              </tr>
            )}

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
                <tr
                  key={a.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >

                  <td className="px-8 py-5">
                    {new Date(a.service.date).toLocaleDateString()}
                  </td>

                  <td className="px-8 py-5 font-medium">
                    {a.service.serviceCode
                      ? `${a.service.serviceCode.code} - ${a.service.serviceCode.description}`
                      : "-"}
                  </td>

                  <td className="px-8 py-5">
                    {workedHours.toFixed(1)} h
                  </td>

                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      statusStyles[a.service.status] ?? "bg-gray-100 text-gray-700"
                    }`}>
                      {a.service.status}
                    </span>
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