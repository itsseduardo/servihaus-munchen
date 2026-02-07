export default function JobDetailKeyInfo() {
  return (
    <div className="p-6">
      <h3 className="text-[#111418] dark:text-white text-sm font-bold uppercase tracking-wider mb-3">
        Key Instructions
      </h3>

      <div className="flex flex-col gap-1 rounded-lg border-l-4 border-primary bg-primary/5 p-4 dark:bg-primary/10">
        <p className="text-primary text-base font-bold leading-tight flex items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20 }}
          >
            info
          </span>
          Pick up at neighbor No. 4
        </p>

        <p className="text-[#617589] dark:text-gray-300 text-sm font-normal ml-7">
          Access instructions from client – use the side gate after retrieving
          the key.
        </p>
      </div>
    </div>
  );
}
