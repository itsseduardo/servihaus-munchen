import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

export async function GET() {
  try {
    const session = await getServerSession()
    
    // 1. Validamos usando el EMAIL, que es lo que NextAuth siempre nos da
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // 2. Buscamos al usuario por su email y le pedimos a Prisma que traiga sus datos de empleado
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        employee: true
      }
    })

    if (!user || !user.employee) {
      return NextResponse.json({ error: "Perfil de empleado no encontrado" }, { status: 404 })
    }

    // 3. Establecemos el rango de tiempo (Desde las 00:00 de hoy hasta las 23:59)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    // 4. Buscamos los servicios asignados a este empleado
    const services = await prisma.service.findMany({
      where: {
        date: {
          gte: todayStart,
          lt: todayEnd
        },
        assignments: {
          some: {
            employeeId: user.employee.id // Usamos el ID que extrajimos en el paso 2
          }
        }
      },
      include: {
        client: true 
      },
      orderBy: {
        startTime: 'asc' 
      }
    })

    // 5. Formateamos los datos para la tarjeta
    const formattedTasks = services.map(srv => {
      const startTimeStr = srv.startTime 
        ? new Date(srv.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) 
        : "TBA"
      
      let endTimeStr = "TBA"
      if (srv.startTime && srv.teamDuration) {
        const end = new Date(srv.startTime.getTime() + (srv.teamDuration * 60 * 60 * 1000))
        endTimeStr = end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      }

      return {
        id: srv.id,
        timeWindow: `${startTimeStr} - ${endTimeStr}`,
        clientId: srv.client.clientCode,
        clientName: srv.client.name,
        address: srv.address || "Adresse nicht angegeben",
        estimatedDuration: srv.teamDuration || 0,
        requiresKey: srv.requiresKey,
        status: srv.status || "assigned",
        actualStartTime: srv.actualStartTime
      }
    })

    return NextResponse.json(formattedTasks)

  } catch (error) {
    console.error("ERROR FETCHING EMPLOYEE TASKS:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}