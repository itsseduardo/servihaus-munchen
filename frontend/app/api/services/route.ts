import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      clientName,
      clientId,
      serviceType,
      date,
      time,
      duration,
      address,
      requiresKey,
      employees,
    } = body

    if (!clientName || !date || !time || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    let client

    //  Si viene clientId → usar existente
    if (clientId) {
      client = await prisma.client.findUnique({
        where: { id: clientId },
      })
    }

    //  Si no existe → crear nuevo
    if (!client) {
      const lastClient = await prisma.client.findFirst({
        orderBy: { id: "desc" },
      })

      const nextNumber = lastClient ? lastClient.id + 1 : 1000

      client = await prisma.client.create({
        data: {
          name: clientName,
          clientCode: `KD - ${nextNumber}`,
        address,
        },
      })
    }

    // 🔹 Crear servicio temporal
    const tempService = await prisma.service.create({
      data: {
        code: "TEMP",
        serviceType: serviceType || "General Service",
        date: new Date(date),
        time,
        duration: duration || null, // sigue siendo string en tu schema
        address,
        status: "confirmed",
        requiresKey: requiresKey || false,
        clientId: client.id,

        // 🔹 Crear asignaciones si hay empleados
        assignments:
          employees && employees.length > 0
            ? {
              create: employees.map((employeeId: number) => ({
                employee: {
                  connect: { id: employeeId },
                },
              })),
            }
            : undefined,
      },
    })

    // 🔹 Generar código definitivo del servicio
    const finalCode = `SH - ${1000 + tempService.id}`

    const updated = await prisma.service.update({
      where: { id: tempService.id },
      data: { code: finalCode },
      include: {
        assignments: {
          include: {
            employee: true,
          },
        },
      },
    })

    return NextResponse.json(updated)

  } catch (error) {
    console.error("POST ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get("date")

    if (!dateParam) {
      return NextResponse.json([])
    }

    const parsedDate = new Date(dateParam)

    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json([])
    }

    const start = new Date(parsedDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(parsedDate)
    end.setHours(23, 59, 59, 999)

    const services = await prisma.service.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        client: true,
        assignments: {
          include: {
            employee: true,

          }
        }
      },
      orderBy: {
        time: "asc",
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("GET ERROR:", error)
    return NextResponse.json([], { status: 200 })
  }
}