export default function TrustStats() {
  return (
    <section className="px-4 md:px-20 lg:px-40 py-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-wrap gap-6 justify-center">
          <Stat
            icon="verified_user"
            label="Zertifiziert"
            value="TÜV Nord"
          />
          <Stat
            icon="thumb_up"
            label="Zuverlässig"
            value="100% Garantie"
          />
          <Stat
            icon="security"
            label="Versichert"
            value="10 Mio. € Schutz"
          />
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-[240px] flex-1 flex-col items-center text-center gap-3 rounded-xl p-8 border border-[#dbe0e6] dark:border-gray-800 bg-white dark:bg-background-dark/50 shadow-sm">
      <span className="material-symbols-outlined text-primary text-4xl mb-2">
        {icon}
      </span>
      <p className="text-sm font-semibold uppercase tracking-wider text-[#617589] dark:text-gray-400">
        {label}
      </p>
      <p className="text-3xl font-extrabold tracking-tight text-[#111418] dark:text-white">
        {value}
      </p>
    </div>
  );
}
