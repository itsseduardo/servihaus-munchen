const services = [
  {
    title: "Unterhaltsreinigung",
    description:
      "Regelmäßige und gründliche Reinigung für private und geschäftliche Räumlichkeiten.",
    image:
      "",
  },
  {
    title: "Umzugsservice",
    description:
      "Sicherer und stressfreier Transport Ihrer Möbel und Kartons in Ihr neues Zuhause.",
    image:
      "",
  },
  {
    title: "Handwerkerservice",
    description:
      "Kompetente Reparaturen, Montagen und Instandhaltung durch qualifizierte Fachkräfte.",
    image:
      "",
  },
];

export default function Services() {
  return (
    <section className="px-4 md:px-20 lg:px-40 py-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10">
          <h2 className="text-primary text-sm font-bold uppercase tracking-widest mb-2">
            Was wir tun
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-[#111418] dark:text-white">
            Unsere Dienstleistungen
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-2xl bg-white dark:bg-background-dark border hover:border-primary/20 hover:shadow-xl transition-all"
            >
              <div
                className="aspect-[16/10] bg-cover bg-center rounded-t-2xl"
                style={{ backgroundImage: `url(${service.image})` }}
              />
              <div className="p-6">
                <h4 className="text-xl font-bold mb-2 text-[#111418] dark:text-white">
                  {service.title}
                </h4>
                <p className="text-sm text-[#617589] dark:text-gray-400 mb-4">
                  {service.description}
                </p>
                <a className="text-primary text-sm font-bold hover:underline cursor-pointer">
                  Mehr erfahren →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
