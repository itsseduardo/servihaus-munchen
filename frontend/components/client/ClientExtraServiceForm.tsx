export default function ClientExtraServiceForm() {
  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e5e7eb] dark:border-[#2d3748] shadow-sm sticky top-24">
      
      {/* Header */}
      <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2d3748]">
        <h3 className="text-lg font-bold">Book Extra Service</h3>
        <p className="text-[#617589] dark:text-gray-400 text-sm">
          Add a specialized task to your schedule.
        </p>
      </div>

      {/* Form */}
      <form className="p-6 space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold">Service Type</label>
          <select className="rounded-lg border-[#e5e7eb] dark:border-gray-700 dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary">
            <option>Window Cleaning</option>
            <option>Kitchen Deep Clean</option>
            <option>Outdoor Power Wash</option>
            <option>Laundry & Ironing</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold">Preferred Date</label>
          <input
            type="date"
            className="rounded-lg border-[#e5e7eb] dark:border-gray-700 dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold">Time Window</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer">
              <input type="radio" name="time" className="peer hidden" defaultChecked />
              <div className="text-center p-2 text-xs font-bold border rounded-lg peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary">
                Morning
              </div>
            </label>

            <label className="cursor-pointer">
              <input type="radio" name="time" className="peer hidden" />
              <div className="text-center p-2 text-xs font-bold border rounded-lg peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary">
                Afternoon
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold">Special Notes</label>
          <textarea
            rows={3}
            placeholder="Any specific instructions..."
            className="rounded-lg border-[#e5e7eb] dark:border-gray-700 dark:bg-gray-800 text-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          className="w-full h-11 bg-primary text-white text-sm font-bold rounded-lg shadow-md hover:bg-primary/90 transition-all"
        >
          Submit Request
        </button>
      </form>

      {/* Footer note */}
      <div className="px-6 pb-6 text-center">
        <div className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-xs font-bold text-[#617589] dark:text-gray-400">
            All professionals are background checked
          </span>
        </div>
      </div>
    </div>
  );
}
