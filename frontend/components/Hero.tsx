export default function Hero() {
  return (
    <section className="px-4 md:px-20 lg:px-40 py-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="min-h-[520px] flex flex-col items-center justify-center gap-8 rounded-xl p-8 relative overflow-hidden shadow-2xl bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('servihauslogo.jpeg')",
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
            <a
              href="mailto:josevc@servihausmunchen.de?subject=Angebotsanfrage%20ServiHaus%20M%C3%BCnchen&body=Hallo%20ServiHaus%20M%C3%BCnchen%2C%0A%0Aich%20m%C3%B6chte%20ein%20Angebot%20anfordern.%0A%0AMein%20Name%3A%0ATelefon%3A%0AAdresse%3A%0AGew%C3%BCnschte%20Leistung%3A%0A%0AVielen%20Dank."
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
            >
              Jetzt Angebot anfordern
            </a>
            <button className="min-w-[200px] h-14 rounded-lg bg-white/10 backdrop-blur-md border border-white/30 text-white text-md font-bold hover:bg-white/20 transition-all">
              Unsere Leistungen
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
