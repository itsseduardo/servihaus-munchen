"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from "recharts"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  // Estilos de colores para el PieChart (Estado de servicios)
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]

  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Lade Dashboard...</p>
    </div>
  )

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen text-slate-900">
      
      {/* 1. HEADER EMPRESARIAL */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Unternehmens-Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium italic">Echtzeit-Analyse & Betriebssteuerung</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Letztes Update</p>
          <p className="text-xs font-bold">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* 2. KPI CARDS - 5 COLUMNAS (Para que no se amontonen) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Services Gesamt", value: stats?.kpis.totalServices || "0", color: "text-blue-600" },
          { label: "Mitarbeiter", value: stats?.kpis.totalEmployees || "0", color: "text-slate-800" },
          { label: "Kunden Aktiv", value: stats?.kpis.totalClients || "0", color: "text-slate-800" },
          { label: "Umsatz (Est.)", value: `${stats?.kpis.estimatedRevenue || 0} €`, color: "text-emerald-600" },
          { label: "Bezahlte Std.", value: `${stats?.kpis.totalPaidHours || 0}h`, color: "text-amber-600" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{kpi.label}</p>
            <p className={`text-2xl font-black mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* 3. SECCIÓN PRINCIPAL - GRID MIXTO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA (2/3) - EL GRÁFICO DE BARRAS Y LA TABLA CRÍTICA */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Gráfico de Barras: Servicios por Día */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Tägliche Auslastung (Servicios)</h2>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.barData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="servicios" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TABLA DE "FEHLSTUNDEN" (Justificables) - Vital para José */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b bg-rose-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-rose-700">Achtung: Fehlstunden</h2>
                <p className="text-[10px] text-rose-500 font-bold uppercase mt-1">Mitarbeiter unter Soll-Stunden</p>
              </div>
              <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-lg text-[10px] font-black">HANDLUNGSBEDARF</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <tr>
                  <th className="px-8 py-4 text-left">Mitarbeiter</th>
                  <th className="px-8 py-4 text-center">Soll (Woche)</th>
                  <th className="px-8 py-4 text-center">Ist (Real)</th>
                  <th className="px-8 py-4 text-right text-rose-600">Differenz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {stats?.underperformingEmployees.map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 text-slate-700">{emp.name}</td>
                    <td className="px-8 py-4 text-center text-slate-400 font-medium">{emp.soll}h</td>
                    <td className="px-8 py-4 text-center">{emp.ist}h</td>
                    <td className="px-8 py-4 text-right text-rose-600">-{emp.diff}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COLUMNA DERECHA (1/3) - PIE CHART Y MONITORES RÁPIDOS */}
        <div className="space-y-8">
          
          {/* Gráfico de Pastel: Status */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-8">Service-Status</h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.pieData || []}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats?.pieData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: '800', textTransform: 'uppercase'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monitor de Categoría Z */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 border-b pb-4">Risiko-Monitor</h2>
            <div className="flex justify-between items-center p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <span className="text-[10px] font-black text-rose-700 uppercase">Gesperrte Kunden (Z)</span>
              <span className="text-2xl font-black text-rose-700">{stats?.kpis.zClients}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <span className="text-[10px] font-black text-blue-700 uppercase">Offene Services</span>
              <span className="text-2xl font-black text-blue-700">{stats?.kpis.openServices}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. SECCIÓN INFERIOR - EVOLUCIÓN (LÍNEA) */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-8">Umsatzentwicklung (Tendenz)</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.lineData || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={4} dot={{r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}