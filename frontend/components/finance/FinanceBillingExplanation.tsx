"use client";

export default function FinanceBillingExplanation() {
  return (
    <div className="bg-white dark:bg-[#1a242f] rounded-lg border border-[#dbe0e6] dark:border-[#2d3748] shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-[#dbe0e6] dark:border-[#2d3748] flex justify-between items-center bg-gray-50 dark:bg-[#2d3748]/30">
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Billing Explanation Panel
        </h3>
        <span className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border dark:border-gray-700">
          RECO-ID: 2023-10-BER-01
        </span>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        
        {/* Base Fee */}
        <div className="flex justify-between items-center py-2 border-b border-[#f0f2f4] dark:border-[#2d3748]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400">
              contract
            </span>
            <span className="font-bold text-sm">
              Regular Monthly Service Fee (SLA-001)
            </span>
          </div>
          <span className="font-mono text-sm">€ 9.800,00</span>
        </div>

        {/* Extras */}
        <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 space-y-3">
          <p className="text-[11px] font-black uppercase text-primary tracking-widest">
            Additional One-off Services
          </p>

          <div className="pl-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#617589]">
                Deep Cleaning (Event Post-op)
              </span>
              <span className="font-mono">+ € 1.250,00</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[#617589]">
                Oven & Kitchen Sanitization
              </span>
              <span className="font-mono">+ € 450,00</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[#617589]">
                Material Adjustments (Floor Waxing)
              </span>
              <span className="font-mono">+ € 950,00</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end pt-4">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-xs text-[#617589]">
              <span>Subtotal</span>
              <span>€ 12.450,00</span>
            </div>

            <div className="flex justify-between text-xs text-[#617589]">
              <span>VAT (19%)</span>
              <span>€ 2.365,50</span>
            </div>

            <div className="flex justify-between text-lg font-black pt-2 border-t-2 border-primary">
              <span>Total Amount</span>
              <span className="text-primary">€ 14.815,50</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
