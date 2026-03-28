import { useState, useMemo } from "react"

interface Employee {
  id: number
  firstName: string
  lastName: string
}

interface Props {
  employees: Employee[]
  selected: number[]
  onChange: (ids: number[]) => void
}

export default function EmployeeSelector({
  employees,
  selected,
  onChange,
}: Props) {

  const [search, setSearch] = useState("")

  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
      `${e.firstName} ${e.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [employees, search])

  const toggleEmployee = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter(e => e !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const selectedEmployees = employees.filter(e =>
    selected.includes(e.id)
  )

return (
  <div className="space-y-4">

    {/* Selected Chips */}
    {selectedEmployees.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {selectedEmployees.map(emp => (
          <div
            key={emp.id}
            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {emp.firstName} {emp.lastName}
            <button
              onClick={() => toggleEmployee(emp.id)}
              className="text-xs hover:text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    )}

    {/* Search */}
    <input
      type="text"
      placeholder="Mitarbeiter suchen..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full h-11 px-4 border rounded-xl focus:ring-2 focus:ring-primary"
    />

    {/* Show results ONLY if searching */}
    {search.trim().length > 0 && (
      <div className="max-h-64 overflow-y-auto border rounded-xl divide-y">

        {filteredEmployees.map(emp => {

          const isSelected = selected.includes(emp.id)

          return (
            <div
              key={emp.id}
              onClick={() => toggleEmployee(emp.id)}
              className={`px-4 py-3 cursor-pointer flex justify-between items-center hover:bg-slate-50 transition ${
                isSelected ? "bg-primary/5" : ""
              }`}
            >
              <span>
                {emp.firstName} {emp.lastName}
              </span>

              {isSelected && (
                <span className="text-primary font-bold">✓</span>
              )}
            </div>
          )
        })}

        {filteredEmployees.length === 0 && (
          <div className="p-4 text-sm text-slate-400 text-center">
            Kein Mitarbeiter gefunden
          </div>
        )}

      </div>
    )}

  </div>
)
}