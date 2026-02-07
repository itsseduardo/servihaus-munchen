export default function ClientHistory() {
  return (
    <div>
      <h2 className="text-[#111418] dark:text-white text-xl font-bold leading-tight px-1 pb-4">
        Recent History
      </h2>

      <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e5e7eb] dark:border-[#2d3748] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-xs font-bold text-[#617589] dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Service</th>
              <th className="px-6 py-3">Pro</th>
              <th className="px-6 py-3 text-right">Invoice</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f0f2f4] dark:divide-[#2d3748]">
            <tr className="text-sm">
              <td className="px-6 py-4">Sep 15, 2023</td>
              <td className="px-6 py-4 font-medium">Standard Cleaning</td>
              <td className="px-6 py-4">Sarah</td>
              <td className="px-6 py-4 text-right text-primary font-bold">
                <a href="#">$120.00</a>
              </td>
            </tr>

            <tr className="text-sm">
              <td className="px-6 py-4">Aug 28, 2023</td>
              <td className="px-6 py-4 font-medium">Carpet Steam Clean</td>
              <td className="px-6 py-4">Marcus</td>
              <td className="px-6 py-4 text-right text-primary font-bold">
                <a href="#">$85.00</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
