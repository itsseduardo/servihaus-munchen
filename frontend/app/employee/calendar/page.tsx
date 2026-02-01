"use client";

import { useState } from "react";
import EmployeeCalendarHeader from "@/components/employee/EmployeeCalendarHeader";
import EmployeeJobsTable from "@/components/employee/EmployeeJobsTable";
import JobDetailPanel from "@/components/job/JobDetailPanel";

export default function EmployeeCalendarPage() {
  const [openJob, setOpenJob] = useState<string | null>(null);

  return (
    <>
      <EmployeeCalendarHeader />

      <div className="p-10">
        <EmployeeJobsTable onViewJob={(id) => setOpenJob(id)} />
      </div>

      {openJob && (
        <JobDetailPanel onClose={() => setOpenJob(null)} />
      )}
    </>
  );
}
