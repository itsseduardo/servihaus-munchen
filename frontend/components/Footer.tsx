export default function Footer() {
  return (
    <footer className="bg-white dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 px-4 md:px-20 lg:px-40 py-12">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <div className="flex items-center gap-2 text-primary mb-6">
            <h2 className="text-lg font-bold text-[#111418] dark:text-white">
              ServiHausMünchen
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ihr Partner für qualifizierte Dienstleistungen rund ums Haus.
            Regional verwurzelt, professionell ausgeführt.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-6">Navigation</h4>
          <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <li><a className="hover:text-primary" href="#">Leistungen</a></li>
            <li><a className="hover:text-primary" href="#">Preise</a></li>
            <li><a className="hover:text-primary" href="#">Über uns</a></li>
            <li><a className="hover:text-primary" href="#">Karriere</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Rechtliches</h4>
          <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <li><a className="hover:text-primary" href="#">Impressum</a></li>
            <li><a className="hover:text-primary" href="#">Datenschutz</a></li>
            <li><a className="hover:text-primary" href="#">AGB</a></li>
            <li><a className="hover:text-primary" href="#">Cookies</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Kontakt</h4>
          <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <li>📞 +49 (0) 123 456789</li>
            <li>✉️ info@servihouse.de</li>
            <li>📍 Einsteinstrße 2, Planneg, Munchën</li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 flex justify-between">
        <p>© 2026 ServiHausMunchen. Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  );
}
