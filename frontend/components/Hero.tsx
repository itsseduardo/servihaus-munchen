export default function Hero() {
  return (
    <section className="px-4 md:px-20 lg:px-40 py-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="min-h-[520px] flex flex-col items-center justify-center gap-8 rounded-xl p-8 relative overflow-hidden shadow-2xl bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('')",
          }}
        >
          <div className="max-w-[800px] text-center z-10">
            <h1 className="text-white text-4xl md:text-6xl font-extrabold tracking-tight">
              Professionelle Dienstleistungen für Ihr Zuhause
            </h1>
            <p className="mt-4 text-white/90 text-lg md:text-xl">
              Ihr zuverlässiger Partner für Reinigung, Umzüge und Handwerk in Deutschland.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 z-10">
            <button className="min-w-[200px] h-14 rounded-lg bg-primary text-white text-lg font-bold hover:scale-105 transition-transform">
              Jetzt Angebot anfordern
            </button>
            <button className="min-w-[200px] h-14 rounded-lg bg-white/10 backdrop-blur-md border border-white/30 text-white text-lg font-bold hover:bg-white/20 transition-all">
              Unsere Leistungen
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
