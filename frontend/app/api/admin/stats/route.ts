import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subDays } from "date-fns"
import { de } from "date-fns/locale"

export async function GET() {
  try {
    // 1. CONTEOS BÁSICOS (KPIs)
    const [totalServices, totalEmployees, totalClients, zClients, openServices] = await Promise.all([
      prisma.service.count(),
      prisma.employee.count(),
      prisma.client.count(),
      prisma.client.count({ where: { category: 'Z' } }),
      prisma.service.count({ where: { status: { in: ['assigned', 'in_progress'] } } })
    ])

    // 2. CÁLCULO DE INGRESOS Y HORAS TOTALES (Servicios completados)
    const completedServices = await prisma.service.findMany({
      where: { status: 'completed' },
      include: { serviceCode: true }
    })

    let totalPaidHours = 0
    let estimatedRevenue = 0

    completedServices.forEach(s => {
      // Sumamos duración + tiempo de viaje (en horas)
      const hours = (s.duration || 0) + ((s.travelTime || 0) / 60)
      totalPaidHours += hours
      
      // Ingreso = Horas facturadas al cliente * Precio del código de servicio
      if (s.serviceCode) {
        estimatedRevenue += (s.billedHours || 0) * s.serviceCode.pricePerHour
      }
    })

    // 3. DATOS PARA EL GRÁFICO DE BARRAS (Últimos 7 días)
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    })

    const servicesByDay = await prisma.service.findMany({
      where: {
        date: { gte: subDays(new Date(), 7) }
      }
    })

    const barData = last7Days.map(day => {
      const count = servicesByDay.filter(s => 
        format(new Date(s.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      ).length
      return {
        name: format(day, 'eee', { locale: de }),
        servicios: count
      }
    })

    // 4. DATOS PARA EL PIE CHART (Status)
    const statusGroups = await prisma.service.groupBy({
      by: ['status'],
      _count: true
    })

    const statusLabels: Record<string, string> = {
      completed: "Abgeschlossen",
      assigned: "Geplant",
      in_progress: "In Arbeit",
      cancelled: "Storniert"
    }

    const pieData = statusGroups.map(group => ({
      name: statusLabels[group.status] || group.status,
      value: group._count
    }))

    // 5. EMPLEADOS CON HORAS FALTANTES (FEHLSTUNDEN)
    // Calculamos el balance de la semana actual para todos
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    const end = endOfWeek(new Date(), { weekStartsOn: 1 })

    const employees = await prisma.employee.findMany({
      include: {
        assignments: {
          where: { service: { date: { gte: start, lte: end }, status: 'completed' } },
          include: { service: true }
        },
        timeBlocks: {
          where: { date: { gte: start, lte: end } }
        }
      }
    })

    const underperformingEmployees = employees.map(emp => {
      let worked = 0
      emp.assignments.forEach(a => {
        worked += (a.service.duration || 0) + ((a.service.travelTime || 0) / 60)
      })
      emp.timeBlocks.forEach(tb => { worked += tb.duration })

      const soll = emp.contractedHoursPerWeek || 0
      const diff = soll - worked

      return {
        id: emp.id,
        name: `${emp.lastName}, ${emp.firstName}`,
        soll: soll.toFixed(2),
        ist: worked.toFixed(2),
        diff: diff.toFixed(2)
      }
    }).filter(e => parseFloat(e.diff) > 0) // Solo los que deben horas
      .sort((a, b) => parseFloat(b.diff) - parseFloat(a.diff))
      .slice(0, 5) // Top 5 para no saturar

    return NextResponse.json({
      kpis: {
        totalServices,
        totalEmployees,
        totalClients,
        zClients,
        openServices,
        totalPaidHours: totalPaidHours.toFixed(1),
        estimatedRevenue: estimatedRevenue.toLocaleString('de-DE')
      },
      barData,
      pieData,
      underperformingEmployees,
      // Data dummy para la línea de tendencia (se puede implementar real luego)
      lineData: [
        { name: 'KW 10', valor: 2100 },
        { name: 'KW 11', valor: 2400 },
        { name: 'KW 12', valor: 1900 },
        { name: 'KW 13', valor: 3200 },
      ]
    })

  } catch (error) {
    console.error("STATS API ERROR:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}