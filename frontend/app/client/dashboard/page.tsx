"use client"

import { useEffect, useState } from "react"

import ClientOnboardingModal from "@/components/client/ClientOnboardingModal"
import ClientRequestModal from "@/components/client/ClientRequestModal"

type OnboardingData = {
  firstName: string
  lastName: string
  phone: string
  street: string
  postalCode: string
  city: string
}

type ClientDashboardData = {
  id: string
  clientCode: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  category?: string | null
  clientType?: string | null
  hasCompletedOnboarding: boolean
  onboardingData: OnboardingData
  nextService: {
    id: string
    date: string
    day: string
    time: string
    type: string
    staff: string
    status: string
  } | null
  stats: {
    totalServices: number
    activePlanning?: number
    pendingInvoices?: number
    loyaltyPoints?: number
  }
  recommendation?: {
    title: string
    reason: string
    icon: string
  }
}

type ClientRequestType = "EXTRA_SERVICE"

export default function ClientDashboardPage() {
  const [clientData, setClientData] = useState<ClientDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingOnboarding, setSavingOnboarding] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [requestModalType, setRequestModalType] =
    useState<ClientRequestType | null>(null)

  useEffect(() => {
    async function loadClientData() {
      try {
        setError("")

        const res = await fetch("/api/clients/me", {
          method: "GET",
          cache: "no-store",
        })

        const data = await res.json().catch(() => null)

        if (!res.ok) {
          setError(data?.error || "Kundendaten konnten nicht geladen werden.")
          return
        }

        setClientData(data)
      } catch {
        setError("Kundendaten konnten nicht geladen werden.")
      } finally {
        setLoading(false)
      }
    }

    loadClientData()
  }, [])

  async function refreshClientData() {
    const res = await fetch("/api/clients/me", {
      method: "GET",
      cache: "no-store",
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      setError(data?.error || "Kundendaten konnten nicht aktualisiert werden.")
      return
    }

    setClientData(data)
  }

  async function handleOnboardingComplete(verifiedData: OnboardingData) {
    try {
      setSavingOnboarding(true)
      setError("")

      const res = await fetch("/api/clients/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verifiedData),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.error || "Onboarding konnte nicht gespeichert werden.")
        return
      }

      await refreshClientData()
    } catch {
      setError("Onboarding konnte nicht gespeichert werden.")
    } finally {
      setSavingOnboarding(false)
    }
  }

  function handleRequestCreated() {
    setRequestModalType(null)
    setSuccessMessage(
      "Ihre Anfrage wurde gesendet. Unser Team wird sie prüfen und sich bei Ihnen melden."
    )

    window.setTimeout(() => {
      setSuccessMessage("")
    }, 6000)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
            Dashboard wird geladen
          </p>
        </div>
      </main>
    )
  }

  if (error && !clientData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
          <span className="material-symbols-outlined text-5xl text-red-500">
            error
          </span>

          <h1 className="mt-4 text-2xl font-black text-slate-900">
            Zugriff nicht möglich
          </h1>

          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </div>
      </main>
    )
  }

  if (!clientData) {
    return null
  }

  if (!clientData.hasCompletedOnboarding) {
    return (
      <>
        {error && (
          <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 shadow-lg">
            {error}
          </div>
        )}

        {savingOnboarding && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg">
            Speichern...
          </div>
        )}

        <ClientOnboardingModal
          initialData={clientData.onboardingData}
          onComplete={handleOnboardingComplete}
        />
      </>
    )
  }

  const recommendation = clientData.recommendation ?? {
    title: "Dampfdesinfektion",
    reason: "Empfohlen als Zusatzleistung für Ihren nächsten Termin",
    icon: "sanitizer",
  }

  const activePlanning =
    clientData.stats.activePlanning ?? (clientData.nextService ? 1 : 0)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        {/* BIENVENIDA */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Kundenportal
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Willkommen, {clientData.name}!
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Hier finden Sie eine kurze Übersicht über Ihre aktuellen Services.
          </p>
        </div>

        {/* PRÓXIMO SERVICIO + RECOMENDACIÓN */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                Nächster Termin
              </p>
            </div>

            <div className="p-6">
              {clientData.nextService ? (
                <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                  <div className="rounded-[1.5rem] bg-blue-600 p-6 text-white shadow-lg shadow-blue-100">
                    <p className="text-sm font-black uppercase tracking-[0.18em] opacity-80">
                      {clientData.nextService.day}
                    </p>

                    <h2 className="mt-4 text-4xl font-black leading-none">
                      {clientData.nextService.date}
                    </h2>

                    <div className="mt-6 flex items-center gap-2 text-sm font-black">
                      <span className="material-symbols-outlined text-lg">
                        schedule
                      </span>
                      {clientData.nextService.time} Uhr
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-black text-slate-950">
                          {clientData.nextService.type}
                        </h3>

                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          <span className="material-symbols-outlined text-sm">
                            verified
                          </span>
                          Bestätigt
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-medium text-slate-500">
                        Ihr nächster Service ist bereits geplant.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                          <span className="material-symbols-outlined">
                            group
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                            Zugeordnetes Personal
                          </p>

                          <p className="text-sm font-black text-slate-800">
                            {clientData.nextService.staff}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-400">
                    event_busy
                  </span>

                  <h3 className="mt-3 text-xl font-black text-slate-900">
                    Kein geplanter Termin
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm font-medium text-slate-500">
                    Aktuell ist kein zukünftiger Service für Ihr Konto geplant.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RECOMENDACIÓN / UP-SELLING */}
          <div className="flex flex-col justify-between rounded-[2rem] border border-amber-100 bg-amber-50 p-6 shadow-sm">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                <span className="material-symbols-outlined text-3xl">
                  {recommendation.icon}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-slate-950">
                  {recommendation.title}
                </h3>

                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">
                  Empfehlung
                </span>
              </div>

              <p className="mt-3 text-sm font-bold leading-6 text-amber-800/80">
                {recommendation.reason}
              </p>

              <div className="mt-5 rounded-2xl bg-white/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">
                  So funktioniert es
                </p>

                <p className="mt-1 text-sm font-medium leading-6 text-amber-800/80">
                  Senden Sie eine Anfrage. Unser Team prüft Verfügbarkeit,
                  Aufwand und Terminoptionen.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRequestModalType("EXTRA_SERVICE")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              Extra-Service anfragen
            </button>
          </div>
        </div>

        {/* RESUMEN BÁSICO */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined">
                cleaning_services
              </span>
            </div>

            <p className="mt-5 text-3xl font-black text-slate-950">
              {clientData.stats.totalServices}
            </p>

            <p className="mt-1 text-sm font-black uppercase tracking-[0.14em] text-slate-400">
              Services gesamt
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <span className="material-symbols-outlined">
                event_available
              </span>
            </div>

            <p className="mt-5 text-3xl font-black text-slate-950">
              {activePlanning}
            </p>

            <p className="mt-1 text-sm font-black uppercase tracking-[0.14em] text-slate-400">
              Aktive Planung
            </p>
          </div>
        </div>
      </section>

      {requestModalType && (
        <ClientRequestModal
          type={requestModalType}
          onClose={() => setRequestModalType(null)}
          onCreated={handleRequestCreated}
        />
      )}
    </main>
  )
}