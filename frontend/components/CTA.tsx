export default function CTA() {
  return (
    <section className="px-4 md:px-20 lg:px-40 py-16 bg-primary/5 dark:bg-primary/10">
      <div className="max-w-[960px] mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#111418] dark:text-white mb-6">
          Bereit für ein sauberes und sicheres Zuhause?
        </h2>
        <p className="text-lg text-[#617589] dark:text-gray-300 mb-8 max-w-[600px] mx-auto">
          Kontaktieren Sie uns noch heute für ein unverbindliches Angebot.
          Unser Team freut sich auf Ihre Anfrage.
        </p>
        <button className="bg-primary text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
          Anfrage senden
        </button>
      </div>
    </section>
  );
}
