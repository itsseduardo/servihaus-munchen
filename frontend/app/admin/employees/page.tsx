"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CreateEmployeeModal from "@/components/admin/CreateEmployeeModal"

interface Employee {
  id: number
  name: string
  profession: string
  email: string
  phone: string | null
  hourlyRate: number | null
}

export default function AdminEmployeesPage() {

  const router = useRouter()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchEmployees = async () => {
  try {
    const res = await fetch("/api/employees")
    const data = await res.json()

    if (Array.isArray(data)) {
      setEmployees(data)
    } else {
      console.error("Employees API did not return array:", data)
      setEmployees([])
    }

  } catch (error) {
    console.error("Failed to fetch employees", error)
    setEmployees([])
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleCreated = async () => {
    await fetchEmployees()
    router.refresh()
  }

  if (loading) {
    return (
      <div className="p-8">
        <p>Loading employees...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mitarbeiterverwaltung</h1>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Neuer Mitarbeiter
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 text-sm font-semibold">Name</th>
              <th className="p-4 text-sm font-semibold">Profession</th>
              <th className="p-4 text-sm font-semibold">Email</th>
              <th className="p-4 text-sm font-semibold">Phone</th>
              <th className="p-4 text-sm font-semibold">Hourly Rate</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  router.push(`/admin/employees/${employee.id}`)
                }
              >
                <td className="p-4">{employee.name}</td>
                <td className="p-4">{employee.profession}</td>
                <td className="p-4">{employee.email}</td>
                <td className="p-4">{employee.phone || "-"}</td>
                <td className="p-4">
                  {employee.hourlyRate != null
                    ? `${employee.hourlyRate.toFixed(2)} €`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <CreateEmployeeModal
          onClose={() => setIsOpen(false)}
          onCreated={handleCreated}
        />
      )}

    </div>
  )
}