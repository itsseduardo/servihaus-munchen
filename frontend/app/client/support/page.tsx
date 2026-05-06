export default function ClientSupportPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Portal / Support
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Support
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Dieser Bereich wird aktuell vorbereitet.
          </p>
        </div>

        {/* Construction card */}
        <div className="mt-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            {/* Text */}
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                <span className="material-symbols-outlined text-[18px]">
                  handyman
                </span>
                In Vorbereitung
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                We&apos;re under construction
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 font-medium text-slate-500">
                Unser Support-Bereich wird gerade ausgebaut. Schon bald können
                Sie hier direkt Anliegen senden, Probleme melden und Antworten
                zu Ihren Services erhalten.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Geplant
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-700">
                    Problem melden
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Geplant
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-700">
                    Direkte Kontaktanfragen
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                Vielen Dank — wir bringen diesen Bereich gerade zum Glänzen.
              </div>
            </div>

            {/* Illustration */}
            <div className="order-1 flex justify-center lg:order-2">
              <div className="relative w-full max-w-[420px]">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-100 blur-2xl" />

                <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-slate-50 p-8 shadow-inner">
                  {/* Window */}
                  <div className="relative mx-auto w-[260px] rounded-[2rem] border border-slate-200 bg-white p-4 shadow-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-24 rounded-2xl bg-gradient-to-br from-sky-50 to-white" />
                      <div className="h-24 rounded-2xl bg-gradient-to-br from-sky-50 to-white" />
                      <div className="h-24 rounded-2xl bg-gradient-to-br from-sky-50 to-white" />
                      <div className="h-24 rounded-2xl bg-gradient-to-br from-sky-50 to-white" />
                    </div>

                    <div className="pointer-events-none absolute left-6 top-8 h-[190px] w-8 rotate-12 rounded-full bg-white/60 blur-md" />
                  </div>

                  {/* Squeegee */}
                  <div className="absolute left-12 top-24 w-[190px] rotate-[-8deg]">
                    <div className="ml-20 h-16 w-2 rounded-full bg-slate-400" />
                    <div className="h-4 w-32 rounded-full bg-emerald-600 shadow-md shadow-emerald-200" />
                  </div>

                  {/* Water drops */}
                  <div className="absolute bottom-10 right-10 space-y-2">
                    <div className="h-3 w-3 animate-bounce rounded-full bg-sky-300 [animation-duration:1.5s]" />
                    <div className="ml-5 h-2.5 w-2.5 animate-pulse rounded-full bg-blue-200" />
                    <div className="ml-2 h-3 w-3 animate-bounce rounded-full bg-sky-200 [animation-duration:1.8s]" />
                  </div>

                  <div className="absolute right-6 top-6 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-700 shadow-sm">
                    Polishing support
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}