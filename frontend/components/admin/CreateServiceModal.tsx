"use client"

import { useEffect, useMemo, useState } from "react"
import { isEmployeeAssignableOnDate } from "@/lib/employee-availability"

type PricingModel = "TIME" | "FIXED"

type PrefilledClient = {
  id?: number
  clientCode?: string | null
  name?: string | null
  address?: string | null
}

type ClientOption = {
  id: number
  clientCode?: string | null
  name?: string | null
  address?: string | null
}

type EmployeeOption = {
  id: number
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  profession?: string | null
  email?: string | null
  active?: boolean | null
  isActive?: boolean | null
  inactiveReason?: string | null
  inactiveDetails?: string | null
  inactiveSince?: string | Date | null
  inactiveUntil?: string | Date | null
}

type ServiceCode = {
  id: number
  code: string
  description: string
}

interface Props {
  selectedDate?: string
  selectedTime?: string
  prefilledClient?: PrefilledClient | null
  lockClient?: boolean
  onClose: () => void
  onCreated: () => void
}

const WEEK_DAYS = [
  { label: "Mo", value: "MON" },
  { label: "Di", value: "TUE" },
  { label: "Mi", value: "WED" },
  { label: "Do", value: "THU" },
  { label: "Fr", value: "FRI" },
  { label: "Sa", value: "SAT" },
  { label: "So", value: "SUN" },
]

const JS_DAY_TO_CODE = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

function getLocalDateInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatDateLabel(dateString: string) {
  if (!dateString) return ""

  return parseLocalDate(dateString).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function getEmployeeName(employee: EmployeeOption) {
  if (employee.fullName) return employee.fullName

  return [employee.firstName, employee.lastName].filter(Boolean).join(" ")
}

export default function CreateServiceModal({
  selectedDate,
  selectedTime,
  prefilledClient = null,
  lockClient = false,
  onClose,
  onCreated,
}: Props) {
  const initialDate = selectedDate || getLocalDateInputValue()
  const initialTime = selectedTime || "09:00"

  // =========================
  // CLIENT STATES
  // =========================
  const [serviceDate, setServiceDate] = useState(initialDate)
  const [clientCode, setClientCode] = useState(
    prefilledClient?.clientCode || ""
  )
  const [clientName, setClientName] = useState(prefilledClient?.name || "")
  const [address, setAddress] = useState(prefilledClient?.address || "")
  const [suggestions, setSuggestions] = useState<ClientOption[]>([])
  const [selectedClient, setSelectedClient] =
    useState<PrefilledClient | ClientOption | null>(prefilledClient)

  // =========================
  // SERVICE STATES
  // =========================
  const [time, setTime] = useState(initialTime)
  const [billedHours, setBilledHours] = useState<number | "">("")
  const [requiresKey, setRequiresKey] = useState(false)
  const [notes, setNotes] = useState("")
  const [importantNotes, setImportantNotes] = useState("")
  const [serviceCodes, setServiceCodes] = useState<ServiceCode[]>([])
  const [selectedServiceCodeId, setSelectedServiceCodeId] = useState<
    number | null
  >(null)

  // =========================
  // EMPLOYEES
  // =========================
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [loading, setLoading] = useState(false)

  // =========================
  // RECURRENCIA
  // =========================
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceRule, setRecurrenceRule] = useState("WEEKLY")
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [recurrenceEnd, setRecurrenceEnd] = useState("")
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([])

  const [pricingModel, setPricingModel] = useState<PricingModel>("TIME")
  const [travelTime, setTravelTime] = useState(0)
  const [importantNotesScope, setImportantNotesScope] = useState<"THIS" | "ALL">(
    "THIS"
  )

  const selectedEmployeeObjects = useMemo(() => {
    return employees.filter((employee) =>
      selectedEmployees.includes(Number(employee.id))
    )
  }, [employees, selectedEmployees])

  const employeeSuggestions = useMemo(() => {
    const query = employeeSearch.trim().toLowerCase()

    if (!query) return []

    return employees
      .filter((employee) => !selectedEmployees.includes(Number(employee.id)))
      .filter((employee) => isEmployeeAssignableOnDate(employee, serviceDate))
      .filter((employee) => {
        const name = getEmployeeName(employee).toLowerCase()
        const email = employee.email?.toLowerCase() || ""
        const profession = employee.profession?.toLowerCase() || ""

        return (
          name.includes(query) ||
          email.includes(query) ||
          profession.includes(query)
        )
      })
      .slice(0, 8)
  }, [employees, selectedEmployees, employeeSearch, serviceDate])

  useEffect(() => {
    setTime(initialTime)
  }, [initialTime])

  useEffect(() => {
    setServiceDate(initialDate)
  }, [initialDate])

  useEffect(() => {
    if (!prefilledClient) return

    setSelectedClient(prefilledClient)
    setClientCode(prefilledClient.clientCode || "")
    setClientName(prefilledClient.name || "")
    setAddress(prefilledClient.address || "")
    setSuggestions([])
  }, [prefilledClient])

  // Preseleccionar el día correcto de la fecha elegida.
  // No usar new Date("YYYY-MM-DD") porque puede caer en el día anterior por timezone.
  useEffect(() => {
    if (
      isRecurring &&
      recurrenceRule === "WEEKLY" &&
      recurrenceDays.length === 0
    ) {
      const localSelectedDate = parseLocalDate(serviceDate)
      const dayName = JS_DAY_TO_CODE[localSelectedDate.getDay()]

      setRecurrenceDays([dayName])
    }
  }, [isRecurring, recurrenceRule, serviceDate, recurrenceDays.length])

  // Autocomplete por código.
  // Si ya hay cliente seleccionado con ese mismo código, no vuelve a buscar.
  useEffect(() => {
    if (lockClient && selectedClient) return

    if (!clientCode || clientCode.length < 2) return

    if (
      selectedClient?.clientCode &&
      selectedClient.clientCode === clientCode
    ) {
      return
    }

    const fetchByCode = async () => {
      try {
        const res = await fetch(`/api/clients?code=${clientCode}`)

        if (!res.ok) return

        const result = await res.json()

        const client = Array.isArray(result)
          ? result.find((item) => item.clientCode === clientCode) || result[0]
          : result

        if (client && client.name) {
          setSelectedClient(client)
          setClientName(client.name ?? "")
          setAddress(client.address ?? "")
          setSuggestions([])
        }
      } catch (error) {
        console.error("CLIENT CODE SEARCH ERROR:", error)
      }
    }

    const timeout = setTimeout(fetchByCode, 400)
    return () => clearTimeout(timeout)
  }, [clientCode, selectedClient, lockClient])

  // Autocomplete por nombre.
  // Si acabas de seleccionar un cliente, no vuelve a mostrar la lista.
  useEffect(() => {
    if (lockClient && selectedClient) {
      setSuggestions([])
      return
    }

    if (selectedClient?.name && selectedClient.name === clientName) {
      setSuggestions([])
      return
    }

    if (!clientName || clientName.length < 2) {
      setSuggestions([])
      return
    }

    const fetchClients = async () => {
      try {
        const res = await fetch(`/api/clients?search=${clientName}`)

        if (!res.ok) {
          setSuggestions([])
          return
        }

        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("CLIENT SEARCH ERROR:", error)
        setSuggestions([])
      }
    }

    const timeout = setTimeout(fetchClients, 300)
    return () => clearTimeout(timeout)
  }, [clientName, selectedClient, lockClient])

  // Carga de maestros.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, codeRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/service-codes"),
        ])

        const empData = await empRes.json()
        const codeData = await codeRes.json()

        setEmployees(Array.isArray(empData) ? empData : [])
        setServiceCodes(Array.isArray(codeData) ? codeData : [])
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }

    fetchData()
  }, [])

  function handleSelectClient(client: ClientOption) {
    setSelectedClient(client)
    setClientCode(client.clientCode ?? "")
    setClientName(client.name ?? "")
    setAddress(client.address ?? "")
    setSuggestions([])
  }

  function handleToggleRecurrenceDay(dayValue: string) {
    setRecurrenceDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((day) => day !== dayValue)
        : [...prev, dayValue]
    )
  }

  function handleAddEmployee(employee: EmployeeOption) {
    const employeeId = Number(employee.id)

    if (!Number.isInteger(employeeId)) return

    setSelectedEmployees((prev) =>
      prev.includes(employeeId) ? prev : [...prev, employeeId]
    )

    // Importante: deja el campo vacío para buscar el siguiente empleado.
    setEmployeeSearch("")
  }

  function handleRemoveEmployee(employeeId: number) {
    setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId))
  }

  async function handleSubmit() {
    if (
      !clientName ||
      !address ||
      !serviceDate ||
      !time ||
      !billedHours ||
      !selectedServiceCodeId
    ) {
      alert(
        "Bitte alle Pflichtfelder ausfüllen (Kunde, Adresse, Datum, Leistungstyp, Stunden, Uhrzeit)"
      )
      return
    }

    if (isRecurring) {
      if (!recurrenceEnd) {
        alert("Bitte ein Enddatum für die Wiederholung festlegen")
        return
      }

      if (recurrenceRule === "WEEKLY" && recurrenceDays.length === 0) {
        alert("Bitte mindestens einen Wochentag auswählen")
        return
      }
    }

    setLoading(true)

    const employeeCount = selectedEmployees.length || 1
    const calculatedTeamDuration = Number(billedHours) / employeeCount

    const payload = {
      clientId: selectedClient?.id,
      clientCode,
      clientName,
      serviceCodeId: selectedServiceCodeId,
      address,
      date: serviceDate,
      time,
      duration: Number(billedHours),
      billedHours: pricingModel === "FIXED" ? 0 : Number(billedHours),
      teamDuration: calculatedTeamDuration,
      requiresKey,
      employees: selectedEmployees,
      notes,
      importantNotes,
      importantNotesScope,

      isRecurring,
      recurrenceRule: isRecurring ? recurrenceRule : null,
      recurrenceInterval: isRecurring ? recurrenceInterval : null,
      recurrenceEnd: isRecurring ? recurrenceEnd : null,
      recurrenceDays:
        isRecurring && recurrenceRule === "WEEKLY" ? recurrenceDays : [],

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
        const err = await res.json().catch(() => null)
        alert(err?.error || "Fehler beim Erstellen des Auftrags")
      }
    } catch {
      alert("Serverfehler: Bitte versuchen Sie es später erneut")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b bg-slate-50/50 px-8 py-5 dark:border-slate-800 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Neuen Auftrag anlegen
            </h2>

            <p className="text-sm font-medium text-slate-500">
              Geplant für den{" "}
              <span className="font-bold text-blue-600">
                {formatDateLabel(serviceDate)}
              </span>{" "}
              um{" "}
              <span className="font-bold text-blue-600">
                {time}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-xl text-slate-500 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* LEFT */}
            <div className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Kundeninformationen
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                      Code
                    </label>

                    <input
                      disabled={lockClient}
                      placeholder="z.B. 10234"
                      value={clientCode}
                      onChange={(event) => {
                        const value = event.target.value

                        setClientCode(value)

                        if (
                          selectedClient &&
                          selectedClient.clientCode !== value
                        ) {
                          setSelectedClient(null)
                        }
                      }}
                      className="h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div className="relative col-span-2">
                    <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                      Name
                    </label>

                    <input
                      disabled={lockClient}
                      placeholder="Kundenname suchen..."
                      value={clientName}
                      onChange={(event) => {
                        const value = event.target.value

                        setClientName(value)

                        if (selectedClient && selectedClient.name !== value) {
                          setSelectedClient(null)
                        }
                      }}
                      className="h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
                    />

                    {suggestions.length > 0 && !lockClient && (
                      <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                        {suggestions.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => handleSelectClient(client)}
                            className="w-full border-b px-4 py-3 text-left text-sm last:border-0 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-700"
                          >
                            <p className="font-bold">{client.name}</p>
                            <p className="text-xs text-slate-400">
                              {client.clientCode}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedClient && (
                  <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm">
                    <div>
                      <p className="font-black text-blue-700">
                        {selectedClient.name}
                      </p>

                      <p className="text-xs font-bold text-blue-500">
                        Kunde ausgewählt · {selectedClient.clientCode || "Ohne Code"}
                      </p>
                    </div>

                    {!lockClient && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClient(null)
                          setClientCode("")
                          setClientName("")
                          setAddress("")
                          setSuggestions([])
                        }}
                        className="text-xs font-black text-blue-600 hover:text-blue-800"
                      >
                        Ändern
                      </button>
                    )}
                  </div>
                )}

                <div>
                  <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                    Adresse
                  </label>

                  <input
                    placeholder="Einsatzort"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className="h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </section>

              <section className="space-y-4 border-t pt-6 dark:border-slate-800">
                <h3 className="text-center text-xs font-bold uppercase tracking-widest text-blue-600">
                  Abrechnungsmodell
                </h3>

                <div className="flex gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setPricingModel("TIME")}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${pricingModel === "TIME"
                      ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800"
                      : "text-slate-500"
                      }`}
                  >
                    Zeitbasiert (h)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPricingModel("FIXED")}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${pricingModel === "FIXED"
                      ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800"
                      : "text-slate-500"
                      }`}
                  >
                    Pauschal (Fest)
                  </button>
                </div>

                <div>
                  <label className="ml-1 text-[10px] font-bold uppercase text-amber-600">
                    Fahrzeit / Desplazamiento min
                  </label>

                  <input
                    type="number"
                    value={travelTime}
                    onChange={(event) =>
                      setTravelTime(Number(event.target.value))
                    }
                    className="h-11 w-full rounded-xl border border-amber-200 bg-amber-50/30 px-4 text-sm dark:border-amber-900/30 dark:bg-amber-900/10"
                    placeholder="Minutos"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Service-Details
                </h3>

                <div>
                  <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                    Leistungstyp
                  </label>

                  <select
                    value={selectedServiceCodeId ?? ""}
                    onChange={(event) =>
                      setSelectedServiceCodeId(
                        event.target.value ? Number(event.target.value) : null
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="">Service auswählen</option>

                    {serviceCodes.map((code) => (
                      <option key={code.id} value={code.id}>
                        {code.code} – {code.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                      Datum
                    </label>

                    <input
                      type="date"
                      value={serviceDate}
                      onChange={(event) => setServiceDate(event.target.value)}
                      className="h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                      Uhrzeit
                    </label>

                    <input
                      type="time"
                      value={time}
                      onChange={(event) => setTime(event.target.value)}
                      className="h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                      Geplante Dauer
                    </label>

                    <input
                      type="number"
                      step="0.5"
                      placeholder="0.0"
                      value={billedHours}
                      onChange={(event) =>
                        setBilledHours(
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value)
                        )
                      }
                      className="h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT */}
            <div className="space-y-8">
              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Personalzuweisung
                </h3>

                <div className="rounded-2xl border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  {selectedEmployeeObjects.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {selectedEmployeeObjects.map((employee) => {
                        const employeeId = Number(employee.id)

                        return (
                          <span
                            key={employee.id}
                            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs font-black text-white"
                          >
                            {getEmployeeName(employee)}

                            <button
                              type="button"
                              onClick={() => handleRemoveEmployee(employeeId)}
                              className="rounded-full bg-white/20 px-1.5 hover:bg-white/30"
                            >
                              ×
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      value={employeeSearch}
                      onChange={(event) =>
                        setEmployeeSearch(event.target.value)
                      }
                      placeholder="Mitarbeiter suchen und hinzufügen..."
                      className="h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                    />

                    {employeeSuggestions.length > 0 && (
                      <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                        {employeeSuggestions.map((employee) => (
                          <button
                            key={employee.id}
                            type="button"
                            onClick={() => handleAddEmployee(employee)}
                            className="w-full border-b px-4 py-3 text-left text-sm last:border-0 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-700"
                          >
                            <p className="font-black">
                              {getEmployeeName(employee)}
                            </p>

                            <p className="text-xs font-medium text-slate-400">
                              {employee.profession || "Mitarbeiter"}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedEmployeeObjects.length === 0 && (
                    <p className="mt-3 text-xs font-bold text-slate-400">
                      Kein Mitarbeiter ausgewählt. Sie können den Auftrag auch
                      ohne Personal speichern und später zuweisen.
                    </p>
                  )}
                </div>
              </section>

              <section className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/20">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500 p-2">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>

                  <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
                    Schlüssel erforderlich?
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={requiresKey}
                  onChange={(event) => setRequiresKey(event.target.checked)}
                  className="h-6 w-6 rounded-md border-amber-300 text-blue-600 focus:ring-blue-500"
                />
              </section>

              <section className="space-y-4">
                <div>
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-tighter text-rose-600">
                    Wichtige Notizen / Sicherheit / Alarm
                  </label>

                  <textarea
                    value={importantNotes}
                    onChange={(event) =>
                      setImportantNotes(event.target.value)
                    }
                    placeholder="Besonderheiten vor Ort..."
                    className="h-24 w-full resize-none rounded-xl border-2 border-rose-100 bg-rose-50/30 p-4 text-sm outline-none transition-all focus:border-rose-400 focus:ring-0 dark:border-rose-900/30 dark:bg-rose-900/10"
                  />
                  {isRecurring && importantNotes.trim() && (
                    <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">
                        Gültigkeit der wichtigen Notiz
                      </p>

                      <p className="mt-1 text-xs font-bold leading-5 text-amber-800/80">
                        Entscheiden Sie, ob diese wichtige Notiz nur für den ersten Termin oder
                        für die komplette Serie gelten soll.
                      </p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setImportantNotesScope("THIS")}
                          className={`rounded-xl border-2 p-3 text-left transition-all ${importantNotesScope === "THIS"
                              ? "border-amber-500 bg-white text-amber-800 ring-4 ring-amber-500/10"
                              : "border-amber-100 bg-amber-50 text-amber-700"
                            }`}
                        >
                          <span className="block text-sm font-black">
                            Nur diesen Termin
                          </span>

                          <span className="mt-1 block text-xs font-medium text-amber-700/70">
                            Beispiel: Heute Seife mitbringen.
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setImportantNotesScope("ALL")}
                          className={`rounded-xl border-2 p-3 text-left transition-all ${importantNotesScope === "ALL"
                              ? "border-amber-500 bg-white text-amber-800 ring-4 ring-amber-500/10"
                              : "border-amber-100 bg-amber-50 text-amber-700"
                            }`}
                        >
                          <span className="block text-sm font-black">
                            Alle Termine der Serie
                          </span>

                          <span className="mt-1 block text-xs font-medium text-amber-700/70">
                            Beispiel: Immer Schlüssel mitnehmen.
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                    Allgemeine Notizen
                  </label>

                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Zusätzliche Infos..."
                    className="h-24 w-full resize-none rounded-xl border p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </section>

              <section className="space-y-4 border-t pt-6 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">
                    Wiederkehrender Auftrag
                  </span>

                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(event) =>
                      setIsRecurring(event.target.checked)
                    }
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {isRecurring && (
                  <div className="animate-in fade-in slide-in-from-top-1 space-y-4 rounded-xl border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <select
                      value={recurrenceRule}
                      onChange={(event) =>
                        setRecurrenceRule(event.target.value)
                      }
                      className="h-11 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900"
                    >
                      <option value="DAILY">Täglich</option>
                      <option value="WEEKLY">Wöchentlich</option>
                      <option value="BIWEEKLY">Alle 2 Wochen</option>
                      <option value="MONTHLY">Monatlich</option>
                    </select>

                    {recurrenceRule === "WEEKLY" && (
                      <div className="grid grid-cols-7 gap-1">
                        {WEEK_DAYS.map((day) => {
                          const selected = recurrenceDays.includes(day.value)

                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() =>
                                handleToggleRecurrenceDay(day.value)
                              }
                              className={`h-9 rounded-lg border text-[11px] font-bold transition ${selected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "bg-white dark:border-slate-700 dark:bg-slate-800"
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
                        <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                          Intervall
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={recurrenceInterval}
                          onChange={(event) =>
                            setRecurrenceInterval(
                              Math.max(1, Number(event.target.value) || 1)
                            )
                          }
                          className="h-11 w-full rounded-xl border px-4 text-sm dark:bg-slate-900"
                        />
                      </div>

                      <div>
                        <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                          Enddatum
                        </label>

                        <input
                          type="date"
                          value={recurrenceEnd}
                          onChange={(event) =>
                            setRecurrenceEnd(event.target.value)
                          }
                          className="h-11 w-full rounded-xl border px-4 text-sm dark:bg-slate-900"
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
        <div className="flex justify-end gap-3 border-t bg-slate-50 px-8 py-6 dark:border-slate-800 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-xl border px-6 text-sm font-bold transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Abbrechen
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-10 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 disabled:bg-blue-400"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Speichern...
              </>
            ) : (
              "Auftrag anlegen"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}