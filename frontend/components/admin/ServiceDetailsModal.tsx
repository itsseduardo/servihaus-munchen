"use client"

import { useEffect, useState } from "react"

interface Props {
  service: any
  onClose: () => void
  onUpdated?: () => void
}

type Scope = "THIS" | "THIS_AND_FUTURE" | "ALL"
type PendingAction = "SAVE" | "DELETE"

const formatToLocalDatetime = (dateString?: string | Date | null) => {
  if (!dateString) return ""

  const date = new Date(dateString)
  const offset = date.getTimezoneOffset() * 60000

  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

const formatToDateInput = (dateString?: string | Date | null) => {
  if (!dateString) return ""

  const date = new Date(dateString)
  const offset = date.getTimezoneOffset() * 60000

  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

const formatToTimeInput = (dateString?: string | Date | null) => {
  if (!dateString) return ""

  const date = new Date(dateString)
  const offset = date.getTimezoneOffset() * 60000

  return new Date(date.getTime() - offset).toISOString().slice(11, 16)
}

function buildDateTime(date: string, time: string) {
  if (!date) return null

  const safeTime = time || "00:00"

  return new Date(`${date}T${safeTime}:00`).toISOString()
}

function getAssignmentEmployeeIds(service: any) {
  return (
    service.assignments
      ?.map((assignment: any) =>
        Number(assignment.employeeId ?? assignment.employee?.id)
      )
      .filter((id: number) => Number.isInteger(id)) || []
  )
}

function getEmployeeName(employee: any) {
  if (employee.fullName) return employee.fullName

  return [employee.firstName, employee.lastName].filter(Boolean).join(" ")
}

export default function ServiceDetailsModal({
  service,
  onClose,
  onUpdated,
}: Props) {
  const [notes, setNotes] = useState(service.notes || "")
  const [importantNotes, setImportantNotes] = useState(
    service.importantNotes || ""
  )
  const [status, setStatus] = useState(service.status || "assigned")
  const [loading, setLoading] = useState(false)

  const [pricingModel, setPricingModel] = useState(
    service.pricingModel || "TIME"
  )
  const [travelTime, setTravelTime] = useState(service.travelTime || 0)
  const [changeReason, setChangeReason] = useState("")

  const [actualStartTime, setActualStartTime] = useState<string>(
    formatToLocalDatetime(service.actualStartTime)
  )
  const [actualEndTime, setActualEndTime] = useState<string>(
    formatToLocalDatetime(service.actualEndTime)
  )

  const [scheduledDate, setScheduledDate] = useState(
    formatToDateInput(service.date)
  )

  const [scheduledTime, setScheduledTime] = useState(
    formatToTimeInput(service.startTime)
  )

  const [teamDuration, setTeamDuration] = useState<string>(
    service.teamDuration !== null && service.teamDuration !== undefined
      ? String(service.teamDuration)
      : service.duration !== null && service.duration !== undefined
        ? String(service.duration)
        : ""
  )

  const [address, setAddress] = useState(
    service.address || service.client?.address || ""
  )

  const [employees, setEmployees] = useState<any[]>([])
  const [employeeIds, setEmployeeIds] = useState<number[]>(
    getAssignmentEmployeeIds(service)
  )

  const [scope, setScope] = useState<Scope>("THIS")
  const [showScopeSelector, setShowScopeSelector] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await fetch("/api/employees", {
          cache: "no-store",
        })

        const data = await res.json().catch(() => [])

        if (res.ok && Array.isArray(data)) {
          setEmployees(data)
        }
      } catch (error) {
        console.error("EMPLOYEES LOAD ERROR:", error)
      }
    }

    loadEmployees()
  }, [])

  const isRecurringService =
    service?.parentServiceId != null ||
    Boolean(service?.childServices?.length)

  const hasTimeChanged =
    actualStartTime !== formatToLocalDatetime(service.actualStartTime) ||
    actualEndTime !== formatToLocalDatetime(service.actualEndTime)

  const hasDateChanged = scheduledDate !== formatToDateInput(service.date)

  const hasScheduledTimeChanged =
    scheduledTime !== formatToTimeInput(service.startTime)

  const hasDurationChanged =
    Number(teamDuration || 0) !==
    Number(service.teamDuration ?? service.duration ?? 0)

  const hasAddressChanged = address !== (service.address || service.client?.address || "")

  const hasScheduleChanged =
    hasDateChanged || hasScheduledTimeChanged || hasDurationChanged || hasAddressChanged

  const originalEmployeeIds = getAssignmentEmployeeIds(service)
    .sort((a: number, b: number) => a - b)
    .join(",")

  const currentEmployeeIds = [...employeeIds]
    .sort((a, b) => a - b)
    .join(",")

  const hasEmployeeChanged = originalEmployeeIds !== currentEmployeeIds
  const hasStatusChanged = status !== (service.status || "assigned")

  const requiresChangeReason =
    hasTimeChanged || hasScheduleChanged || hasEmployeeChanged || hasStatusChanged

  const requiresKey = Boolean(service.requiresKey || service.client?.requiresKey)

  const executeAction = async (
    selectedScope: Scope,
    action: PendingAction
  ) => {
    if (action === "SAVE" && requiresChangeReason && !changeReason.trim()) {
      alert("Bitte geben Sie einen Grund für die Änderung an.")
      return
    }

    setLoading(true)

    try {
      const isDelete = action === "DELETE"

      const body: any = isDelete
        ? {
            scope: selectedScope,
            reason:
              changeReason.trim() ||
              "Auftrag wurde vom Administrator storniert.",
          }
        : {
            notes,
            importantNotes,
            status,
            pricingModel,
            travelTime: Number(travelTime) || 0,
            changeReason,
            scope: selectedScope,
          }

      if (!isDelete) {
        if (hasDateChanged) {
          body.date = scheduledDate
            ? new Date(`${scheduledDate}T00:00:00`).toISOString()
            : null
        }

        if (hasDateChanged || hasScheduledTimeChanged) {
          body.startTime = buildDateTime(scheduledDate, scheduledTime)
        }

        if (hasDurationChanged) {
          body.teamDuration =
            teamDuration === "" || teamDuration === null
              ? null
              : Number(teamDuration)
        }

        if (hasAddressChanged) {
          body.address = address
        }

        if (hasEmployeeChanged) {
          body.employeeIds = employeeIds
        }

        if (hasTimeChanged) {
          body.actualStartTime = actualStartTime
            ? new Date(actualStartTime).toISOString()
            : null

          body.actualEndTime = actualEndTime
            ? new Date(actualEndTime).toISOString()
            : null
        }
      }

      const res = await fetch(`/api/services/${service.id}`, {
        method: isDelete ? "DELETE" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        alert(data?.error || "Die Aktion konnte nicht ausgeführt werden.")
        return
      }

      onUpdated?.()
      onClose()
    } catch (err) {
      console.error("Action error:", err)
      alert("Die Aktion konnte nicht ausgeführt werden.")
    } finally {
      setLoading(false)
      setShowScopeSelector(false)
      setPendingAction(null)
    }
  }

  const handleSave = () => {
    setPendingAction("SAVE")

    if (isRecurringService) {
      setShowScopeSelector(true)
      return
    }

    executeAction("THIS", "SAVE")
  }

  const handleDelete = () => {
    if (
      !confirm(
        "Auftrag wirklich stornieren? Der Auftrag bleibt im Verlauf erhalten."
      )
    ) {
      return
    }

    setPendingAction("DELETE")

    if (isRecurringService) {
      setShowScopeSelector(true)
      return
    }

    executeAction("THIS", "DELETE")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-950">
        {requiresKey && (
          <div className="m-4 mb-0 flex items-center gap-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-200 text-2xl">
              🔑
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                Achtung: Schlüssel erforderlich
              </p>

              <p className="text-sm font-bold leading-tight text-amber-900">
                Dieser Kunde hat einen Schlüssel hinterlegt. Bitte sicherstellen,
                dass der Mitarbeiter den Schlüssel dabei hat.
              </p>
            </div>
          </div>
        )}

        <header className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-5 dark:border-slate-800 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Auftragsdetails
            </h2>

            <p className="text-sm font-medium italic text-slate-500">
              {service.serviceCode?.code || service.code || "Service"} •{" "}
              {service.client?.name || "Kunde"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-2xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            ×
          </button>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto px-8 py-6">
          <section className="grid grid-cols-1 gap-4 rounded-2xl border bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border bg-white p-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="assigned">Geplant</option>
                <option value="traveling">Unterwegs</option>
                <option value="in_progress">In Arbeit</option>
                <option value="completed">Abgeschlossen</option>
                <option value="cancelled">Storniert</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400">
                Abrechnungsmodell
              </label>

              <select
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value)}
                className="w-full rounded-xl border bg-white p-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="TIME">Zeitbasiert (h)</option>
                <option value="FIXED">Pauschal (Festpreis)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-amber-600">
                Fahrzeit (min)
              </label>

              <input
                type="number"
                value={travelTime}
                onChange={(e) => setTravelTime(Number(e.target.value))}
                className="w-full rounded-xl border bg-white p-2 text-sm font-bold shadow-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Planung
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-slate-500">
                  Datum
                </label>

                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">
                  Uhrzeit
                </label>

                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-slate-500">
                  Dauer Team / Kalender
                </label>

                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={teamDuration}
                  onChange={(e) => setTeamDuration(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                  placeholder="z.B. 2.5"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">
                  Adresse
                </label>

                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                  placeholder="Adresse"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Zugewiesene Mitarbeiter
            </h4>

            {employees.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm font-bold text-slate-500">
                Keine Mitarbeiter geladen.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {employees.map((employee) => {
                  const employeeId = Number(employee.id)
                  const selected = employeeIds.includes(employeeId)

                  return (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => {
                        setEmployeeIds((prev) =>
                          selected
                            ? prev.filter((id) => id !== employeeId)
                            : [...prev, employeeId]
                        )
                      }}
                      className={`rounded-xl border-2 p-3 text-left transition-all ${
                        selected
                          ? "border-blue-500 bg-blue-50 text-blue-700 ring-4 ring-blue-500/10"
                          : "border-slate-100 hover:border-slate-300 dark:border-slate-800"
                      }`}
                    >
                      <p className="text-sm font-black">
                        {getEmployeeName(employee)}
                      </p>

                      <p className="text-xs font-medium text-slate-500">
                        {employee.profession || "Mitarbeiter"}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 dark:border-blue-900/30 dark:bg-blue-900/10">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
              Echtzeit-Erfassung
            </h4>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
                  Tatsächlicher Start
                </label>

                <input
                  type="datetime-local"
                  value={actualStartTime}
                  onChange={(e) => setActualStartTime(e.target.value)}
                  className="h-11 w-full rounded-xl border px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
                  Tatsächliches Ende
                </label>

                <input
                  type="datetime-local"
                  value={actualEndTime}
                  onChange={(e) => setActualEndTime(e.target.value)}
                  className="h-11 w-full rounded-xl border px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>

            {requiresChangeReason && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/30 dark:bg-rose-900/20">
                <label className="mb-1 block text-[10px] font-black uppercase text-rose-600">
                  Grund der Änderung
                </label>

                <input
                  placeholder="z.B. Kunde hat Termin verschoben, Mitarbeiter gewechselt, Zeit manuell korrigiert..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="h-10 w-full rounded-lg border-2 border-rose-200 bg-white px-3 text-xs outline-none focus:border-rose-500 dark:bg-slate-900"
                />
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 gap-6 border-t pt-4 dark:border-slate-800 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-rose-600">
                Sicherheit / Wichtige Notizen
              </h4>

              <textarea
                value={importantNotes}
                onChange={(e) => setImportantNotes(e.target.value)}
                className="h-32 w-full resize-none rounded-xl border-2 border-rose-100 bg-rose-50/30 p-4 text-sm outline-none focus:border-rose-400 dark:border-rose-900/30 dark:bg-rose-900/10"
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Interne Notizen
              </h4>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-32 w-full resize-none rounded-xl border p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </section>
        </div>

        <footer className="flex flex-col items-center justify-between gap-4 border-t bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="text-sm font-bold text-rose-500 transition-colors hover:text-rose-700 disabled:opacity-50"
          >
            Auftrag stornieren
          </button>

          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border px-6 py-2.5 text-sm font-bold transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800 sm:flex-none"
            >
              Abbrechen
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading || (requiresChangeReason && !changeReason.trim())}
              className="flex-1 rounded-xl bg-blue-600 px-10 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 disabled:bg-slate-300 sm:flex-none"
            >
              {loading ? "Speichern..." : "Änderungen speichern"}
            </button>
          </div>
        </footer>
      </div>

      {showScopeSelector && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-2 text-xl font-black">Änderungsumfang</h3>

            <p className="mb-6 text-sm font-medium text-slate-500">
              Was soll angepasst werden?
            </p>

            <div className="space-y-3">
              {[
                {
                  id: "THIS",
                  title: "Nur diesen Termin",
                  description: "Nur dieser einzelne Termin",
                },
                {
                  id: "THIS_AND_FUTURE",
                  title: "Ab heute in Zukunft",
                  description: "Diesen und alle folgenden Termine",
                },
                {
                  id: "ALL",
                  title: "Gesamte Serie",
                  description: "Vergangenheit und Zukunft",
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setScope(option.id as Scope)}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                    scope === option.id
                      ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10 dark:bg-blue-900/20"
                      : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <p className="text-sm font-bold">{option.title}</p>
                  <p className="text-[10px] font-medium text-slate-500">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowScopeSelector(false)
                  setPendingAction(null)
                }}
                disabled={loading}
                className="flex-1 rounded-xl border py-3 text-sm font-bold disabled:opacity-50"
              >
                Abbrechen
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!pendingAction) return
                  executeAction(scope, pendingAction)
                }}
                disabled={!pendingAction || loading}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 disabled:bg-slate-300"
              >
                {loading ? "Wird verarbeitet..." : "Bestätigen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}