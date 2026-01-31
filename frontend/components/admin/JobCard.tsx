type JobStatus = "confirmed" | "pending" | "on_route" | "completed";

interface JobCardProps {
  code: string;
  time: string;
  address: string;
  status: JobStatus;
  employees?: string[];
  requiresKey?: boolean;
}

export default function JobCard({
  code,
  time,
  address,
  status,
  employees = [],
  requiresKey,
}: JobCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-[#dbe0e6] dark:border-gray-800 job-card-border hover:shadow-md transition-shadow cursor-pointer">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-extrabold text-primary">
          {code}
        </span>
        <StatusBadge status={status} />
      </div>

      {/* Body */}
      <p className="text-xs font-bold mb-1">{time}</p>
      <p className="text-xs text-[#617589] mb-3 line-clamp-1">
        {address}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {employees.map((_, idx) => (
            <div
              key={idx}
              className="size-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-300"
            />
          ))}
        </div>

        {requiresKey && (
          <span
            className="material-symbols-outlined text-[16px] text-amber-500"
            title="Key Access Required"
          >
            vpn_key
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const map = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    on_route: "bg-blue-100 text-blue-700",
    completed: "bg-gray-100 text-gray-700",
  };

  const label = {
    confirmed: "Confirmed",
    pending: "Pending",
    on_route: "On Route",
    completed: "Completed",
  };

  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}
