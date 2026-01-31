import AdminCalendarTopbar from "@/components/admin/AdminCalendarTopbar";
import JobCard from "@/components/admin/JobCard";

export default function AdminCalendarPage() {
  return (
    <>
      <AdminCalendarTopbar />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-7 gap-4">
          {/* Monday */}
          <div className="flex flex-col gap-3">
            <JobCard
              code="SH-1024"
              time="08:00 - 10:30"
              address="452 Baker St, London"
              status="confirmed"
              employees={["a", "b"]}
              requiresKey
            />

            <JobCard
              code="SH-1029"
              time="11:00 - 13:00"
              address="12 Royal Oak Dr."
              status="on_route"
              employees={["a"]}
            />
          </div>

          {/* Other days (placeholder) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-[#f0f2f4]/40 dark:bg-gray-900/40 h-32" />
          ))}
        </div>
      </div>
    </>
  );
}
