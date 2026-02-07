export default function ClientHeader() {
  return (
    <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[#111418] dark:text-white text-3xl font-black tracking-tight">
          Client Service Portal
        </h1>
        <p className="text-[#617589] dark:text-gray-400">
          Welcome back, JESUS! Manage your home service schedule and requests.
        </p>
      </div>

      <button className="h-11 px-6 bg-primary text-white text-sm font-bold rounded-lg shadow-md hover:bg-primary/90">
        Request Change
      </button>
    </div>
  );
}
