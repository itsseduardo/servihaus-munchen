export default function ClientTopbar() {
    return (
        <header className="flex items-center justify-between border-b border-solid border-[#e5e7eb] dark:border-[#2d3748] bg-white dark:bg-[#1a202c] px-6 lg:px-40 py-3 sticky top-0 z-50">

            {/* Logo */}
            <div className="flex items-center gap-4 text-[#111418] dark:text-white">
                <div className="size-8 text-primary">
                    <svg
                        fill="currentColor"
                        viewBox="0 0 48 48"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            clipRule="evenodd"
                            fillRule="evenodd"
                            d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                        />
                    </svg>
                </div>

                <h2 className="text-lg font-bold leading-tight tracking-tight">
                    ServiHaus
                </h2>
            </div>

            {/* Navigation */}
            <div className="flex flex-1 justify-end gap-8">
                <nav className="hidden md:flex items-center gap-9">
                    <a className="text-sm font-semibold hover:text-primary transition-colors">
                        Dashboard
                    </a>
                    <a className="text-sm font-medium text-[#617589] dark:text-gray-400 hover:text-primary transition-colors">
                        My Services
                    </a>
                    <a className="text-sm font-medium text-[#617589] dark:text-gray-400 hover:text-primary transition-colors">
                        History
                    </a>
                    <a className="text-sm font-medium text-[#617589] dark:text-gray-400 hover:text-primary transition-colors">
                        Support
                    </a>
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-4">
                    <button className="flex size-10 items-center justify-center rounded-lg bg-[#f0f2f4] dark:bg-gray-800 text-[#111418] dark:text-white">
                        <span className="material-symbols-outlined">
                            notifications
                        </span>
                    </button>

                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-primary/20"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDdx6JJcalxZkBd4pGc7lGFhb7YfAZP_WdCnTSHjlx7zDr5EI8gxDeLG0yBFYBwt_YZmO3CUXwjnjaZ3-y6glvzq32qRm-wqjuzkaojoLhRAbvS-vNYa-7zQ2ZiW3s79dowL9WCzB22ZxdVmk8oAH4_dGFB36Efl2SGrQxhVU4mniBuU00xMngUqKrrNStspPHbMPf4eM8G7qdWGzM1_Fg3EC4L9iqQn3C_aolXYRva9BorNvdeAfbWF0pVSE0ghCY83dhNYFXxqf0")',
                        }}
                    />
                </div>
            </div>
        </header>
    );
}
