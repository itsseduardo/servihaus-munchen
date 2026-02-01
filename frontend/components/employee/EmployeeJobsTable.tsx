import EmployeeJobRow from "./EmployeeJobRow";

export default function EmployeeJobsTable( {
    onViewJob,
}: {
  onViewJob: (jobId: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Time Slot
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Status
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Client ID
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Address
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Key Requirement
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <EmployeeJobRow onView={() => onViewJob("SH-9942")} />
          <EmployeeJobRow onView={() => onViewJob("SH-9942")} />
          <EmployeeJobRow onView={() => onViewJob("SH-9942")} />

        </tbody>
      </table>

      <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
        <span className="text-sm text-slate-500 font-medium">
          Showing all jobs for Oct 23
        </span>
        <div className="flex items-center gap-4">
          <button className="text-primary text-sm font-bold hover:underline">
            Print Schedule
          </button>
          <button className="text-primary text-sm font-bold hover:underline">
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
