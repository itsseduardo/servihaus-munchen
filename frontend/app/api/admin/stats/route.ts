import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function getWeekRange(date: Date) {
  const start = startOfDay(date)
  const day = start.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day

  start.setDate(start.getDate() + diffToMonday)

  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  return { start, end }
}

function isEmployeeInactiveOnDate(employee: any, dateValue: Date = new Date()) {
  const isMarkedInactive =
    employee.isActive === false || employee.active === false

  if (!isMarkedInactive) return false

  const targetDate = startOfDay(dateValue)

  const inactiveSince = employee.inactiveSince
    ? startOfDay(new Date(employee.inactiveSince))
    : null

  const inactiveUntil = employee.inactiveUntil
    ? endOfDay(new Date(employee.inactiveUntil))
    : null

  if (inactiveSince && targetDate < inactiveSince) return false
  if (inactiveUntil && targetDate > inactiveUntil) return false

  return true
}

function getInactiveReasonLabel(reason?: string | null) {
  switch (reason) {
    case "SICK_LEAVE":
      return "Krankmeldung"
    case "MEDICAL_LEAVE":
      return "Medizinische Abwesenheit"
    case "TERMINATED":
      return "Kündigung / Entlassung"
    case "SUSPENDED":
      return "Suspendiert"
    case "VACATION":
      return "Urlaub / Freistellung"
    case "UNPAID_VACATION":
      return "Unbezahlter Urlaub"
    case "OTHER":
      return "Sonstiges"
    default:
      return "Nicht angegeben"
  }
}

function getRequestTypeLabel(type?: string | null) {
  switch (type) {
    case "EXTRA_SERVICE":
      return "Extra-Service"
    case "SERVICE_ISSUE":
      return "Problem"
    case "CHANGE_REQUEST":
      return "Änderung"
    case "CANCELLATION_REQUEST":
      return "Stornierung"
    default:
      return "Anfrage"
  }
}

function getNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function getServiceHours(service: any) {
  return getNumber(service.teamDuration || service.duration || service.billedHours || 0)
}

function getRealAssignmentHours(assignment: any) {
  if (!assignment.actualStartTime || !assignment.actualEndTime) return 0

  const start = new Date(assignment.actualStartTime).getTime()
  const end = new Date(assignment.actualEndTime).getTime()

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0
  }

  return (end - start) / (1000 * 60 * 60)
}

function getRealServiceHoursFromAssignments(service: any) {
  if (!Array.isArray(service.assignments)) return 0

  return service.assignments.reduce((sum: number, assignment: any) => {
    return sum + getRealAssignmentHours(assignment)
  }, 0)
}

export async function GET() {
  try {
    const now = new Date()

    const today = startOfDay(now)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const { start: startOfWeek, end: endOfWeek } = getWeekRange(today)

    const currentMonthStart = startOfMonth(today)
    const currentMonthEnd = endOfMonth(today)

    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
      23,
      59,
      59,
      999
    )

    const next30Days = new Date(today)
    next30Days.setDate(today.getDate() + 30)

    const [
      servicesToday,
      servicesThisWeek,
      servicesThisMonth,
      assignedToday,
      travelingToday,
      inProgressToday,
      completedToday,
      cancelledToday,
      unassignedUpcoming,
      servicesWithImportantNotes,
      servicesWithKeys,
      recurringServices,
      employees,
      clients,
      clientRequests,
      recentServices,
      monthServices,
      lastMonthServices,
      inventoryAlerts,
      allInventories,
    ] = await Promise.all([
      prisma.service.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            not: "cancelled",
          },
        },
      }),

      prisma.service.count({
        where: {
          date: {
            gte: startOfWeek,
            lt: endOfWeek,
          },
          status: {
            not: "cancelled",
          },
        },
      }),

      prisma.service.count({
        where: {
          date: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
          status: {
            not: "cancelled",
          },
        },
      }),

      prisma.service.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
          status: "assigned",
        },
      }),

      prisma.service.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
          status: "traveling",
        },
      }),

      prisma.service.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
          status: "in_progress",
        },
      }),

      prisma.service.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
          status: "completed",
        },
      }),

      prisma.service.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
          status: "cancelled",
        },
      }),

      prisma.service.count({
        where: {
          date: {
            gte: today,
          },
          status: {
            not: "cancelled",
          },
          assignments: {
            none: {},
          },
        },
      }),

      prisma.service.count({
        where: {
          date: {
            gte: today,
          },
          status: {
            not: "cancelled",
          },
          importantNotes: {
            not: null,
          },
        },
      }),

      prisma.service.count({
        where: {
          date: {
            gte: today,
          },
          status: {
            not: "cancelled",
          },
          requiresKey: true,
        },
      }),

      prisma.service.count({
        where: {
          status: {
            not: "cancelled",
          },
          OR: [
            {
              recurrenceRule: {
                not: null,
              },
            },
            {
              parentServiceId: {
                not: null,
              },
            },
          ],
        },
      }),

      prisma.employee.findMany({
        include: {
          assignments: {
            where: {
              service: {
                date: {
                  gte: startOfWeek,
                  lt: endOfWeek,
                },
                status: {
                  not: "cancelled",
                },
              },
            },
            include: {
              service: true,
            },
          },
        },
      }),

      prisma.client.findMany({
        include: {
          services: {
            where: {
              date: {
                gte: today,
              },
              status: {
                not: "cancelled",
              },
            },
          },
        },
      }),

      prisma.clientRequest.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          client: true,
          service: {
            include: {
              serviceCode: true,
            },
          },
        },
      }),

      prisma.service.findMany({
        where: {
          date: {
            gte: startOfWeek,
            lt: endOfWeek,
          },
          status: {
            not: "cancelled",
          },
        },
        include: {
          client: true,
          serviceCode: true,
          assignments: {
            include: {
              employee: true,
            },
          },
        },
      }),

      prisma.service.findMany({
        where: {
          date: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
          status: {
            not: "cancelled",
          },
        },
        include: {
          client: true,
          assignments: {
            include: {
              employee: true,
            },
          },
        },
      }),

      prisma.service.findMany({
        where: {
          date: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
          status: {
            not: "cancelled",
          },
        },
      }),

      prisma.clientInventory.findMany({
        where: {
          quantity: {
            lte: 0,
          },
        },
        include: {
          client: true,
          product: true,
        },
      }),

      prisma.clientInventory.findMany({
        include: {
          client: true,
          product: true,
        },
      }),
    ])

    const activeEmployeesToday = employees.filter(
      (employee) => !isEmployeeInactiveOnDate(employee, today)
    )

    const inactiveEmployeesToday = employees.filter((employee) =>
      isEmployeeInactiveOnDate(employee, today)
    )

    const inactiveByReason = inactiveEmployeesToday.reduce<Record<string, number>>(
      (acc, employee) => {
        const key = employee.inactiveReason || "OTHER"
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {}
    )

    const inactiveReasonCards = Object.entries(inactiveByReason).map(
      ([reason, count]) => ({
        reason,
        label: getInactiveReasonLabel(reason),
        count,
      })
    )

    const upcomingReturns = inactiveEmployeesToday
      .filter((employee) => employee.inactiveUntil)
      .map((employee) => ({
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`.trim(),
        reason: employee.inactiveReason,
        reasonLabel: getInactiveReasonLabel(employee.inactiveReason),
        inactiveSince: employee.inactiveSince,
        inactiveUntil: employee.inactiveUntil,
      }))
      .sort((a, b) => {
        const aTime = a.inactiveUntil ? new Date(a.inactiveUntil).getTime() : 0
        const bTime = b.inactiveUntil ? new Date(b.inactiveUntil).getTime() : 0
        return aTime - bTime
      })
      .slice(0, 8)

    const workload = employees.map((employee) => {
      const weekPlannedHours = employee.assignments.reduce((sum, assignment) => {
        return sum + getServiceHours(assignment.service)
      }, 0)

      const weekRealHours = employee.assignments.reduce((sum, assignment) => {
        return sum + getRealAssignmentHours(assignment)
      }, 0)

      const todayPlannedHours = employee.assignments
        .filter(
          (assignment) =>
            assignment.service.date >= today &&
            assignment.service.date < tomorrow
        )
        .reduce((sum, assignment) => sum + getServiceHours(assignment.service), 0)

      const todayRealHours = employee.assignments
        .filter(
          (assignment) =>
            assignment.service.date >= today &&
            assignment.service.date < tomorrow
        )
        .reduce((sum, assignment) => sum + getRealAssignmentHours(assignment), 0)

      const isInactiveToday = isEmployeeInactiveOnDate(employee, today)

      const contractedHoursPerWeek = getNumber(
        employee.contractedHoursPerWeek || 40
      )

      const availableToday = isInactiveToday ? 0 : contractedHoursPerWeek / 5

      return {
        id: employee.id,
        name: employee.firstName,
        fullName: `${employee.firstName} ${employee.lastName}`.trim(),
        weekHours: Number(weekPlannedHours.toFixed(2)),
        weekPlannedHours: Number(weekPlannedHours.toFixed(2)),
        weekRealHours: Number(weekRealHours.toFixed(2)),
        todayHours: Number(todayPlannedHours.toFixed(2)),
        todayPlannedHours: Number(todayPlannedHours.toFixed(2)),
        todayRealHours: Number(todayRealHours.toFixed(2)),
        contractedHoursPerWeek,
        availableToday,
        isInactiveToday,
        inactiveReason: employee.inactiveReason,
        inactiveReasonLabel: getInactiveReasonLabel(employee.inactiveReason),
        inactiveSince: employee.inactiveSince,
        inactiveUntil: employee.inactiveUntil,
      }
    })

    const totalCapacityToday = workload.reduce(
      (sum, employee) => sum + employee.availableToday,
      0
    )

    const totalAssignedToday = workload.reduce(
      (sum, employee) => sum + employee.todayHours,
      0
    )

    const occupancyToday =
      totalCapacityToday > 0
        ? Math.round((totalAssignedToday / totalCapacityToday) * 100)
        : 0

    const totalWeekHours = workload.reduce(
      (sum, employee) => sum + employee.weekHours,
      0
    )

    const topEmployees = [...workload]
      .sort((a, b) => b.weekHours - a.weekHours)
      .slice(0, 8)

    const employeesWithoutAssignments = workload.filter(
      (employee) => !employee.isInactiveToday && employee.weekHours === 0
    )

    const clientsWithUpcomingServices = clients.filter(
      (client) => client.services.length > 0
    )

    const clientsWithoutUpcomingServices = clients.filter(
      (client) => client.services.length === 0
    )

    const openRequestsByClient = clientRequests.reduce<Record<number, number>>(
      (acc, request) => {
        if (request.status === "PENDING" || request.status === "IN_REVIEW") {
          acc[request.clientId] = (acc[request.clientId] || 0) + 1
        }

        return acc
      },
      {}
    )

    const topClientsMap: Record<string, number> = {}

    recentServices.forEach((service) => {
      const clientName = service.client?.name || "Unbekannt"
      topClientsMap[clientName] = (topClientsMap[clientName] || 0) + 1
    })

    const topClients = Object.entries(topClientsMap)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    const clientsWithOpenRequests = clients
      .filter((client) => openRequestsByClient[client.id])
      .map((client) => ({
        id: client.id,
        name: client.name,
        clientCode: client.clientCode,
        openRequests: openRequestsByClient[client.id] || 0,
      }))
      .sort((a, b) => b.openRequests - a.openRequests)
      .slice(0, 8)

    const pendingRequests = clientRequests.filter(
      (request) => request.status === "PENDING"
    )

    const inReviewRequests = clientRequests.filter(
      (request) => request.status === "IN_REVIEW"
    )

    const resolvedRequests = clientRequests.filter(
      (request) => request.status === "RESOLVED"
    )

    const rejectedRequests = clientRequests.filter(
      (request) => request.status === "REJECTED"
    )

    const requestTypeCounts = clientRequests.reduce<Record<string, number>>(
      (acc, request) => {
        acc[request.type] = (acc[request.type] || 0) + 1
        return acc
      },
      {}
    )

    const requestTypeCards = Object.entries(requestTypeCounts).map(
      ([type, count]) => ({
        type,
        label: getRequestTypeLabel(type),
        count,
      })
    )

    const latestRequests = clientRequests.slice(0, 10).map((request) => ({
      id: request.id,
      type: request.type,
      typeLabel: getRequestTypeLabel(request.type),
      status: request.status,
      title: request.title,
      message: request.message,
      createdAt: request.createdAt,
      requestedDate: request.requestedDate,
      requestedTime: request.requestedTime,
      client: request.client
        ? {
          id: request.client.id,
          name: request.client.name,
          clientCode: request.client.clientCode,
        }
        : null,
      service: request.service
        ? {
          id: request.service.id,
          date: request.service.date,
          startTime: request.service.startTime,
          serviceCode: request.service.serviceCode,
        }
        : null,
    }))

    let totalEstimatedHours = 0
    let totalRealHours = 0
    let completedWithRealTime = 0

    recentServices.forEach((service) => {
      const real = getRealServiceHoursFromAssignments(service)
      const estimated = getServiceHours(service)

      if (estimated > 0 && real > 0) {
        totalEstimatedHours += estimated
        totalRealHours += real
        completedWithRealTime++
      }
    })

    const precision =
      completedWithRealTime > 0 && totalEstimatedHours > 0
        ? Math.round((totalRealHours / totalEstimatedHours) * 100)
        : 100

    const monthHours = monthServices.reduce(
      (sum, service) => sum + getServiceHours(service),
      0
    )

    const lastMonthHours = lastMonthServices.reduce(
      (sum, service) => sum + getServiceHours(service),
      0
    )

    const monthGrowth =
      lastMonthServices.length > 0
        ? Math.round(
          ((monthServices.length - lastMonthServices.length) /
            lastMonthServices.length) *
          100
        )
        : monthServices.length > 0
          ? 100
          : 0

    const fixedServicesThisMonth = monthServices.filter(
      (service) => service.pricingModel === "FIXED"
    ).length

    const timeServicesThisMonth = monthServices.filter(
      (service) => service.pricingModel !== "FIXED"
    ).length

    const financeEstimatedBillableHours = monthServices.reduce((sum, service) => {
      if (service.pricingModel === "FIXED") return sum
      return sum + getNumber(service.billedHours || service.duration || 0)
    }, 0)

    const inventoryByClient = inventoryAlerts.reduce<Record<string, number>>(
      (acc, alert) => {
        const clientName = alert.client?.name || "Unbekannt"
        acc[clientName] = (acc[clientName] || 0) + 1
        return acc
      },
      {}
    )

    const inventoryClients = Object.entries(inventoryByClient)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    const totalInventoryItems = allInventories.length

    const inventoryItemsInZero = allInventories.filter(
      (item) => getNumber(item.quantity) <= 0
    ).length

    const inventoryItemsPositive = allInventories.filter(
      (item) => getNumber(item.quantity) > 0
    ).length

    return NextResponse.json({
      overview: {
        servicesToday,
        servicesThisWeek,
        employeesActiveToday: activeEmployeesToday.length,
        employeesInactiveToday: inactiveEmployeesToday.length,
        pendingRequests: pendingRequests.length,
        inReviewRequests: inReviewRequests.length,
        unassignedUpcoming,
        inventoryAlerts: inventoryAlerts.length,
        occupancyToday,
        totalWeekHours,
        precision,
        monthGrowth,
      },

      services: {
        today: {
          total: servicesToday,
          assigned: assignedToday,
          traveling: travelingToday,
          inProgress: inProgressToday,
          completed: completedToday,
          cancelled: cancelledToday,
        },
        week: {
          total: servicesThisWeek,
          plannedHours: totalWeekHours,
          realHours: Number(totalRealHours.toFixed(2)),
          estimatedHours: Number(totalEstimatedHours.toFixed(2)),
          precision,
        },
        month: {
          total: servicesThisMonth,
          plannedHours: Number(monthHours.toFixed(2)),
          growth: monthGrowth,
        },
        alerts: {
          unassigned: unassignedUpcoming,
          withImportantNotes: servicesWithImportantNotes,
          withKeys: servicesWithKeys,
          recurring: recurringServices,
        },
        latestThisWeek: recentServices.slice(0, 10).map((service) => ({
          id: service.id,
          date: service.date,
          startTime: service.startTime,
          status: service.status,
          client: service.client?.name,
          serviceCode: service.serviceCode,
          employees: service.assignments.map((assignment) => ({
            id: assignment.employee.id,
            name: `${assignment.employee.firstName} ${assignment.employee.lastName}`.trim(),
          })),
          plannedHours: getServiceHours(service),
          realHours: getRealServiceHoursFromAssignments(service),
        })),
      },

      employees: {
        total: employees.length,
        activeToday: activeEmployeesToday.length,
        inactiveToday: inactiveEmployeesToday.length,
        inactiveByReason: inactiveReasonCards,
        upcomingReturns,
        workload,
        topEmployees,
        withoutAssignments: employeesWithoutAssignments.slice(0, 8),
        capacity: {
          totalCapacityToday,
          totalAssignedToday,
          occupancyToday,
        },
      },

      clients: {
        total: clients.length,
        withUpcomingServices: clientsWithUpcomingServices.length,
        withoutUpcomingServices: clientsWithoutUpcomingServices.length,
        withOpenRequests: clientsWithOpenRequests.length,
        topClients,
        clientsWithOpenRequests,
        withoutUpcomingList: clientsWithoutUpcomingServices
          .slice(0, 8)
          .map((client) => ({
            id: client.id,
            name: client.name,
            clientCode: client.clientCode,
            email: client.email,
            phone: client.phone,
          })),
      },

      requests: {
        total: clientRequests.length,
        pending: pendingRequests.length,
        inReview: inReviewRequests.length,
        resolved: resolvedRequests.length,
        rejected: rejectedRequests.length,
        typeCounts: requestTypeCards,
        latest: latestRequests,
      },

      inventory: {
        alerts: inventoryAlerts.length,
        totalInventoryItems,
        itemsInZero: inventoryItemsInZero,
        itemsPositive: inventoryItemsPositive,
        clientsWithAlerts: inventoryClients.length,
        inventoryClients,
        alertsList: inventoryAlerts,
      },

      finance: {
        monthServices: servicesThisMonth,
        monthPlannedHours: Number(monthHours.toFixed(2)),
        lastMonthPlannedHours: Number(lastMonthHours.toFixed(2)),
        billableHours: Number(financeEstimatedBillableHours.toFixed(2)),
        fixedServices: fixedServicesThisMonth,
        timeServices: timeServicesThisMonth,
        precision,
        growth: monthGrowth,
      },

      kpis: {
        servicesToday,
        occupancyToday,
        totalWeekHours,
        unassignedAlerts: unassignedUpcoming,
        growth: monthGrowth,
        precision,
      },

      topClients,
      topEmployees,
      inventoryAlerts,
      clientRequests: latestRequests,
    })
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error)

    return NextResponse.json(
      { error: "Error de servidor" },
      { status: 500 }
    )
  }
}