"use client";

import FinanceTopbar from "@/components/finance/FinanceTopbar";
import FinanceAuditFilters from "@/components/finance/FinanceAuditFilters";
import FinanceKpiTotalBilled from "@/components/finance/kpis/FinanceKpiTotalBilled";
import FinanceKpiRegularService from "@/components/finance/kpis/FinanceKpiRegularService";
import FinanceKpiExtras from "@/components/finance/kpis/FinanceKpiExtras";
import FinanceBillingExplanation from "@/components/finance/FinanceBillingExplanation";
import ServiceHistoryTable from "@/components/finance/ServiceHistoryTable";
import FinanceFooter from "@/components/finance/FinanceFooter";
import FinanceHeader from "@/components/finance/FinanceHeader"; 

export default function FinancePage() {
  return (
    <div className="bg-[#f8fafc] dark:bg-background-dark min-h-screen">
      <FinanceTopbar />

      <main className="max-w-[1440px] mx-auto p-6 lg:p-8">
        
        {/* HEADER + BUTTOMS */}
        <div className="mb-8">
          <FinanceHeader />
        </div>

        {/* DASHBOARD GRID: Filtros (4) + KPIs (8) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8 items-stretch">
          <div className="xl:col-span-4 h-full">
            <FinanceAuditFilters />
          </div>

          <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FinanceKpiTotalBilled />
            <FinanceKpiRegularService />
            <FinanceKpiExtras />
          </div>
        </div>

        <div className="space-y-8">
          <FinanceBillingExplanation />
          <ServiceHistoryTable />
        </div>
      </main>

      <FinanceFooter />
    </div>
  );
}