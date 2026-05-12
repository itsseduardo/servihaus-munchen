import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

const WEEKDAY_MAP: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
}

function parseDateParts(dateString: string) {
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number)

  if (!year || !month || !day) {
    throw new Error("Invalid date")
  }

  return { year, month, day }
}

function makeUtcDateOnly(dateString: string) {
  const { year, month, day } = parseDateParts(dateString)

  // Guardamos la fecha calendario al mediodía UTC para evitar que
  // se visualice como el día anterior en zonas horarias negativas.
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0))
}

function makeUtcDateStart(dateString: string) {
  const { year, month, day } = parseDateParts(dateString)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

function makeUtcDateEnd(dateString: string) {
  const { year, month, day } = parseDateParts(dateString)
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
}

function makeUtcDateTime(dateString: string, timeString: string) {
  const { year, month, day } = parseDateParts(dateString)
  const [hours, minutes] = timeString.split(":").map(Number)

  return new Date(
    Date.UTC(year, month - 1, day, hours || 0, minutes || 0, 0, 0)
  )
}

function cloneUtcDateOnly(date: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      12,
      0,
      0,
      0
    )
  )
}

function buildStartTimeFromDate(date: Date, hours: number, minutes: number) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours || 0,
      minutes || 0,
      0,
      0
    )
  )
}

function addUtcDays(date: Date, days: number) {
  const copy = cloneUtcDateOnly(date)
  copy.setUTCDate(copy.getUTCDate() + days)
  return copy
}

function addUtcMonths(date: Date, months: number) {
  const copy = cloneUtcDateOnly(date)
  copy.setUTCMonth(copy.getUTCMonth() + months)
  return copy
}

async function createRecurringInstance(
  date: Date,
  hours: number,
  minutes: number,
  parentId: number,
  clientId: number,
  body: any,
  employees: number[]
) {
  const instanceDate = cloneUtcDateOnly(date)
  const instanceStart = buildStartTimeFromDate(instanceDate, hours, minutes)

  return prisma.service.create({
    data: {
      serviceCodeId: body.serviceCodeId ? Number(body.serviceCodeId) : null,
      date: instanceDate,
      startTime: instanceStart,
      duration: Number(body.duration),
      billedHours:
        body.pricingModel === "FIXED"
          ? 0
          : Number(body.billedHours || body.duration),
      teamDuration: Number(body.teamDuration || body.duration),
      pricingModel: body.pricingModel || "TIME",
      travelTime: Number(body.travelTime) || 0,
      parentServiceId: parentId,
      address: body.address,
      status: "assigned",
      requiresKey: body.requiresKey || false,
      notes: body.notes || null,
      importantNotes: body.importantNotes || null,
      clientId,
      assignments: employees?.length
        ? {
            create: employees.map((id: number) => ({
              employee: {
                connect: { id },
              },
            })),
          }
        : undefined,
    },
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      clientId,
      clientCode,
      clientName,
      serviceCodeId,
      date,
      time,
      duration,
      billedHours,
      teamDuration,
      address,
      requiresKey,
      employees,
      notes,
      importantNotes,
      isRecurring,
      recurrenceRule,
      recurrenceInterval,
      recurrenceEnd,
      recurrenceDays,
      pricingModel,
      travelTime,
    } = body

    const durationHours = Number(duration)
    const interval = Number(recurrenceInterval) || 1
    const tTime = Number(travelTime) || 0

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

    const [hours, minutes] = time.split(":").map(Number)

    const serviceDate = makeUtcDateOnly(date)
    const startTime = makeUtcDateTime(date, time)

    let client = clientId
      ? await prisma.client.findUnique({
          where: { id: Number(clientId) },
        })
      : null

    if (!client && clientCode) {
      client = await prisma.client.findUnique({
        where: { clientCode },
      })
    }

    if (!client) {
      if (!clientCode) {
        return NextResponse.json(
          { error: "Client code required" },
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

    const recurrenceEndDate =
      isRecurring && recurrenceEnd ? makeUtcDateEnd(recurrenceEnd) : null

    const baseService = await prisma.service.create({
      data: {
        serviceCodeId: serviceCodeId ? Number(serviceCodeId) : null,
        date: serviceDate,
        startTime,
        duration: durationHours,
        billedHours:
          pricingModel === "FIXED" ? 0 : billedHours ?? durationHours,
        teamDuration: teamDuration ?? durationHours,
        pricingModel: pricingModel || "TIME",
        travelTime: tTime,
        recurrenceRule: isRecurring ? recurrenceRule : null,
        recurrenceInterval: isRecurring ? interval : null,
        recurrenceEnd: recurrenceEndDate,
        address,
        status: "assigned",
        requiresKey: requiresKey || false,
        notes: notes || null,
        importantNotes: importantNotes || null,
        clientId: client.id,
        assignments: employees?.length
          ? {
              create: employees.map((id: number) => ({
                employee: {
                  connect: { id },
                },
              })),
            }
          : undefined,
      },
    })

    if (isRecurring && recurrenceRule && recurrenceEndDate) {
      let safetyCounter = 0
      const MAX_RECURRENCES = 100
      const employeeIds = Array.isArray(employees) ? employees : []

      if (recurrenceRule === "WEEKLY" && recurrenceDays?.length > 0) {
        let weekCursor = cloneUtcDateOnly(serviceDate)

        while (weekCursor <= recurrenceEndDate && safetyCounter < MAX_RECURRENCES) {
          for (const dayCode of recurrenceDays) {
            const targetDay = WEEKDAY_MAP[dayCode]

            if (targetDay === undefined) continue

            const tempDate = cloneUtcDateOnly(weekCursor)

            const currentDay = tempDate.getUTCDay()
            const diff = targetDay - currentDay

            tempDate.setUTCDate(tempDate.getUTCDate() + diff)
            tempDate.setUTCHours(12, 0, 0, 0)

            if (tempDate > serviceDate && tempDate <= recurrenceEndDate) {
              await createRecurringInstance(
                tempDate,
                hours,
                minutes,
                baseService.id,
                client.id,
                body,
                employeeIds
              )

              safetyCounter++
            }
          }

          weekCursor = addUtcDays(weekCursor, 7 * interval)
        }
      } else {
        let currentPointer = cloneUtcDateOnly(serviceDate)

        while (safetyCounter < MAX_RECURRENCES) {
          if (recurrenceRule === "DAILY") {
            currentPointer = addUtcDays(currentPointer, interval)
          } else if (recurrenceRule === "BIWEEKLY") {
            currentPointer = addUtcDays(currentPointer, 14)
          } else if (recurrenceRule === "MONTHLY") {
            currentPointer = addUtcMonths(currentPointer, interval)
          } else {
            break
          }

          if (currentPointer > recurrenceEndDate) break

          await createRecurringInstance(
            currentPointer,
            hours,
            minutes,
            baseService.id,
            client.id,
            body,
            employeeIds
          )

          safetyCounter++
        }
      }
    }

    return NextResponse.json(baseService)
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

    const dateKey = dateParam.slice(0, 10)

    const start = makeUtcDateStart(dateKey)
    const end = makeUtcDateEnd(dateKey)

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

    const formatted = services.map((service) => ({
      ...service,
      time: service.startTime
        ? service.startTime.toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "UTC",
          })
        : null,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("GET ERROR:", error)

    return NextResponse.json([], { status: 200 })
  }
}