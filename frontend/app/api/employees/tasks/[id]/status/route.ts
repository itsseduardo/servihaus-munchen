import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { Prisma } from "@prisma/client"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const ALLOWED_STATUSES = [
  "assigned",
  "traveling",
  "in_progress",
  "completed",
] as const

type AllowedStatus = (typeof ALLOWED_STATUSES)[number]

function isAllowedStatus(status: unknown): status is AllowedStatus {
  return (
    typeof status === "string" &&
    ALLOWED_STATUSES.includes(status as AllowedStatus)
  )
}

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

function isEmployeeInactiveOnDate(
  employee: {
    active?: boolean | null
    isActive?: boolean | null
    inactiveSince?: Date | null
    inactiveUntil?: Date | null
  },
  dateValue: Date = new Date()
) {
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

  if (inactiveSince && targetDate < inactiveSince) {
    return false
  }

  if (inactiveUntil && targetDate > inactiveUntil) {
    return false
  }

  return true
}

function getEarliestDate(values: Array<Date | null>) {
  const validDates = values
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => a.getTime() - b.getTime())

  return validDates[0] || null
}

function getLatestDate(values: Array<Date | null>) {
  const validDates = values
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => b.getTime() - a.getTime())

  return validDates[0] || null
}

function getAggregatedServiceStatus(
  assignments: Array<{
    status: string
  }>
) {
  if (assignments.length === 0) return "assigned"

  const allCompleted = assignments.every(
    (assignment) => assignment.status === "completed"
  )

  if (allCompleted) return "completed"

  const hasInProgress = assignments.some(
    (assignment) => assignment.status === "in_progress"
  )

  if (hasInProgress) return "in_progress"

  const hasTraveling = assignments.some(
    (assignment) => assignment.status === "traveling"
  )

  if (hasTraveling) return "traveling"

  return "assigned"
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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
        { error: "No tienes permisos para actualizar esta tarea" },
        { status: 403 }
      )
    }

    const { id } = await context.params
    const serviceId = Number(id)

    if (!Number.isInteger(serviceId)) {
      return NextResponse.json(
        { error: "ID de servicio inválido" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const status = body.status

    const overtimeReason =
      typeof body.overtimeReason === "string"
        ? body.overtimeReason.trim()
        : ""

    if (!isAllowedStatus(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      )
    }

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

    const employeeIsInactiveToday = isEmployeeInactiveOnDate(
      user.employee,
      new Date()
    )

    if (employeeIsInactiveToday) {
      return NextResponse.json(
        {
          error:
            "Tu cuenta está inactiva actualmente. Puedes ver tus tareas, pero no puedes cambiar estados ni registrar tiempos.",
        },
        { status: 403 }
      )
    }

    const assignment = await prisma.serviceAssignment.findFirst({
      where: {
        serviceId,
        employeeId: user.employee.id,
      },
      include: {
        service: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "La tarea no existe o no está asignada a este empleado" },
        { status: 404 }
      )
    }

    if (assignment.service.status === "cancelled") {
      return NextResponse.json(
        { error: "Esta tarea fue cancelada y no puede modificarse." },
        { status: 400 }
      )
    }

    const now = new Date()

    const updatedTask = await prisma.$transaction(async (tx) => {
      const assignmentUpdateData: Prisma.ServiceAssignmentUpdateInput = {
        status,
      }

      if (status === "traveling" && !assignment.actualTravelStartTime) {
        assignmentUpdateData.actualTravelStartTime = now
      }

      if (status === "in_progress") {
        if (!assignment.actualTravelStartTime) {
          assignmentUpdateData.actualTravelStartTime = now
        }

        if (!assignment.actualStartTime) {
          assignmentUpdateData.actualStartTime = now
        }
      }

      if (status === "completed") {
        if (!assignment.actualStartTime) {
          assignmentUpdateData.actualStartTime = now
        }

        if (!assignment.actualEndTime) {
          assignmentUpdateData.actualEndTime = now
        }

        if (overtimeReason) {
          assignmentUpdateData.overtimeJustification = overtimeReason
          assignmentUpdateData.extraHoursReason = overtimeReason
        }
      }

      await tx.serviceAssignment.update({
        where: {
          id: assignment.id,
        },
        data: assignmentUpdateData,
      })

      const serviceAssignments = await tx.serviceAssignment.findMany({
        where: {
          serviceId,
        },
        include: {
          employee: true,
        },
        orderBy: {
          assignedAt: "asc",
        },
      })

      const nextServiceStatus = getAggregatedServiceStatus(serviceAssignments)

      const earliestTravelStart = getEarliestDate(
        serviceAssignments.map((item) => item.actualTravelStartTime)
      )

      const earliestStart = getEarliestDate(
        serviceAssignments.map((item) => item.actualStartTime)
      )

      const latestEnd = getLatestDate(
        serviceAssignments.map((item) => item.actualEndTime)
      )

      const serviceUpdateData: Prisma.ServiceUpdateInput = {
        status: nextServiceStatus,
      }

      if (earliestTravelStart) {
        serviceUpdateData.actualTravelStartTime = earliestTravelStart
      }

      if (earliestStart) {
        serviceUpdateData.actualStartTime = earliestStart
      }

      if (nextServiceStatus === "completed" && latestEnd) {
        serviceUpdateData.actualEndTime = latestEnd

        if (overtimeReason) {
          serviceUpdateData.overtimeJustification = overtimeReason
          serviceUpdateData.extraHoursReason = overtimeReason
        }
      }

      await tx.service.update({
        where: {
          id: serviceId,
        },
        data: serviceUpdateData,
      })

      return tx.service.findUnique({
        where: {
          id: serviceId,
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
      })
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("ERROR ACTUALIZANDO ESTADO DE TAREA:", error)

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}