export default function JobDetailFooter() {
  return (
    <div className="p-6 border-t border-[#dbe0e6] dark:border-gray-800 bg-white dark:bg-background-dark flex gap-3">
      {/* Edit */}
      <button className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-[#dbe0e6] dark:border-gray-700 text-[#111418] dark:text-white text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 20 }}
        >
          edit
        </span>
        Edit Job
      </button>

      {/* Complete */}
      <button className="flex-[1.5] flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 20 }}
        >
          check_circle
        </span>
        Mark as Complete
      </button>
    </div>
  );
}
