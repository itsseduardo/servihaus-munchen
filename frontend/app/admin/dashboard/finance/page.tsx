"use client"

import Link from "next/link"

const FUTURE_METRICS = [
  {
    title: "Abrechenbare Stunden",
    description: "Horas facturables por cliente, servicio y periodo.",
    icon: "schedule",
  },
  {
    title: "Geplante vs. reale Stunden",
    description: "Comparación entre tiempo estimado, trabajado y facturable.",
    icon: "timer",
  },
  {
    title: "TIME vs. FIXED",
    description: "Separación entre servicios por hora y servicios de precio fijo.",
    icon: "price_change",
  },
  {
    title: "Mitarbeiterkosten",
    description: "Coste estimado por empleado según horas y salario.",
    icon: "payments",
  },
  {
    title: "Umsatzschätzung",
    description: "Estimación de ingresos mensuales por servicios realizados.",
    icon: "trending_up",
  },
  {
    title: "Marge",
    description: "Comparación futura entre ingresos, costes y rentabilidad.",
    icon: "analytics",
  },
]

export default function AdminFinanceDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-600 hover:text-blue-800"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Finanzen
            </h1>

            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
              Finanzielle Auswertungen, abrechenbare Stunden, Kosten,
              Umsatzschätzungen und Margen werden hier vorbereitet.
            </p>
          </div>

          <span className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-3 text-sm font-black text-amber-700">
            <span className="material-symbols-outlined text-[20px]">
              construction
            </span>
            Under Construction
          </span>
        </header>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm sm:p-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-50" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-amber-50" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-slate-950 text-white shadow-xl">
              <span className="material-symbols-outlined text-5xl">
                euro
              </span>
            </div>

            <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Finanzmodul in Vorbereitung
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Diese Ansicht wird vorbereitet
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
              Esta vista está reservada para el análisis financiero. La dejamos
              separada desde ahora para que el sistema tenga una estructura
              profesional, pero los números financieros se activarán cuando las
              reglas de facturación, costes y contratos estén completamente
              definidas.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-[20px]">
                  dashboard
                </span>
                Zur Übersicht
              </Link>

              <Link
                href="/admin/dashboard/services"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 transition-all hover:border-blue-200 hover:text-blue-700"
              >
                <span className="material-symbols-outlined text-[20px]">
                  cleaning_services
                </span>
                Services ansehen
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {FUTURE_METRICS.map((metric) => (
            <div
              key={metric.title}
              className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <span className="material-symbols-outlined text-3xl">
                  {metric.icon}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-950">
                {metric.title}
              </h3>

              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                {metric.description}
              </p>

              <span className="mt-5 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-amber-700">
                Geplant
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
              <span className="material-symbols-outlined">info</span>
            </div>

            <div>
              <p className="text-sm font-black text-blue-900">
                Warum diese Ansicht noch nicht aktiv ist
              </p>

              <p className="mt-1 text-sm font-medium leading-6 text-blue-800">
                Para mostrar estadísticas financieras reales, primero deben
                estar cerradas las reglas de facturación: qué servicios se cobran
                por hora, cuáles son precio fijo, cómo se calculan los costes de
                empleados, qué contratos aplican y qué datos deben considerarse
                oficiales. Hasta entonces, esta vista queda preparada pero no
                muestra importes económicos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}