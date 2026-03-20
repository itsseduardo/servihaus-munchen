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

    if (!clientName || !date || !time || !address || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const startTime = new Date(`${date}T${time}`)
    const durationHours = Number(duration)

    const plannedEndTime = new Date(
      startTime.getTime() + durationHours * 60 * 60 * 1000
    )

    //  VALIDACIÓN DE SOLAPAMIENTO
    if (employees?.length) {
      for (const employeeId of employees) {

        const conflicts = await prisma.serviceAssignment.findMany({
          where: {
            employeeId,
            service: {
              AND: [
                { startTime: { lt: plannedEndTime } },
                {
                  OR: [
                    { actualEndTime: null },
                    { actualEndTime: { gt: startTime } }
                  ]
                }
              ]
            }
          },
          include: { service: true }
        })

        if (conflicts.length > 0) {
          return NextResponse.json(
            {
              error: `Employee ${employeeId} already has a service in this time range`
            },
            { status: 400 }
          )
        }
      }
    }

    let client

    if (clientId) {
      client = await prisma.client.findUnique({
        where: { id: clientId },
      })
    }

    if (!client) {
      const lastClient = await prisma.client.findFirst({
        orderBy: { id: "desc" },
      })

      const nextNumber = lastClient ? lastClient.id + 1 : 1000

      client = await prisma.client.create({
        data: {
          name: clientName,
          clientCode: `KD-${nextNumber}`,
        },
      })
    }

    const tempService = await prisma.service.create({
      data: {
        code: "TEMP",
        serviceType: serviceType || "General Service",
        date: new Date(date),
        time,
        duration,
        startTime,
        address,
        status: "assigned",
        requiresKey: requiresKey || false,
        clientId: client.id,
        assignments: employees?.length
          ? {
              create: employees.map((employeeId: number) => ({
                employee: { connect: { id: employeeId } },
              })),
            }
          : undefined,
      },
    })

    const finalCode = `SH-${1000 + tempService.id}`

    const updated = await prisma.service.update({
      where: { id: tempService.id },
      data: { code: finalCode },
    })

    return NextResponse.json(updated)

  } catch (error) {
    console.error("SERVICE CREATE ERROR:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
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