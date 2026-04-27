import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { status } = await req.json() // 'APPROVED' o 'REJECTED'
    
    // 1. Buscamos el turno y el primer servicio de ese día para comparar
    const shift = await prisma.workShift.findUnique({
      where: { id: parseInt(id) },
      include: { employee: true }
    })

    if (!shift) return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 })

    // Buscamos el horario en que DEBERÍA haber empezado (su primer servicio)
    const dayStart = new Date(shift.date)
    dayStart.setHours(0,0,0,0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const firstService = await prisma.service.findFirst({
      where: {
        date: { gte: dayStart, lt: dayEnd },
        assignments: { some: { employeeId: shift.employeeId } }
      },
      orderBy: { startTime: 'asc' }
    })

    // 2. Lógica de penalización si se RECHAZA
    if (status === 'REJECTED' && firstService?.startTime) {
      const scheduledStart = new Date(firstService.startTime)
      const actualStart = new Date(shift.clockIn)
      
      // Calculamos la diferencia en horas (ej. 2.0)
      const diffMs = actualStart.getTime() - scheduledStart.getTime()
      const diffHours = Math.max(0, diffMs / (1000 * 60 * 60))

      // Sumamos esas horas a la deuda del empleado
      await prisma.employee.update({
        where: { id: shift.employeeId },
        data: {
          debtHours: { increment: diffHours }
        }
      })
    }

    // 3. Actualizamos el estado de la justificación
    const updatedShift = await prisma.workShift.update({
      where: { id: parseInt(id) },
      data: { approvalStatus: status }
    })

    return NextResponse.json(updatedShift)
  } catch (error) {
    console.error("REVIEW ERROR:", error)
    return NextResponse.json({ error: "Error al procesar revisión" }, { status: 500 })
  }
}