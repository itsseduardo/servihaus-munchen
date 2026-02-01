export default function JobDetailAddress() {
  return (
    <div className="p-6 border-b border-[#dbe0e6] dark:border-gray-800">
      <div className="flex items-start gap-4 justify-between">
        <div className="flex items-start gap-3">
          <div className="text-primary mt-1">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 24 }}
            >
              map
            </span>
          </div>

          <div className="flex flex-col">
            <p className="text-[#111418] dark:text-white text-base font-semibold leading-snug">
              123 Service St, City, State 12345
            </p>
            <p className="text-[#617589] dark:text-gray-400 text-sm font-normal">
              Full Service Address
            </p>
          </div>
        </div>

        <button className="flex shrink-0 items-center justify-center gap-2 rounded-lg h-9 px-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-bold">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 18 }}
          >
            directions
          </span>
          Open in Maps
        </button>
      </div>
    </div>
  );
}
