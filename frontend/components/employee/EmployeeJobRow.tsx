export default function EmployeeJobRow({
    onView,
}: {
    onView: () => void;
}) {
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-5">
                <span className="text-lg font-black text-slate-900">
                    09:00 - 11:00
                </span>
            </td>

            <td className="px-6 py-5">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase border border-blue-100">
                    Upcoming
                </span>
            </td>

            <td className="px-6 py-5">
                <span className="font-bold text-slate-900">SH-9942</span>
            </td>

            <td className="px-6 py-5">
                <div className="flex flex-col">
                    <span className="font-medium">Berliner Str. 142</span>
                    <span className="text-xs text-slate-500">
                        10115 Berlin
                    </span>
                </div>
            </td>

            <td className="px-6 py-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-100">
                    <span className="material-symbols-outlined text-sm font-bold">
                        key
                    </span>
                    <span className="text-xs font-bold uppercase">
                        Key Required
                    </span>
                </div>
            </td>

            <td className="px-6 py-5 text-right">
                <div className="flex justify-end gap-2">
                    <button className="p-2 text-slate-500 hover:text-primary border border-slate-200 rounded-lg transition-all">
                        <span className="material-symbols-outlined">
                            directions
                        </span>
                    </button>
                    <button
                        onClick={onView}
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm"
                    >
                        View Details
                    </button>

                </div>
            </td>
        </tr>
    );
}
