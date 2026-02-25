"use client";

type Job = {
  id: string;
  client: string;
  status: "Completed" | "In Progress" | "Scheduled";
  revenue: string;
  date: string;
};

const jobs: Job[] = [
  {
    id: "SH-1024",
    client: "Müller GmbH",
    status: "Completed",
    revenue: "€450,00",
    date: "12.10.2023",
  },
  {
    id: "SH-1025",
    client: "Schmidt & Sohn",
    status: "In Progress",
    revenue: "€1.200,00",
    date: "13.10.2023",
  },
  {
    id: "SH-1026",
    client: "Bauer AG",
    status: "Scheduled",
    revenue: "€850,00",
    date: "14.10.2023",
  },
];

function getStatusStyles(status: Job["status"]) {
  switch (status) {
    case "Completed":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "In Progress":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "Scheduled":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    default:
      return "";
  }
}

export default function AdminRecentJobsTable() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#dbdee6] dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-[#dbdee6] dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-lg">
          Recent Service Jobs
        </h3>

        <button className="text-sm text-[#616b89] hover:text-primary transition-colors flex items-center gap-1 font-semibold">
          View List
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-[#616b89] text-[10px] uppercase font-bold tracking-widest">
              <th className="px-6 py-4">Service ID</th>
              <th className="px-6 py-4">Client Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Revenue</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-bold">
                  {job.id}
                </td>

                <td className="px-6 py-4 text-sm">
                  {job.client}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusStyles(
                      job.status
                    )}`}
                  >
                    {job.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {job.revenue}
                </td>

                <td className="px-6 py-4 text-sm text-[#616b89]">
                  {job.date}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
