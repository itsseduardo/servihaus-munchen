export default function JobDetailNotes() {
  return (
    <div className="px-6 pb-8">
      <h3 className="text-[#111418] dark:text-white text-sm font-bold uppercase tracking-wider mb-3">
        Job Notes
      </h3>

      <div className="flex flex-col gap-4">
        {/* Existing note */}
        <div className="p-4 bg-background-light dark:bg-gray-800/30 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[#111418] dark:text-white text-xs font-bold">
              Admin Update
            </p>
            <p className="text-[#617589] dark:text-gray-400 text-[10px]">
              2 hours ago
            </p>
          </div>

          <p className="text-[#111418] dark:text-gray-300 text-sm font-normal">
            Customer requested additional cleaning for the outdoor patio area.
            Adjusted duration by 30 mins.
          </p>
        </div>

        {/* Add note */}
        <textarea
          className="w-full rounded-lg border-[#dbe0e6] dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-primary focus:border-primary placeholder:text-gray-400"
          placeholder="Add a private note..."
          rows={3}
        />
      </div>
    </div>
  );
}
