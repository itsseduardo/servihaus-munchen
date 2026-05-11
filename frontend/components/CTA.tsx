export default function CTA() {
  return (
    <section className="px-4 md:px-20 lg:px-40 py-16 bg-primary/5 dark:bg-primary/10">
      <div className="max-w-240 mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#111418] dark:text-white mb-6">
          Bereit für ein sauberes und sicheres Zuhause?
        </h2>
        <p className="text-lg text-[#617589] dark:text-gray-300 mb-8 max-w-150 mx-auto">
          Kontaktieren Sie uns noch heute für ein unverbindliches Angebot.
          Unser Team freut sich auf Ihre Anfrage.
        </p>
        <a
          href="mailto:josevc@servihausmunchen.de?subject=Anfrage%20%C3%BCber%20ServiHaus%20M%C3%BCnchen&body=Hallo%20ServiHaus%20M%C3%BCnchen%2C%0A%0Aich%20m%C3%B6chte%20eine%20Anfrage%20senden.%0A%0AMein%20Name%3A%0ATelefon%3A%0AAdresse%3A%0AGew%C3%BCnschte%20Leistung%3A%0AWunschtermin%3A%0A%0AVielen%20Dank."
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
        >
          <span className="material-symbols-outlined text-xl">mail</span>
          Anfrage senden
        </a>
      </div>
    </section>
  );
}
