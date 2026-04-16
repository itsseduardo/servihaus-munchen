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
      return NextResponse.json({ error: "Invalid service id" }, { status: 400 })
    }

    const body = await req.json()
    const { scope, changeReason } = body // changeReason es vital para la ley alemana

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        serviceCode: true,
        client: true,
        assignments: { include: { employee: true } },
        childServices: true
      }
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const updateData: any = {}

    // ----------------------------
    // NUEVOS CAMPOS: COBRO Y VIAJE
    // ----------------------------
    if (body.pricingModel) updateData.pricingModel = body.pricingModel
    if (body.travelTime !== undefined) updateData.travelTime = Number(body.travelTime)

    // ----------------------------
    // CONTROL DE ESTADOS Y TIEMPOS REALES
    // ----------------------------
    if (body.status && body.status !== service.status) {
      updateData.status = body.status
      if (body.status === "in_progress" && !service.actualStartTime) {
        updateData.actualStartTime = body.actualStartTime ? new Date(body.actualStartTime) : new Date()
      }
      if (body.status === "completed" && !service.actualEndTime) {
        updateData.actualEndTime = body.actualEndTime ? new Date(body.actualEndTime) : new Date()
      }
      if (body.status === "cancelled") {
        updateData.actualStartTime = null
        updateData.actualEndTime = null
      }
    }

    // Actualización manual de tiempos (Si el admin los cambia a mano)
    if (body.actualStartTime) updateData.actualStartTime = new Date(body.actualStartTime)
    if (body.actualEndTime) updateData.actualEndTime = new Date(body.actualEndTime)

    // ----------------------------
    // NOTAS
    // ----------------------------
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.importantNotes !== undefined) updateData.importantNotes = body.importantNotes

    // ----------------------------
    // RECURRENCE SCOPE HANDLING
    // ----------------------------
    const parentId = service.parentServiceId ?? service.id

    if (scope && (service.parentServiceId || service.childServices?.length)) {
      if (scope === "ALL") {
        await prisma.service.updateMany({
          where: { OR: [{ id: parentId }, { parentServiceId: parentId }] },
          data: updateData,
        })
        return NextResponse.json({ success: true })
      }

      if (scope === "THIS_AND_FUTURE") {
        await prisma.service.updateMany({
          where: {
            OR: [
              { id: serviceId },
              { parentServiceId: parentId, date: { gte: service.date } }
            ]
          },
          data: updateData,
        })
        return NextResponse.json({ success: true })
      }
    }

    // ----------------------------
    // LOG DE AUDITORÍA (Ley Alemana)
    // ----------------------------
    // Si hubo cambios en tiempos reales, registramos quién y por qué
    if (body.actualStartTime || body.actualEndTime || body.status === "completed") {
      console.log(`[AUDIT] Service ${serviceId} modified. Reason: ${changeReason || 'No reason provided'}`);
      // Aquí podrías insertar en una tabla de logs si la tienes creada
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    })

    return NextResponse.json(updated)

  } catch (error) {
    console.error("SERVICE UPDATE ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const serviceId = parseInt(id)
    const body = await req.json().catch(() => ({}))
    const { scope } = body

    // Si es recurrente y pide borrar más de uno
    if (scope && scope !== "THIS") {
      const service = await prisma.service.findUnique({ where: { id: serviceId } })
      if (service) {
        const parentId = service.parentServiceId ?? service.id
        const whereClause = scope === "ALL" 
          ? { OR: [{ id: parentId }, { parentServiceId: parentId }] }
          : { parentServiceId: parentId, date: { gte: service.date } };

        // Borrar asignaciones primero
        const relatedServices = await prisma.service.findMany({ where: whereClause, select: { id: true } })
        const ids = relatedServices.map(s => s.id)
        await prisma.serviceAssignment.deleteMany({ where: { serviceId: { in: ids } } })
        await prisma.service.deleteMany({ where: { id: { in: ids } } })
        
        return NextResponse.json({ success: true })
      }
    }

    // Borrado individual estándar
    await prisma.serviceAssignment.deleteMany({ where: { serviceId } })
    await prisma.service.delete({ where: { id: serviceId } })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("SERVICE DELETE ERROR:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}