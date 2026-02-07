export default function JobDetailTeam() {
  return (
    <div className="px-6 pb-6">
      <h3 className="text-[#111418] dark:text-white text-sm font-bold uppercase tracking-wider mb-4">
        Assigned Team
      </h3>

      <div className="flex flex-col gap-3">
        {/* Team member 1 */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-[#dbe0e6] dark:border-gray-800 bg-white dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="text-[#111418] dark:text-white text-sm font-bold">
                Alex Thompson
              </p>
              <p className="text-[#617589] dark:text-gray-400 text-xs">
                Team Lead
              </p>
            </div>
          </div>

          <span
            className="material-symbols-outlined text-[#617589]"
            style={{ fontSize: 18 }}
          >
            chat
          </span>
        </div>

        {/* Team member 2 */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-[#dbe0e6] dark:border-gray-800 bg-white dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="text-[#111418] dark:text-white text-sm font-bold">
                Sarah Jenkins
              </p>
              <p className="text-[#617589] dark:text-gray-400 text-xs">
                Technician
              </p>
            </div>
          </div>

          <span
            className="material-symbols-outlined text-[#617589]"
            style={{ fontSize: 18 }}
          >
            chat
          </span>
        </div>
      </div>
    </div>
  );
}
