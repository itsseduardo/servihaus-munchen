"use client"
import { useState, useEffect, useCallback } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDispatching, setIsDispatching] = useState<number | null>(null);

  // Extraemos la carga de datos a una función para poder llamarla después de despachar
  const fetchData = useCallback(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //  NUEVA FUNCIÓN: Despacho de 1-clic
  const handleDispatch = async (clientInventoryId: number, productId: number, productName: string) => {
    // Pedimos que confirme la cantidad a enviar (por defecto 1)
    const qtyStr = window.prompt(`Wie viele Einheiten von "${productName}" möchten Sie liefern? (¿Cuántas unidades enviarás?)`, "1");
    if (!qtyStr) return; // Si cancela

    const quantityDelivered = parseFloat(qtyStr);
    if (isNaN(quantityDelivered) || quantityDelivered <= 0) {
      alert("Ungültige Menge (Cantidad inválida)");
      return;
    }

    setIsDispatching(clientInventoryId);
    try {
      const res = await fetch("/api/admin/inventory/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientInventoryId,
          productId,
          quantityDelivered
        })
      });

      if (res.ok) {
        // Si sale bien, recargamos el dashboard silenciosamente para que desaparezca la alerta
        fetchData();
      } else {
        const err = await res.json();
        alert(`Fehler: ${err.error}`);
      }
    } catch (error) {
      console.error("Error al despachar:", error);
      alert("Error de conexión");
    } finally {
      setIsDispatching(null);
    }
  };

  if (loading || !data) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">sync</span>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Lade Systemdaten...</p>
      </div>
    </div>
  );

  const { kpis, topClients, topEmployees, inventoryAlerts } = data;
  
  // Aseguramos que inventoryAlerts sea un array (por si el backend aún no ha sido actualizado en este milisegundo)
  const alerts = inventoryAlerts || [];

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans">
      
      {/* HEADER CORPORATIVO */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Operatives Dashboard</h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            ServiHaus München <span className="mx-2">•</span> {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </span>
        </div>
      </header>

      {/* BLOQUE 1: KPIs DE IMPACTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Jobs Heute" value={kpis.servicesToday} subtitle="Aktiv im System" icon="event_available" color="bg-blue-600" />
        <KpiCard title="Team Auslastung" value={`${kpis.occupancyToday}%`} subtitle="Verfügbare Kapazität" icon="monitoring" color={kpis.occupancyToday > 90 ? "bg-red-500" : "bg-emerald-500"} />
        <KpiCard title="Wochenvolumen" value={`${kpis.totalWeekHours}h`} subtitle="Geplante Arbeitszeit" icon="schedule" color="bg-indigo-500" />
        <KpiCard title="Achtung (Sin Asignar)" value={kpis.unassignedAlerts} subtitle="Jobs ohne Mitarbeiter" icon="warning" color="bg-orange-500" alert={kpis.unassignedAlerts > 0} />
      </div>

      {/* BLOQUE 2: RENDIMIENTO Y ALERTAS DE INVENTARIO */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        
        {/* GRÁFICO PRINCIPAL */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-black text-slate-800">Mitarbeiter Performance</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Diese Woche</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={topEmployees} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="weekHours" name="Stunden" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🔥 WIDGET DE ALERTAS DE INVENTARIO (Despacho) */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-rose-500">inventory_2</span>
            <h3 className="text-base font-black text-slate-800">Materialbedarf (Alertas)</h3>
            {alerts.length > 0 && (
              <span className="ml-auto bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-xs font-black">{alerts.length}</span>
            )}
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[280px] pr-2 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">check_circle</span>
                <p className="text-sm font-bold">Alles im grünen Bereich</p>
                <p className="text-xs">No hay entregas pendientes.</p>
              </div>
            ) : (
              alerts.map((alert: any) => (
                <div key={alert.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex flex-col gap-3 group hover:bg-rose-50 transition-colors">
                  <div>
                    <p className="text-xs font-black text-rose-600 uppercase tracking-wide">{alert.client?.name}</p>
                    <p className="text-sm font-bold text-slate-800">{alert.product?.name}</p>
                  </div>
                  <button 
                    onClick={() => handleDispatch(alert.id, alert.productId, alert.product?.name)}
                    disabled={isDispatching === alert.id}
                    className="w-full py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-xs font-bold shadow-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDispatching === alert.id ? (
                      <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    )}
                    Liefern (Despachar)
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* BLOQUE 3: TENDENCIAS Y TOP CLIENTES */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* RANKING CLIENTES */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-base font-black text-slate-800 mb-6">Top Kunden (Volumen)</h3>
          <div className="flex-1 space-y-4">
            {topClients.map((client: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    {index + 1}
                  </div>
                  <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{client.name}</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                  {client.count} Jobs
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* METRICAS DE TENDENCIA */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-blue-400 text-sm">precision_manufacturing</span>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zeitpräzision (Geplant vs Ist)</p>
              </div>
              <h4 className="text-5xl font-black text-white mt-2">{kpis.precision}%</h4>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <span className="material-symbols-outlined" style={{ fontSize: '200px' }}>timer</span>
            </div>
          </div>

          <div className={`rounded-2xl p-8 border shadow-sm relative overflow-hidden ${kpis.growth >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-sm ${kpis.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {kpis.growth >= 0 ? 'trending_up' : 'trending_down'}
                </span>
                <p className={`text-xs font-bold uppercase tracking-widest ${kpis.growth >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Wachstum vs Vormonat</p>
              </div>
              <h4 className={`text-5xl font-black mt-2 ${kpis.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {kpis.growth > 0 ? `+${kpis.growth}` : kpis.growth}%
              </h4>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

function KpiCard({ title, value, subtitle, icon, color, alert = false }: any) {
  return (
    <div className={`bg-white p-6 rounded-2xl border ${alert ? 'border-orange-400 ring-4 ring-orange-50' : 'border-slate-200'} shadow-sm flex flex-col justify-between relative overflow-hidden group`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${color} transition-transform group-hover:scale-110`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-500">{subtitle}</p>
      <div className={`absolute bottom-0 left-0 w-full h-1 opacity-20 ${color}`}></div>
    </div>
  );
}