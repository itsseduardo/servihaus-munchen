import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // 1. SERVICIOS HOY Y ALERTAS
    const [servicesToday, unassignedServices, inventoryAlerts] = await Promise.all([
      prisma.service.count({ where: { date: { gte: today, lt: tomorrow } } }),
      prisma.service.count({ where: { date: { gte: today }, assignments: { none: {} } } }),
      // 🔥 ESTO ES NUEVO: Buscamos inventarios de clientes que estén en 0
      prisma.clientInventory.findMany({
        where: { quantity: { lte: 0 } },
        include: { client: true, product: true }
      })
    ]);

    // 2. OCUPACIÓN Y TOP EMPLEADOS
    const employees = await prisma.employee.findMany({
      include: {
        assignments: {
          include: { service: true },
          where: { service: { date: { gte: startOfWeek } } }
        }
      }
    });

    const workload = employees.map(emp => {
      const weekHours = emp.assignments.reduce((sum, a) => sum + (a.service.teamDuration || 0), 0);
      const todayHours = emp.assignments
        .filter(a => a.service.date >= today && a.service.date < tomorrow)
        .reduce((sum, a) => sum + (a.service.teamDuration || 0), 0);

      return {
        name: `${emp.firstName}`,
        weekHours,
        todayHours,
        availableToday: (emp.contractedHoursPerWeek || 40) / 5
      };
    });

    const totalCapacityToday = workload.reduce((sum, e) => sum + e.availableToday, 0);
    const totalAssignedToday = workload.reduce((sum, e) => sum + e.todayHours, 0);
    const occupancyToday = totalCapacityToday > 0 ? (totalAssignedToday / totalCapacityToday) * 100 : 0;

    // 3. TOP CLIENTES Y PRECISIÓN
    const recentServices = await prisma.service.findMany({
      where: { date: { gte: startOfWeek } },
      include: { client: true }
    });

    const clientMap: Record<string, number> = {};
    let totalEstimated = 0;
    let totalReal = 0;
    let completedCount = 0;

    recentServices.forEach(s => {
      clientMap[s.client.name] = (clientMap[s.client.name] || 0) + 1;
      if (s.actualStartTime && s.actualEndTime) {
        const real = (s.actualEndTime.getTime() - s.actualStartTime.getTime()) / (1000 * 60 * 60);
        totalEstimated += (s.teamDuration || 0);
        totalReal += real;
        completedCount++;
      }
    });

    const topClients = Object.entries(clientMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const precision = completedCount > 0 ? (totalReal / totalEstimated) * 100 : 100;

    // 4. COMPARATIVA MENSUAL
    const [thisMonthCount, lastMonthCount] = await Promise.all([
      prisma.service.count({ where: { date: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } } }),
      prisma.service.count({ where: { date: { gte: startOfLastMonth, lte: endOfLastMonth } } })
    ]);

    return NextResponse.json({
      kpis: {
        servicesToday,
        occupancyToday: Math.round(occupancyToday),
        totalWeekHours: workload.reduce((sum, e) => sum + e.weekHours, 0),
        unassignedAlerts: unassignedServices,
        growth: lastMonthCount > 0 ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100) : 0,
        precision: Math.round(precision)
      },
      topClients,
      topEmployees: workload.sort((a, b) => b.weekHours - a.weekHours).slice(0, 5),
      inventoryAlerts
    });
  } catch (error) {
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}