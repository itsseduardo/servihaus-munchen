"use client"

export default function ServiceInfoModal({
  service,
  onClose,
}: {
  service: any
  onClose: () => void
}) {
  if (!service) return null

  const clientName = service.client?.name || "Kunde"
  const serviceCode = service.serviceCode?.code || service.code || "Service"
  const serviceDescription =
    service.serviceCode?.description || service.code || "Reinigung"
  const address =
    service.address || service.client?.address || "Keine Adresse angegeben"
  const notes = service.notes || "Keine zusätzlichen Notizen vorhanden."
  const importantNotes = service.importantNotes || ""
  const requiresKey = Boolean(service.requiresKey || service.client?.requiresKey)

  const team =
    service.assignments?.length > 0
      ? service.assignments.map((assignment: any) => {
          const employee = assignment.employee
          return `${employee.firstName} ${employee.lastName}`
        })
      : []

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Modal schließen"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white">
                {clientName.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  Service Details
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-950">
                  {clientName}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm">
                    {serviceCode}
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    {serviceDescription}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900"
              aria-label="Modal schließen"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="grid gap-4">
            <InfoBlock
              icon="location_on"
              title="Adresse"
              text={address}
              tone="blue"
            />

            <div
              className={`rounded-2xl p-4 ${
                requiresKey
                  ? "border border-amber-100 bg-amber-50"
                  : "border border-slate-100 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined ${
                    requiresKey ? "text-amber-600" : "text-slate-500"
                  }`}
                >
                  {requiresKey ? "key" : "key_off"}
                </span>

                <div>
                  <p
                    className={`text-xs font-black uppercase tracking-[0.14em] ${
                      requiresKey ? "text-amber-600" : "text-slate-400"
                    }`}
                  >
                    Schlüssel
                  </p>

                  <p
                    className={`mt-1 text-sm font-bold ${
                      requiresKey ? "text-amber-800" : "text-slate-700"
                    }`}
                  >
                    {requiresKey
                      ? "Für diesen Service wird ein Schlüssel benötigt."
                      : "Für diesen Service ist kein Schlüssel hinterlegt."}
                  </p>
                </div>
              </div>
            </div>

            {importantNotes && (
              <InfoBlock
                icon="warning"
                title="Wichtig"
                text={importantNotes}
                tone="red"
              />
            )}

            <InfoBlock
              icon="sticky_note_2"
              title="Details"
              text={notes}
              tone="slate"
            />

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-slate-500">
                  group
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Team
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {team.length > 0 ? (
                      team.map((member: string) => (
                        <span
                          key={member}
                          className="rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm"
                        >
                          {member}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm font-bold text-slate-500">
                        Kein Team hinterlegt.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 flex w-full items-center justify-center rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white transition-all hover:bg-blue-700"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoBlock({
  icon,
  title,
  text,
  tone,
}: {
  icon: string
  title: string
  text: string
  tone: "blue" | "red" | "slate"
}) {
  const styles = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    red: "border-red-100 bg-red-50 text-red-700",
    slate: "border-slate-100 bg-slate-50 text-slate-700",
  }

  const iconStyles = {
    blue: "text-blue-600",
    red: "text-red-600",
    slate: "text-slate-500",
  }

  return (
    <div className={`rounded-2xl border p-4 ${styles[tone]}`}>
      <div className="flex items-start gap-3">
        <span className={`material-symbols-outlined ${iconStyles[tone]}`}>
          {icon}
        </span>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">
            {title}
          </p>

          <p className="mt-1 text-sm font-bold leading-6">{text}</p>
        </div>
      </div>
    </div>
  )
}