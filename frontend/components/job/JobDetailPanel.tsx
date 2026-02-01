import JobDetailHeader from "./JobDetailHeader";
import JobDetailAddress from "./JobDetailAddress";

export default function JobDetailPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 w-full max-w-[500px] h-screen bg-white dark:bg-background-dark border-l border-[#dbe0e6] dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden">
        
        <JobDetailHeader onClose={onClose} />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <JobDetailAddress />

          {/* siguientes bloques aquí */}
        </div>

        {/* Footer vendrá luego */}
      </div>
    </>
  );
}
