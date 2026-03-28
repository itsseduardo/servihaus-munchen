import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const serviceId = parseInt(id)

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: "Invalid service id" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        serviceCode: true,
        client: true,
        assignments: {
          include: {
            employee: true,
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      )
    }

    const updateData: any = {}

    // ----------------------------
    // STATUS TRANSITIONS CONTROLLED
    // ----------------------------

    if (body.status && body.status !== service.status) {
      const newStatus = body.status

      // INICIAR (opcional)
      if (newStatus === "in_progress") {
        updateData.status = "in_progress"

        // Si frontend no manda hora real, usar ahora
        updateData.actualStartTime =
          body.actualStartTime
            ? new Date(body.actualStartTime)
            : new Date()
      }

      // COMPLETAR (permitido desde cualquier estado)
      if (newStatus === "completed") {
        updateData.status = "completed"

        // Si mandan hora real, usarla
        if (body.actualEndTime) {
          updateData.actualEndTime = new Date(body.actualEndTime)
        } else {
          // Si nunca se inició, usar duración planificada
          if (!service.actualStartTime) {
            updateData.actualStartTime = service.startTime
          }

          if (service.startTime) {
            updateData.actualEndTime = new Date(
              service.startTime.getTime() +
              (service.duration ?? 0) * 60 * 60 * 1000
            )
          }
        }

      }

      if (newStatus === "cancelled") {
        updateData.status = "cancelled"
        updateData.actualStartTime = null
        updateData.actualEndTime = null
      }

    }

    if (body.actualStartTime) {
      updateData.actualStartTime = new Date(body.actualStartTime)
    }

    if (body.actualEndTime) {
      updateData.actualEndTime = new Date(body.actualEndTime)
    }

    // ----------------------------
    // NOTAS
    // ----------------------------

    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    if (body.importantNotes !== undefined) {
      updateData.importantNotes = body.importantNotes
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    })

    return NextResponse.json(updated)

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
    const { id } = await context.params
    const serviceId = parseInt(id)

    await prisma.serviceAssignment.deleteMany({
      where: { serviceId },
    })

    await prisma.service.delete({
      where: { id: serviceId },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("SERVICE DELETE ERROR:", error)
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}