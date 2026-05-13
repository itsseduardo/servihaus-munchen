import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import type { Prisma } from "@prisma/client"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

type Scope = "THIS" | "THIS_AND_FUTURE" | "ALL"

function isValidScope(scope: unknown): scope is Scope {
  return scope === "THIS" || scope === "THIS_AND_FUTURE" || scope === "ALL"
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    }
  }

  if (session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    }
  }

  return {
    userId: session.user.id,
  }
}

function buildScopedWhere(
  service: {
    id: number
    date: Date
    parentServiceId: number | null
  },
  scope: Scope
) {
  const parentId = service.parentServiceId ?? service.id

  if (scope === "ALL") {
    return {
      OR: [{ id: parentId }, { parentServiceId: parentId }],
    }
  }

  if (scope === "THIS_AND_FUTURE") {
    return {
      OR: [
        { id: service.id },
        {
          parentServiceId: parentId,
          date: {
            gte: service.date,
          },
        },
      ],
    }
  }

  return {
    id: service.id,
  }
}

function formatUtcDateForMessage(date: Date) {
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  })
}

function isEmployeeInactiveForDate(employee: any, date: Date) {
  const isMarkedInactive =
    employee.isActive === false || employee.active === false

  if (!isMarkedInactive) return false

  const targetDate = new Date(date)
  targetDate.setUTCHours(0, 0, 0, 0)

  const inactiveSince = employee.inactiveSince
    ? new Date(employee.inactiveSince)
    : null

  if (inactiveSince) {
    inactiveSince.setUTCHours(0, 0, 0, 0)
  }

  const inactiveUntil = employee.inactiveUntil
    ? new Date(employee.inactiveUntil)
    : null

  if (inactiveUntil) {
    inactiveUntil.setUTCHours(23, 59, 59, 999)
  }

  if (inactiveSince && targetDate < inactiveSince) return false
  if (inactiveUntil && targetDate > inactiveUntil) return false

  return true
}

function getTargetDateForAffectedService({
  item,
  service,
  newDate,
  dateDeltaMs,
  scope,
  hasDateUpdate,
}: {
  item: { id: number; date: Date }
  service: { id: number; date: Date }
  newDate: Date | null
  dateDeltaMs: number
  scope: Scope
  hasDateUpdate: boolean
}) {
  if (!hasDateUpdate) return item.date

  if (scope === "THIS") {
    return item.id === service.id && newDate ? newDate : item.date
  }

  return new Date(item.date.getTime() + dateDeltaMs)
}

async function createServiceAuditLogs({
  services,
  userId,
  action,
  reason,
  newValue,
}: {
  services: Array<{
    id: number
    status: string
    actualStartTime: Date | null
    actualEndTime: Date | null
    notes: string | null
    importantNotes: string | null
    pricingModel: string
    travelTime: number | null
    changeReason: string | null
  }>
  userId: string
  action: string
  reason?: string | null
  newValue: unknown
}) {
  if (services.length === 0) return

  await prisma.auditLog.createMany({
    data: services.map((service) => ({
      action,
      entityType: "SERVICE",
      entityId: service.id,
      userId,
      oldValue: JSON.stringify({
        status: service.status,
        actualStartTime: service.actualStartTime,
        actualEndTime: service.actualEndTime,
        notes: service.notes,
        importantNotes: service.importantNotes,
        pricingModel: service.pricingModel,
        travelTime: service.travelTime,
        changeReason: service.changeReason,
      }),
      newValue: JSON.stringify(newValue),
      reason: reason || null,
    })),
  })
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { id } = await context.params
    const serviceId = Number(id)

    if (!Number.isInteger(serviceId)) {
      return NextResponse.json(
        { error: "Invalid service id" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const scope: Scope = isValidScope(body.scope) ? body.scope : "THIS"

    const changeReason =
      typeof body.changeReason === "string"
        ? body.changeReason.trim()
        : ""

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        assignments: true,
        childServices: true,
      },
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    const scheduleChanged =
      body.date !== undefined ||
      body.startTime !== undefined ||
      body.teamDuration !== undefined ||
      body.address !== undefined ||
      body.employeeIds !== undefined

    const manualTimeChanged =
      body.actualStartTime !== undefined ||
      body.actualEndTime !== undefined

    if ((scheduleChanged || manualTimeChanged) && !changeReason) {
      return NextResponse.json(
        {
          error: "Bitte geben Sie einen Grund für die Änderung an.",
        },
        { status: 400 }
      )
    }

    const parentId = service.parentServiceId ?? service.id

    const scopedWhere =
      scope === "ALL"
        ? {
          OR: [{ id: parentId }, { parentServiceId: parentId }],
        }
        : scope === "THIS_AND_FUTURE"
          ? {
            OR: [
              { id: service.id },
              {
                parentServiceId: parentId,
                date: {
                  gte: service.date,
                },
              },
            ],
          }
          : {
            id: service.id,
          }

    const affectedServices = await prisma.service.findMany({
      where: scopedWhere,
      include: {
        assignments: true,
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    })

    if (affectedServices.length === 0) {
      return NextResponse.json(
        { error: "No services found for selected scope" },
        { status: 404 }
      )
    }

    const newDate = body.date ? new Date(body.date) : null
    const newStartTime = body.startTime ? new Date(body.startTime) : null

    if (body.date !== undefined && !newDate) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      )
    }

    const dateDeltaMs =
      newDate && service.date
        ? newDate.getTime() - service.date.getTime()
        : 0

    const startDeltaMs =
      newStartTime && service.startTime
        ? newStartTime.getTime() - service.startTime.getTime()
        : 0

    const hasEmployeeUpdate = Array.isArray(body.employeeIds)

    const employeeIds: number[] = hasEmployeeUpdate
      ? body.employeeIds
        .map((value: unknown) => Number(value))
        .filter((value: number) => Number.isInteger(value))
      : []

    if (hasEmployeeUpdate && employeeIds.length > 0) {
      const selectedEmployees = await prisma.employee.findMany({
        where: {
          id: {
            in: employeeIds,
          },
        },
      })

      const conflicts: {
        id: number
        name: string
        date: string
        inactiveReason: string | null
        inactiveUntil: Date | null
      }[] = []

      for (const employee of selectedEmployees) {
        for (const item of affectedServices) {
          const targetDate = getTargetDateForAffectedService({
            item,
            service,
            newDate,
            dateDeltaMs,
            scope,
            hasDateUpdate: body.date !== undefined,
          })

          if (isEmployeeInactiveForDate(employee, targetDate)) {
            conflicts.push({
              id: employee.id,
              name: `${employee.firstName} ${employee.lastName}`,
              date: formatUtcDateForMessage(targetDate),
              inactiveReason: employee.inactiveReason,
              inactiveUntil: employee.inactiveUntil,
            })

            break
          }
        }
      }

      if (conflicts.length > 0) {
        return NextResponse.json(
          {
            error:
              "Ein oder mehrere Mitarbeiter sind für dieses Datum nicht verfügbar.",
            employees: conflicts,
          },
          { status: 400 }
        )
      }
    }

    const updatedServices = await prisma.$transaction(async (tx) => {
      const results = []

      for (const item of affectedServices) {
        const updateData: Prisma.ServiceUpdateInput = {}

        if (body.status !== undefined) {
          updateData.status = String(body.status)

          if (body.status === "cancelled") {
            updateData.actualStartTime = null
            updateData.actualEndTime = null
          }
        }

        if (body.pricingModel !== undefined) {
          updateData.pricingModel = body.pricingModel
        }

        if (body.travelTime !== undefined) {
          updateData.travelTime = Number(body.travelTime) || 0
        }

        if (body.notes !== undefined) {
          updateData.notes = body.notes || null
        }

        if (body.importantNotes !== undefined) {
          updateData.importantNotes = body.importantNotes || null
        }

        if (body.address !== undefined) {
          updateData.address = body.address || service.address
        }

        if (body.teamDuration !== undefined) {
          updateData.teamDuration =
            body.teamDuration === null || body.teamDuration === ""
              ? null
              : Number(body.teamDuration)
        } else if (hasEmployeeUpdate) {
          const employeeCount = employeeIds.length

          const totalServiceHours =
            Number(item.duration || 0) ||
            Number(item.billedHours || 0) ||
            Number(service.duration || 0) ||
            Number(service.billedHours || 0)

          updateData.teamDuration =
            employeeCount > 0 && totalServiceHours > 0
              ? totalServiceHours / employeeCount
              : totalServiceHours || null
        }

        if (body.date !== undefined) {
          if (scope === "THIS") {
            updateData.date = newDate as Date
          } else {
            updateData.date = new Date(item.date.getTime() + dateDeltaMs)
          }
        }

        if (body.startTime !== undefined) {
          if (!body.startTime) {
            updateData.startTime = null
          } else if (scope === "THIS") {
            updateData.startTime = newStartTime
          } else if (item.startTime) {
            updateData.startTime = new Date(
              item.startTime.getTime() + startDeltaMs
            )
          } else {
            updateData.startTime = newStartTime
          }
        }

        if (body.actualStartTime !== undefined) {
          updateData.actualStartTime = body.actualStartTime
            ? new Date(body.actualStartTime)
            : null
        }

        if (body.actualEndTime !== undefined) {
          updateData.actualEndTime = body.actualEndTime
            ? new Date(body.actualEndTime)
            : null
        }

        if (changeReason) {
          updateData.changeReason = changeReason
        }

        const updated = await tx.service.update({
          where: { id: item.id },
          data: updateData,
        })

        if (hasEmployeeUpdate) {
          await tx.serviceAssignment.deleteMany({
            where: {
              serviceId: item.id,
            },
          })

          if (employeeIds.length > 0) {
            await tx.serviceAssignment.createMany({
              data: employeeIds.map((employeeId) => ({
                serviceId: item.id,
                employeeId,
                assignedAt: new Date(),
              })),
              skipDuplicates: true,
            })
          }
        }

        await tx.auditLog.create({
          data: {
            action: "UPDATE_SERVICE",
            entityType: "SERVICE",
            entityId: item.id,
            userId: auth.userId,
            oldValue: JSON.stringify({
              date: item.date,
              startTime: item.startTime,
              teamDuration: item.teamDuration,
              address: item.address,
              status: item.status,
              notes: item.notes,
              importantNotes: item.importantNotes,
              pricingModel: item.pricingModel,
              travelTime: item.travelTime,
              employeeIds: item.assignments.map(
                (assignment) => assignment.employeeId
              ),
            }),
            newValue: JSON.stringify({
              ...updateData,
              employeeIds: hasEmployeeUpdate ? employeeIds : undefined,
              scope,
            }),
            reason:
              changeReason ||
              "Service updated from admin calendar",
          },
        })

        results.push(updated)
      }

      return results
    })

    const updatedService = await prisma.service.findUnique({
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

    return NextResponse.json({
      success: true,
      updated: updatedServices.length,
      service: updatedService,
    })
  } catch (error) {
    console.error("SERVICE UPDATE ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { id } = await context.params
    const serviceId = Number(id)

    if (!Number.isInteger(serviceId)) {
      return NextResponse.json(
        { error: "Invalid service id" },
        { status: 400 }
      )
    }

    const body = await req.json().catch(() => ({}))

    const scope: Scope = isValidScope(body.scope) ? body.scope : "THIS"
    const cancellationReason =
      typeof body.changeReason === "string" && body.changeReason.trim()
        ? body.changeReason.trim()
        : typeof body.reason === "string" && body.reason.trim()
          ? body.reason.trim()
          : "Service cancelled from admin calendar"

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      select: {
        id: true,
        date: true,
        parentServiceId: true,
      },
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    const scopedWhere = buildScopedWhere(service, scope)

    const affectedServices = await prisma.service.findMany({
      where: scopedWhere,
      select: {
        id: true,
        status: true,
        actualStartTime: true,
        actualEndTime: true,
        notes: true,
        importantNotes: true,
        pricingModel: true,
        travelTime: true,
        changeReason: true,
      },
    })

    const updateData: Prisma.ServiceUpdateManyMutationInput = {
      status: "cancelled",
      actualStartTime: null,
      actualEndTime: null,
      changeReason: cancellationReason,
    }

    await prisma.service.updateMany({
      where: scopedWhere,
      data: updateData,
    })

    await createServiceAuditLogs({
      services: affectedServices,
      userId: auth.userId,
      action: "CANCEL_SERVICE",
      reason: cancellationReason,
      newValue: updateData,
    })

    return NextResponse.json({
      success: true,
      cancelled: affectedServices.length,
    })
  } catch (error) {
    console.error("SERVICE CANCEL ERROR:", error)

    return NextResponse.json(
      { error: "Cancel failed" },
      { status: 500 }
    )
  }
}