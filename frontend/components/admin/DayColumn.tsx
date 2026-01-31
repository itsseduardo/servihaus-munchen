import JobCard from "@/components/admin/JobCard";

interface Job {
  code: string;
  time: string;
  address: string;
  status: "confirmed" | "pending" | "on_route" | "completed";
  employees?: string[];
  requiresKey?: boolean;
}

export default function DayColumn({ jobs }: { jobs?: Job[] }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="bg-[#f0f2f4]/50 dark:bg-gray-900/50 h-32 rounded-xl flex items-center justify-center">
          <p className="text-[10px] font-bold text-[#617589] uppercase tracking-widest">
            No Services
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {jobs.map((job) => (
        <JobCard key={job.code} {...job} />
      ))}

      {/* Add Job placeholder */}
      <div className="border-2 border-dashed border-[#dbe0e6] dark:border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-[#f0f2f4]/30 transition-colors cursor-pointer group">
        <span className="material-symbols-outlined text-[#617589] group-hover:text-primary">
          add_circle
        </span>
        <span className="text-[10px] font-bold text-[#617589] uppercase tracking-tighter">
          Add Job
        </span>
      </div>
    </div>
  );
}
