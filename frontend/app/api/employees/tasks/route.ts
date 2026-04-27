import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    // Obtenemos el filtro de la URL (today, tomorrow, history)
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get("filter") || "today"

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { employee: true }
    })
    
    if (!user?.employee) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })

    // Calculamos las fechas
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(today.getDate() + 2)

    let dateQuery = {}
    
    if (filter === "today") {
      dateQuery = { gte: today, lt: tomorrow }
    } else if (filter === "tomorrow") {
      dateQuery = { gte: tomorrow, lt: dayAfterTomorrow }
    } else if (filter === "history") {
      dateQuery = { lt: today } // Todo lo anterior a hoy
    }

    const tasks = await prisma.service.findMany({
      where: {
        date: dateQuery,
        assignments: { some: { employeeId: user.employee.id } },
        // Si es historial, solo mostramos los completados
        ...(filter === "history" ? { status: "completed" } : {})
      },
      include: {
        client: true,
        serviceCode: true
      },
      orderBy: filter === "history" ? { date: 'desc' } : { startTime: 'asc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("ERROR FETCHING TASKS:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}