import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { justification } = await req.json()

    // 1. Obtener al empleado
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employee: true }
    })
    
    if (!user?.employee) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })

    // 2. Lógica de Puntualidad: Buscamos el primer servicio de hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const firstService = await prisma.service.findFirst({
      where: {
        date: { gte: today, lt: tomorrow },
        assignments: { some: { employeeId: user.employee.id } }
      },
      orderBy: { startTime: 'asc' }
    })

    let status: "ON_TIME" | "LATE" = "ON_TIME"
    const now = new Date()

    if (firstService?.startTime) {
      // Damos un margen de 5 minutos de gracia
      const scheduledTime = new Date(firstService.startTime)
      scheduledTime.setMinutes(scheduledTime.getMinutes() + 5)
      
      if (now > scheduledTime) {
        status = "LATE"
        if (!justification) {
          return NextResponse.json({ error: "Justificación requerida por tardanza" }, { status: 400 })
        }
      }
    }

    // 3. Crear el turno
    const shift = await prisma.workShift.create({
      data: {
        employeeId: user.employee.id,
        status,
        justification: status === "LATE" ? justification : null,
        clockIn: now
      }
    })

    return NextResponse.json(shift)
  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}