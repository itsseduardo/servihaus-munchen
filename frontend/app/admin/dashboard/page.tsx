"use client";


import AdminDashboardHeader from "@/components/admin/dashboard/AdminDashboardHeader";
import AdminStatsGrid from "@/components/admin/dashboard/AdminStatsGrid";
import AdminRevenueChart from "@/components/admin/dashboard/AdminRevenueChart";
import AdminServicesChart from "@/components/admin/dashboard/AdminServicesChart";
import AdminTopEmployees from "@/components/admin/dashboard/AdminTopEmployees";
import AdminRecentJobsTable from "@/components/admin/dashboard/AdminRecentJobsTable";

export default function AdminDashboardPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display text-[#111318] dark:text-white">
      
      <div className="flex">
        

        <main className="flex-1 ml-64 p-8 space-y-8">
          
          <AdminDashboardHeader />

          <AdminStatsGrid />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminRevenueChart />
            <AdminServicesChart />
            <AdminTopEmployees />
          </div>

          <AdminRecentJobsTable />

        </main>
      </div>
    </div>
  );
}
