export default function JobDetailHeader({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#dbe0e6] dark:border-gray-800">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
            Internal Management
          </span>

          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-semibold">
            <span className="size-2 bg-green-500 rounded-full"></span>
            In Progress
          </span>
        </div>

        <h2 className="text-[#111418] dark:text-white text-xl font-extrabold leading-tight mt-1">
          C-8842 – Job Details
        </h2>
      </div>

      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-[#617589]"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
