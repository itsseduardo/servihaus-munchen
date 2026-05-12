import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

type TaskFilter = "today" | "tomorrow" | "history"

function getDateRanges() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(today.getDate() + 2)

  return {
    today,
    tomorrow,
    dayAfterTomorrow,
  }
}

function normalizeTaskStatus(status?: string | null) {
  const normalized = status?.toLowerCase() || ""

  if (
    normalized === "assigned" ||
    normalized === "traveling" ||
    normalized === "in_progress" ||
    normalized === "completed"
  ) {
    return normalized
  }

  if (
    normalized === "confirmed" ||
    normalized === "scheduled" ||
    normalized === "planned" ||
    normalized === "pending" ||
    normalized === "open"
  ) {
    return "assigned"
  }

  return "assigned"
}

function isTaskFilter(value: string | null): value is TaskFilter {
  return value === "today" || value === "tomorrow" || value === "history"
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    if (session.user.role !== "EMPLOYEE") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a estas tareas" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const rawFilter = searchParams.get("filter")
    const filter: TaskFilter = isTaskFilter(rawFilter) ? rawFilter : "today"

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        employee: true,
      },
    })

    if (!user?.employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado" },
        { status: 404 }
      )
    }

    const { today, tomorrow, dayAfterTomorrow } = getDateRanges()

    const dateQuery =
      filter === "today"
        ? { gte: today, lt: tomorrow }
        : filter === "tomorrow"
          ? { gte: tomorrow, lt: dayAfterTomorrow }
          : { lt: today }

    const cancelledStatuses = ["cancelled", "canceled", "CANCELLED", "CANCELED"]

    const services = await prisma.service.findMany({
      where: {
        date: dateQuery,
        assignments: {
          some: {
            employeeId: user.employee.id,
          },
        },
        ...(filter === "history"
          ? {
            status: "completed",
          }
          : {
            status: {
              notIn: cancelledStatuses,
            },
          }),
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
      orderBy:
        filter === "history"
          ? [{ date: "desc" }, { startTime: "desc" }]
          : [{ startTime: "asc" }, { date: "asc" }],
    })

    const tasks = services.map((service) => ({
      ...service,
      status: normalizeTaskStatus(service.status),
      timeWindow:
        service.startTime
          ? service.startTime.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          : null,
      duration:
        service.teamDuration ??
        service.duration ??
        service.billedHours ??
        null,
    }))

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("ERROR FETCHING EMPLOYEE TASKS:", error)

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    )
  }
}