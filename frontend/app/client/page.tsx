"use client";

import ClientTopbar from "@/components/client/ClientTopbar";
import ClientHeader from "@/components/client/ClientHeader";
import ClientSchedule from "@/components/client/ClientSchedule";
import ClientUpcomingVisits from "@/components/client/ClientUpcomingVisits";
import ClientHistory from "@/components/client/ClientHistory";
import ClientExtraServiceForm from "@/components/client/ClientExtraServiceForm";

export default function ClientPortalPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      <ClientTopbar />

      <main className="max-w-[1280px] mx-auto px-6 lg:px-40 py-8">
        <ClientHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT / CENTER */}
          <div className="lg:col-span-2 space-y-8">
            <ClientSchedule />
            <ClientUpcomingVisits />
            <ClientHistory />
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-1">
            <ClientExtraServiceForm />
          </div>
        </div>
      </main>
    </div>
  );
}
