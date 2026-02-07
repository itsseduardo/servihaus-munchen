export default function ClientUpcomingVisits() {
  return (
    <div>
      <h2 className="text-[#111418] dark:text-white text-xl font-bold leading-tight px-1 pb-4">
        Upcoming Visits
      </h2>

      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e5e7eb] dark:border-[#2d3748] shadow-sm divide-y divide-[#f0f2f4] dark:divide-[#2d3748]">
        
        {/* Visit 1 */}
        <div className="flex items-center gap-4 px-6 py-4 justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center gap-4">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full h-14 w-14 border border-gray-100 dark:border-gray-700"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDg3Qk25Y6TJjI-F5jnNpktEtTFtHUhGl_N34TAO9exK04TAh-MVH8w9M50uIyIyEF9uhSz6ucq_UavHdVyFUAbhuywblT0JD5YIDWg7lqbTSU2DqXRCPM1VNdCh9pvn6Wcfq350L8zkqsBg5sLAYYc0mp93SpIFltE8VV4Dvvy07xH4QRuUvZCd8GFjzYaJ0tJtUN_xiwmuL86GAdAnbg_jcQ_bD2EM3rmDWM0W_ND2hE7R4LJs8LqsTP0X813VEQ8_4IaBi0Y-HY")',
              }}
            />

            <div className="flex flex-col">
              <p className="text-[#111418] dark:text-white text-base font-bold">
                Deep Cleaning — Sarah
              </p>
              <p className="text-[#617589] dark:text-gray-400 text-sm">
                Tuesday, Oct 24 • 09:00 AM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-full">
              Confirmed
            </span>

            <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-[#f0f2f4] dark:bg-gray-700 text-[#111418] dark:text-white text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Details
            </button>
          </div>
        </div>

        {/* Visit 2 */}
        <div className="flex items-center gap-4 px-6 py-4 justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center gap-4">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full h-14 w-14 border border-gray-100 dark:border-gray-700"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDl26ekVezw_GnzwU1ZqRo0IVXtQVCYea08vrD-w_3SR6oTEYFtnE4lZQQyjxsEUR8z5s9QTQIGk33QOBHIK7Bk2BX1fcSjsV4M8MPVcxokgjTAj1X3A9gyrYm8G8a5bBraCzQyAGEeXKYdzyEHVGN8I7aLktuy_5KXdWiD1KMvesQdmhNfN6MKH7q0nDhtvM7bxh39SajOFBMJ9La5MT9e2gLFlM5GpwbtzAlZ3W_fp_gifjNcJHX1eBkfoO67_uPVlpT8czL8edY")',
              }}
            />

            <div className="flex flex-col">
              <p className="text-[#111418] dark:text-white text-base font-bold">
                Window Maintenance — Marcus
              </p>
              <p className="text-[#617589] dark:text-gray-400 text-sm">
                Friday, Nov 3 • 02:30 PM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold rounded-full">
              Upcoming
            </span>

            <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-[#f0f2f4] dark:bg-gray-700 text-[#111418] dark:text-white text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Details
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
