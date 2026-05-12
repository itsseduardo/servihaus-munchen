"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import ClientModal from "@/components/admin/ClientModal"
import CreateServiceModal from "@/components/admin/CreateServiceModal"

type ClientDetail = {
  id: number
  clientCode: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  category?: string | null
  clientType?: string | null
  services: any[]
  contracts?: any[]
}

type ClientTab = "overview" | "contract" | "history"

const SERVICES_PER_PAGE = 10

function getLocalDateInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function formatServiceDate(dateValue?: string | Date | null) {
  if (!dateValue) return "-"

  return new Date(dateValue).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  })
}

function formatServiceTime(dateValue?: string | Date | null) {
  if (!dateValue) return "-"

  return new Date(dateValue).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  })
}

function getStatusStyle(status?: string | null) {
  const normalized = status?.toLowerCase() || ""

  if (normalized === "completed") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100"
  }

  if (normalized === "cancelled" || normalized === "canceled") {
    return "bg-rose-50 text-rose-700 border-rose-100"
  }

  if (normalized === "in_progress") {
    return "bg-amber-50 text-amber-700 border-amber-100"
  }

  if (normalized === "traveling") {
    return "bg-blue-50 text-blue-700 border-blue-100"
  }

  return "bg-slate-100 text-slate-700 border-slate-200"
}

function getStatusLabel(status?: string | null) {
  const normalized = status?.toLowerCase() || ""

  switch (normalized) {
    case "completed":
      return "Abgeschlossen"
    case "cancelled":
    case "canceled":
      return "Storniert"
    case "in_progress":
      return "In Arbeit"
    case "traveling":
      return "Unterwegs"
    case "assigned":
      return "Geplant"
    default:
      return status || "Geplant"
  }
}

function getServiceCode(service: any) {
  return (
    service.serviceCode?.code ||
    service.code ||
    service.serviceCodeCode ||
    (service.serviceCodeId ? `Code #${service.serviceCodeId}` : "Ohne Code")
  )
}

function getServiceDescription(service: any) {
  return (
    service.serviceCode?.description ||
    service.description ||
    service.serviceName ||
    "Service"
  )
}

function getDurationLabel(service: any) {
  const duration = service.duration ?? service.teamDuration ?? service.billedHours

  if (!duration) return "-"

  return `${duration} h`
}

function getContractStatusStyle(status?: string | null) {
  const normalized = status?.toLowerCase() || ""

  if (normalized === "active") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100"
  }

  if (normalized === "paused") {
    return "bg-amber-50 text-amber-700 border-amber-100"
  }

  if (normalized === "ended" || normalized === "cancelled") {
    return "bg-rose-50 text-rose-700 border-rose-100"
  }

  return "bg-slate-100 text-slate-700 border-slate-200"
}

function getContractStatusLabel(status?: string | null) {
  const normalized = status?.toLowerCase() || ""

  switch (normalized) {
    case "active":
      return "Aktiv"
    case "paused":
      return "Pausiert"
    case "ended":
      return "Beendet"
    case "cancelled":
      return "Storniert"
    default:
      return status || "Nicht hinterlegt"
  }
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-1 pb-5 text-sm font-black transition-colors sm:text-base ${
        active ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
      }`}
    >
      {children}

      {active && (
        <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-blue-600" />
      )}
    </button>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()

  const rawId = params.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId

  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ClientTab>("overview")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false)
  const [servicePage, setServicePage] = useState(1)

  const fetchClient = async () => {
    try {
      setLoading(true)

      const res = await fetch(`/api/clients/${id}`, {
        cache: "no-store",
      })

      if (!res.ok) {
        setClient(null)
        return
      }

      const data = await res.json()
      setClient(data)
    } catch (error) {
      console.error("Error loading client:", error)
      setClient(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchClient()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    setServicePage(1)
  }, [client?.id, activeTab])

  const categoryStyles: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-800 border-emerald-200",
    B: "bg-blue-100 text-blue-800 border-blue-200",
    C: "bg-slate-100 text-slate-800 border-slate-200",
    D: "bg-orange-100 text-orange-800 border-orange-200",
    E: "bg-amber-100 text-amber-800 border-amber-200",
    Z: "bg-rose-100 text-rose-800 border-rose-200",
  }

  const sortedServices = useMemo(() => {
    if (!client?.services) return []

    return [...client.services].sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()

      return dateB - dateA
    })
  }, [client])

  const stats = useMemo(() => {
    if (!client) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
      }
    }

    const cancelled = client.services.filter((service: any) => {
      const status = service.status?.toLowerCase?.() || ""
      return status === "cancelled" || status === "canceled"
    }).length

    const notCancelled = client.services.filter((service: any) => {
      const status = service.status?.toLowerCase?.() || ""
      return status !== "cancelled" && status !== "canceled"
    })

    const total = notCancelled.length

    const active = notCancelled.filter((service: any) => {
      const status = service.status?.toLowerCase?.() || ""
      return (
        status === "assigned" ||
        status === "traveling" ||
        status === "in_progress"
      )
    }).length

    const completed = notCancelled.filter(
      (service: any) => service.status?.toLowerCase?.() === "completed"
    ).length

    return {
      total,
      active,
      completed,
      cancelled,
    }
  }, [client])

  const nextService = useMemo(() => {
    if (!client?.services?.length) return null

    const now = new Date()

    return client.services
      .filter((service: any) => {
        const status = service.status?.toLowerCase?.() || ""
        const serviceDate = new Date(service.date)

        return (
          serviceDate >= now &&
          status !== "cancelled" &&
          status !== "canceled" &&
          status !== "completed"
        )
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()

        return dateA - dateB
      })[0]
  }, [client])

  const latestService = sortedServices[0] || null

  const totalServicePages = Math.max(
    1,
    Math.ceil(sortedServices.length / SERVICES_PER_PAGE)
  )

  const paginatedServices = useMemo(() => {
    const start = (servicePage - 1) * SERVICES_PER_PAGE
    const end = start + SERVICES_PER_PAGE

    return sortedServices.slice(start, end)
  }, [sortedServices, servicePage])

  useEffect(() => {
    if (servicePage > totalServicePages) {
      setServicePage(totalServicePages)
    }
  }, [servicePage, totalServicePages])

  const latestContract = useMemo(() => {
    if (!client?.contracts?.length) return null

    return [...client.contracts].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || a.startDate || 0).getTime()
      const dateB = new Date(b.createdAt || b.startDate || 0).getTime()

      return dateB - dateA
    })[0]
  }, [client])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                Lade Kundendaten
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!client) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-400">
            person_off
          </span>

          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Kunde nicht gefunden
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Der Kunde konnte nicht geladen werden.
          </p>

          <button
            type="button"
            onClick={() => router.push("/admin/clients")}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition-all hover:bg-blue-700"
          >
            Zurück zur Liste
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-7xl space-y-6">
        {/* TOP BAR */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/clients")}
            className="group flex w-fit items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-blue-600"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Zurück zur Liste
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setIsServiceModalOpen(true)}
              className="rounded-xl border-2 border-blue-600 bg-blue-600 px-6 py-2 text-xs font-black uppercase text-white shadow-sm transition-all hover:bg-blue-700"
            >
              + Auftrag planen
            </button>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="rounded-xl border-2 border-slate-200 bg-white px-6 py-2 text-xs font-black uppercase text-slate-700 shadow-sm transition-all hover:border-blue-600 hover:text-blue-600"
            >
              Kunde bearbeiten
            </button>
          </div>
        </div>

        {/* CLIENT HERO */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/15 text-3xl font-black uppercase backdrop-blur">
                  {client.name?.[0] || "K"}
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-100">
                    #{client.clientCode}
                  </p>

                  <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                    {client.name}
                  </h1>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black ${
                        categoryStyles[client.category || "C"] ||
                        categoryStyles.C
                      }`}
                    >
                      Kategorie {client.category || "C"}
                    </span>

                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white backdrop-blur">
                      {client.clientType === "FIRMA"
                        ? "Unternehmen"
                        : "Privatperson"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        client.category === "Z"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {client.category === "Z" ? "Gesperrt" : "Aktiv"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-100">
                    Aufträge
                  </p>
                  <p className="mt-1 text-2xl font-black">{stats.total}</p>
                </div>

                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-100">
                    Aktiv
                  </p>
                  <p className="mt-1 text-2xl font-black">{stats.active}</p>
                </div>

                <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-100">
                    Fertig
                  </p>
                  <p className="mt-1 text-2xl font-black">{stats.completed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="border-b border-slate-100 px-6 pt-5 sm:px-8">
            <div className="flex gap-6 overflow-x-auto">
              <TabButton
                active={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
              >
                Übersicht
              </TabButton>

              <TabButton
                active={activeTab === "contract"}
                onClick={() => setActiveTab("contract")}
              >
                Vertrag
              </TabButton>

              <TabButton
                active={activeTab === "history"}
                onClick={() => setActiveTab("history")}
              >
                Historie
              </TabButton>
            </div>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                    Kundendaten
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Kontakt & Standort
                  </h2>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                  {client.clientCode}
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">
                        mail
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        E-Mail
                      </p>

                      <p className="mt-1 break-all text-sm font-bold text-slate-800">
                        {client.email || "Nicht hinterlegt"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">
                        call
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Telefon
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {client.phone || "Keine Nummer"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                      <span className="material-symbols-outlined text-[20px]">
                        location_on
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Adresse
                      </p>

                      <p className="mt-1 text-sm font-bold leading-6 text-slate-800">
                        {client.address || "Nicht hinterlegt"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Nächster Auftrag
                </p>

                {nextService ? (
                  <div className="mt-5 flex flex-col gap-4 rounded-3xl bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-blue-700">
                        {getServiceCode(nextService)}
                      </p>

                      <h3 className="mt-1 text-xl font-black text-slate-950">
                        {getServiceDescription(nextService)}
                      </h3>

                      <p className="mt-2 text-sm font-bold text-slate-500">
                        {formatServiceDate(nextService.date)} ·{" "}
                        {formatServiceTime(nextService.startTime)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(
                        nextService.status
                      )}`}
                    >
                      {getStatusLabel(nextService.status)}
                    </span>
                  </div>
                ) : (
                  <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300">
                      event_busy
                    </span>

                    <h3 className="mt-3 text-lg font-black text-slate-900">
                      Kein geplanter Auftrag
                    </h3>

                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Für diesen Kunden gibt es aktuell keinen zukünftigen
                      Auftrag.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Letzter Eintrag
                </p>

                {latestService ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Code
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-800">
                        {getServiceCode(latestService)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Datum
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-800">
                        {formatServiceDate(latestService.date)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Status
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(
                          latestService.status
                        )}`}
                      >
                        {getStatusLabel(latestService.status)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 text-sm font-medium text-slate-500">
                    Noch keine Aufträge vorhanden.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CONTRACT TAB */}
        {activeTab === "contract" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                    Vertragsverwaltung
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Vertrag des Kunden
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                    Hier wird der vertragliche Rahmen des Kunden verwaltet:
                    Laufzeit, Frequenz, Stunden, Preis und interne
                    Vereinbarungen.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Die Vertragsverwaltung wird im nächsten Schritt aktiviert."
                    )
                  }
                  className="rounded-xl border-2 border-blue-600 bg-blue-600 px-6 py-2 text-xs font-black uppercase text-white shadow-sm transition-all hover:bg-blue-700"
                >
                  Vertrag anlegen
                </button>
              </div>

              {latestContract ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Status
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-black ${getContractStatusStyle(
                        latestContract.status
                      )}`}
                    >
                      {getContractStatusLabel(latestContract.status)}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Laufzeit
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {latestContract.startDate
                        ? formatServiceDate(latestContract.startDate)
                        : "-"}{" "}
                      —{" "}
                      {latestContract.endDate
                        ? formatServiceDate(latestContract.endDate)
                        : "offen"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Frequenz
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {latestContract.frequency || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Vereinbarung
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {latestContract.agreedHours
                        ? `${latestContract.agreedHours} h`
                        : latestContract.agreedPrice
                          ? `${latestContract.agreedPrice} €`
                          : "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-400">
                    contract
                  </span>

                  <h3 className="mt-4 text-lg font-black text-slate-900">
                    Noch kein Vertrag hinterlegt
                  </h3>

                  <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-slate-500">
                    Die Ansicht ist vorbereitet. Im nächsten Schritt legen wir
                    das Datenmodell und die Verwaltung für Kundenverträge an.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Geplante Vertragsfelder
              </p>

              <div className="mt-5 grid gap-3">
                {[
                  ["Vertragstyp", "Privat, Gewerbe, Sondervereinbarung"],
                  ["Start & Ende", "Laufzeit des Vertrags"],
                  ["Frequenz", "Wöchentlich, monatlich, individuell"],
                  ["Stunden", "Vereinbarte Stunden pro Einsatz"],
                  ["Preis", "Pauschal oder zeitbasiert"],
                  ["Notizen", "Interne Vereinbarungen"],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-black text-slate-800">
                      {title}
                    </p>

                    <p className="mt-1 text-xs font-bold text-slate-400">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="rounded-[2rem] border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Service-Historie
                </h2>

                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  {sortedServices.length} Einträge
                </p>
              </div>
            </div>

            {sortedServices.length === 0 ? (
              <div className="p-10 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300">
                  event_busy
                </span>

                <h3 className="mt-3 text-lg font-black text-slate-900">
                  Keine Services vorhanden
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Für diesen Kunden wurde noch kein Auftrag geplant.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr className="text-left">
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Datum
                        </th>

                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Service Code
                        </th>

                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Dauer
                        </th>

                        <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedServices.map((service: any) => (
                        <tr
                          key={service.id}
                          className="border-t border-slate-100"
                        >
                          <td className="px-6 py-4 align-top">
                            <p className="text-sm font-black text-slate-900">
                              {formatServiceDate(service.date)}
                            </p>

                            <p className="mt-1 text-xs font-bold text-slate-400">
                              {formatServiceTime(service.startTime)}
                            </p>
                          </td>

                          <td className="px-6 py-4 align-top">
                            <p className="text-sm font-black text-slate-800">
                              {getServiceCode(service)}
                            </p>

                            <p className="mt-1 max-w-[280px] truncate text-xs font-medium text-slate-400">
                              {getServiceDescription(service)}
                            </p>
                          </td>

                          <td className="px-6 py-4 align-top text-sm font-bold text-slate-700">
                            {getDurationLabel(service)}
                          </td>

                          <td className="px-6 py-4 align-top">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(
                                service.status
                              )}`}
                            >
                              {getStatusLabel(service.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Zeige {(servicePage - 1) * SERVICES_PER_PAGE + 1}-
                    {Math.min(
                      servicePage * SERVICES_PER_PAGE,
                      sortedServices.length
                    )}{" "}
                    von {sortedServices.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setServicePage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={servicePage === 1}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        chevron_left
                      </span>
                    </button>

                    {Array.from({ length: totalServicePages }).map(
                      (_, index) => {
                        const page = index + 1
                        const active = page === servicePage

                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setServicePage(page)}
                            className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-black transition-all ${
                              active
                                ? "bg-blue-600 text-white"
                                : "border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      }
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setServicePage((prev) =>
                          Math.min(totalServicePages, prev + 1)
                        )
                      }
                      disabled={servicePage === totalServicePages}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {isEditModalOpen && (
        <ClientModal
          client={client}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={() => {
            setIsEditModalOpen(false)
            fetchClient()
          }}
        />
      )}

      {isServiceModalOpen && (
        <CreateServiceModal
          selectedDate={getLocalDateInputValue()}
          selectedTime="09:00"
          prefilledClient={{
            id: client.id,
            clientCode: client.clientCode,
            name: client.name,
            address: client.address,
          }}
          lockClient
          onClose={() => setIsServiceModalOpen(false)}
          onCreated={() => {
            setIsServiceModalOpen(false)
            fetchClient()
          }}
        />
      )}
    </main>
  )
}