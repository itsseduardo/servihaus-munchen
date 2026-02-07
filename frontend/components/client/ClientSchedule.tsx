export default function ClientSchedule() {
  return (
    <div className="bg-white dark:bg-[#1a202c] rounded-xl border border-[#e5e7eb] dark:border-[#2d3748] shadow-sm overflow-hidden">
      
      {/* Card header */}
      <div className="p-6 border-b border-[#e5e7eb] dark:border-[#2d3748] flex items-center justify-between">
        <h3 className="font-bold text-lg">Your Schedule</h3>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <span className="text-base font-bold px-2">October 2023</span>

          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6">
        {/* Days header */}
        <div className="grid grid-cols-7 mb-2 text-center text-[#617589] dark:text-gray-400 font-bold text-xs uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          <div className="h-24 p-2 text-gray-300">24</div>
          <div className="h-24 p-2 text-gray-300">25</div>
          <div className="h-24 p-2 text-gray-300">26</div>
          <div className="h-24 p-2 text-gray-300">27</div>
          <div className="h-24 p-2 text-gray-300">28</div>
          <div className="h-24 p-2 text-gray-300">29</div>
          <div className="h-24 p-2 text-gray-300">30</div>

          <div className="h-24 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">1</div>
          <div className="h-24 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">2</div>
          <div className="h-24 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">3</div>
          <div className="h-24 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">4</div>

          <div className="h-24 p-2 border border-primary/20 bg-primary/5 dark:bg-primary/10 rounded-lg relative">
            <span className="font-bold text-primary">5</span>
            <div className="mt-1 px-1.5 py-0.5 bg-primary text-white text-[10px] rounded leading-tight">
              General Clean
            </div>
          </div>

          <div className="h-24 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">6</div>
          <div className="h-24 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">7</div>

          <div className="h-24 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">23</div>

          <div className="h-24 p-2 border border-primary/20 bg-primary/5 dark:bg-primary/10 rounded-lg relative">
            <span className="font-bold text-primary">24</span>
            <div className="mt-1 px-1.5 py-0.5 bg-primary text-white text-[10px] rounded leading-tight">
              Deep Clean
            </div>
          </div>

          <div className="h-24 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">25</div>
          <div className="h-24 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">26</div>
        </div>
      </div>
    </div>
  );
}
