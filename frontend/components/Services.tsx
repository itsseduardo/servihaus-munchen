const services = [
  {
    title: "Unterhaltsreinigung",
    description:
      "Regelmäßige und gründliche Reinigung für private und geschäftliche Räumlichkeiten.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQQ4uE-O9f-huKFmYk3jAHA8TLOVDyEdN29fp20aMegZGKGZnIT3PN9HGq-KRiHD9D6IxEndJKlDmTUo-Vx4UIMPBdtP5pi83gheB9LZIBRXg2c6pFRQSLsK2qLanCc5x5VbwIvZWoNh9R2JQz4bhqtxULy_kn_vdOmqFDDfw56TpWs1F8H-zd677y5pXovBKAN5E6nokjHOdaJfoCtOHKxCYUjA_Tt2HYAmM-jh908jkH2zV1nNukyJUN5e-UAlEtw_DxGAeeFAg",
  },
  {
    title: "Umzugsservice",
    description:
      "Sicherer und stressfreier Transport Ihrer Möbel und Kartons in Ihr neues Zuhause.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0N_jF1xln6hey7nik9fLbYOvfSmAOha-VLefECKLQAFCNkGJdkfO-BPjRGgt4O4mPvQ4E-ySmQsieTy-24AoYUeaL38HKgj2mwickfA5AyNeQhfPg14hFU3MrCfyCYZqPgwkmOMwdW_INHkKqzw__dBwhHAlMkUPgkeVFxOoM3g8dxSu66hV8uPjUjE_oK9I7Nuh4B0ewbRnSnbUjYnNt_e6Wt-lVxVHrxocQUTIp9s6C346ClMsPLA7Ih9GcYfD0sG05Oabl6TM",
  },
  {
    title: "Handwerkerservice",
    description:
      "Kompetente Reparaturen, Montagen und Instandhaltung durch qualifizierte Fachkräfte.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuvuTk7vlzqNtXm73AILbCltYENlbSoNqMLc-eh25qnJZSaK9_G3q2CcvxoA3YCRKM5wCBZe3l1Wwj06Pz1lbLjLZw15rUDHBr78CXHjVV80EFOdYWN8FxFNUwlPIcRbQC_m6CJ8A8rwLI9mg4R6nd_sZ79HsaWNnNFG-LlXp_ss8IZh8BREMtoaBHiNrKrfYpwc1XKIepN_YboHasiFVIvWNB9eHo54BMd5g9X-QVtKK3eZE7dmFsEPxXCkvo3MJ1IWvK6tlfNDw",
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
