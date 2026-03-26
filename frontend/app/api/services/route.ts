import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      clientId,
      clientCode,
      clientName,
      serviceCodeId,      // ID del catálogo ServiceCode
      date,
      time,
      duration,
      address,
      requiresKey,
      employees,
      notes,
      importantNotes,
    } = body

    const durationHours = Number(duration)

    if (
      !clientName ||
      !address ||
      !date ||
      !time ||
      isNaN(durationHours) ||
      durationHours <= 0
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      )
    }


    // =========================
    // FECHA Y HORA
    // =========================
    const [year, month, day] = date.split("-").map(Number)
    const serviceDate = new Date(Date.UTC(year, month - 1, day))

    const [hours, minutes] = time.split(":").map(Number)

    const startTime = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      0,
      0
    )

    const plannedEndTime = new Date(
      startTime.getTime() + durationHours * 60 * 60 * 1000
    )

    // =========================
    // VALIDAR SOLAPAMIENTO
    // =========================
    if (employees?.length) {
      for (const employeeId of employees) {
        const existingAssignments = await prisma.serviceAssignment.findMany({
          where: { employeeId },
          include: { service: true },
        })

        for (const assignment of existingAssignments) {
          const existing = assignment.service

          if (!existing.startTime || !existing.duration) continue

          const existingStart = new Date(existing.startTime)
          const existingEnd = new Date(
            existingStart.getTime() +
            existing.duration * 60 * 60 * 1000
          )

          const overlaps =
            startTime < existingEnd &&
            plannedEndTime > existingStart

          if (overlaps) {
            return NextResponse.json(
              { error: "Employee already assigned in this time range" },
              { status: 400 }
            )
          }
        }
      }
    }

    // =========================
    // OBTENER O CREAR CLIENTE
    // =========================
    let client = null

    if (clientId) {
      client = await prisma.client.findUnique({
        where: { id: clientId },
      })
    }

    if (!client && clientCode) {
      client = await prisma.client.findUnique({
        where: { clientCode },
      })
    }

    if (!client) {
      if (!clientCode) {
        return NextResponse.json(
          { error: "Client code required for new client" },
          { status: 400 }
        )
      }

      client = await prisma.client.create({
        data: {
          clientCode,
          name: clientName,
          address: address || null,
        },
      })
    }

    // =========================
    // CREAR SERVICIO
    // =========================
    
    const service = await prisma.service.create({
      data: {
        serviceCodeId: body.serviceCodeId ? Number(serviceCodeId) : null, 
        date: serviceDate,
        startTime,
        duration: durationHours,
        address,
        status: "assigned",
        requiresKey: requiresKey || false,
        notes: notes || null,
        importantNotes: importantNotes || null,
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

    return NextResponse.json(service)

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
        serviceCode: true,
        assignments: {
          include: {
            employee: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    })

    const formatted = services.map(service => ({
      ...service,
      time: service.startTime
        ? service.startTime.toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        : null,
    }))

    return NextResponse.json(formatted)

  } catch (error) {
    console.error("GET ERROR:", error)
    return NextResponse.json([], { status: 200 })
  }
}