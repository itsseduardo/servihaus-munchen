export default function ClientInvoicesPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Portal / Rechnungen
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Rechnungen
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Dieser Bereich wird aktuell vorbereitet.
          </p>
        </div>

        {/* Construction card */}
        <div className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Illustration */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[420px]">
                {/* Background glow */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-50 via-sky-50 to-slate-100 blur-2xl" />

                <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-slate-50 p-8 shadow-inner">
                  {/* Invoice sheet */}
                  <div className="mx-auto w-[240px] rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-3 w-20 rounded-full bg-slate-200" />
                        <div className="mt-2 h-2.5 w-12 rounded-full bg-slate-100" />
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <span className="material-symbols-outlined">
                          receipt_long
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="h-3 rounded-full bg-slate-100" />
                      <div className="h-3 w-5/6 rounded-full bg-slate-100" />
                      <div className="h-3 w-4/6 rounded-full bg-slate-100" />
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                      <div className="h-3 w-16 rounded-full bg-slate-200" />
                      <div className="mt-3 h-4 w-24 rounded-full bg-blue-100" />
                    </div>
                  </div>

                  {/* Vacuum illustration */}
                  <div className="absolute bottom-8 left-8 flex items-end gap-3">
                    {/* Vacuum body */}
                    <div className="relative h-16 w-16 rounded-full bg-blue-600 shadow-lg shadow-blue-200">
                      <div className="absolute left-3 top-3 h-5 w-5 rounded-full bg-white/70" />
                      <div className="absolute -bottom-1 left-3 h-3 w-3 rounded-full bg-slate-700" />
                      <div className="absolute -bottom-1 right-3 h-3 w-3 rounded-full bg-slate-700" />
                    </div>

                    {/* Hose */}
                    <div className="relative mb-4 h-1.5 w-20 rounded-full bg-slate-400">
                      <div className="absolute -right-2 -top-1 h-4 w-4 rounded-full bg-slate-500" />
                    </div>
                  </div>

                  {/* Moving sparkle dust */}
                  <div className="absolute bottom-14 right-14 flex items-center gap-2">
                    <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-300" />
                    <div className="h-3 w-3 animate-bounce rounded-full bg-sky-300 [animation-duration:1.4s]" />
                    <div className="h-2 w-2 animate-pulse rounded-full bg-slate-300 [animation-delay:0.2s]" />
                  </div>

                  {/* Floating badge */}
                  <div className="absolute right-6 top-6 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-blue-600 shadow-sm">
                    Cleaning in progress
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                <span className="material-symbols-outlined text-[18px]">
                  construction
                </span>
                Under Construction
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                We&apos;re under construction
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 font-medium text-slate-500">
                Der Rechnungsbereich wird gerade vorbereitet, damit Sie bald
                Ihre Rechnungen, Zahlungen und Abrechnungsdetails hier bequem
                einsehen können.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Bald verfügbar
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-700">
                    Rechnungsübersicht
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Bald verfügbar
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-700">
                    Download als PDF
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-bold text-blue-700">
                Vielen Dank für Ihre Geduld — dieser Bereich wird bald
                freigeschaltet.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}