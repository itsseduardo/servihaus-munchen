import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      clientId, clientCode, clientName, serviceCodeId,
      date, time, duration, billedHours, teamDuration,
      address, requiresKey, employees, notes, importantNotes,
      isRecurring, recurrenceRule, recurrenceInterval,
      recurrenceEnd, recurrenceDays,
      pricingModel, // <-- NUEVO: TIME o FIXED
      travelTime    // <-- NUEVO: Tiempo de desplazamiento
    } = body

    const durationHours = Number(duration)
    const interval = Number(recurrenceInterval) || 1
    const tTime = Number(travelTime) || 0

    // 1. VALIDACIÓN INICIAL
    if (!clientName || !address || !date || !time || isNaN(durationHours) || durationHours <= 0) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 })
    }

    // 2. PROCESAMIENTO DE FECHAS
    const [year, month, day] = date.split("-").map(Number)
    const serviceDate = new Date(Date.UTC(year, month - 1, day))
    const [hours, minutes] = time.split(":").map(Number)
    
    const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0)

    // 3. OBTENER O CREAR CLIENTE
    let client = clientId ? await prisma.client.findUnique({ where: { id: clientId } }) : null;
    if (!client && clientCode) client = await prisma.client.findUnique({ where: { clientCode } });
    if (!client) {
      if (!clientCode) return NextResponse.json({ error: "Client code required" }, { status: 400 });
      client = await prisma.client.create({
        data: { clientCode, name: clientName, address: address || null }
      });
    }

    // 4. CREAR EL SERVICIO BASE (EL PRIMERO)
    const baseService = await prisma.service.create({
      data: {
        serviceCodeId: serviceCodeId ? Number(serviceCodeId) : null,
        date: serviceDate,
        startTime,
        duration: durationHours,
        billedHours: pricingModel === "FIXED" ? 0 : (billedHours ?? durationHours),
        teamDuration: teamDuration ?? durationHours,
        pricingModel: pricingModel || "TIME", // <-- NUEVO
        travelTime: tTime,                    // <-- NUEVO
        recurrenceRule: isRecurring ? recurrenceRule : null,
        recurrenceInterval: isRecurring ? interval : null,
        recurrenceEnd: isRecurring && recurrenceEnd ? new Date(recurrenceEnd) : null,
        address,
        status: "assigned",
        requiresKey: requiresKey || false,
        notes: notes || null,
        importantNotes: importantNotes || null,
        clientId: client.id,
        assignments: employees?.length ? {
          create: employees.map((id: number) => ({ employee: { connect: { id } } }))
        } : undefined,
      },
    })

    // 5. LÓGICA DE RECURRENCIA CORREGIDA
    if (isRecurring && recurrenceRule && recurrenceEnd) {
      const stopDate = new Date(recurrenceEnd)
      let currentPointer = new Date(startTime)
      let safetyCounter = 0 
      const MAX_RECURRENCES = 100 

      // Caso especial: SEMANAL (WEEKLY) con días específicos
      if (recurrenceRule === "WEEKLY" && recurrenceDays?.length > 0) {
        const weekdayMap: Record<string, number> = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 }
        let weekCursor = new Date(serviceDate)

        while (weekCursor <= stopDate && safetyCounter < MAX_RECURRENCES) {
          for (const dayCode of recurrenceDays) {
            const targetDay = weekdayMap[dayCode]
            const tempDate = new Date(weekCursor)
            const diff = targetDay - tempDate.getDay()
            tempDate.setDate(tempDate.getDate() + diff)

            if (tempDate > serviceDate && tempDate <= stopDate) {
              await createRecurringInstance(tempDate, hours, minutes, baseService.id, client.id, body, employees);
              safetyCounter++
            }
          }
          weekCursor.setDate(weekCursor.getDate() + (7 * interval))
        }
      } 
      // Otros casos: DIARIO, QUINCENAL (BIWEEKLY), MENSUAL
      else {
        while (safetyCounter < MAX_RECURRENCES) {
          if (recurrenceRule === "DAILY") currentPointer.setDate(currentPointer.getDate() + interval)
          else if (recurrenceRule === "BIWEEKLY") currentPointer.setDate(currentPointer.getDate() + 14)
          else if (recurrenceRule === "MONTHLY") currentPointer.setMonth(currentPointer.getMonth() + interval)
          else break

          if (currentPointer > stopDate) break
          
          await createRecurringInstance(currentPointer, hours, minutes, baseService.id, client.id, body, employees);
          safetyCounter++
        }
      }
    }

    return NextResponse.json(baseService)

  } catch (error) {
    console.error("SERVICE CREATE ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// FUNCIÓN AUXILIAR ACTUALIZADA
async function createRecurringInstance(date: Date, h: number, m: number, parentId: number, clientId: number, body: any, employees: number[]) {
  const instanceDate = new Date(date)
  instanceDate.setHours(0, 0, 0, 0)
  
  const instanceStart = new Date(date)
  instanceStart.setHours(h, m, 0, 0)

  return await prisma.service.create({
    data: {
      serviceCodeId: body.serviceCodeId ? Number(body.serviceCodeId) : null,
      date: instanceDate,
      startTime: instanceStart,
      duration: Number(body.duration),
      billedHours: body.pricingModel === "FIXED" ? 0 : Number(body.billedHours || body.duration),
      teamDuration: Number(body.teamDuration || body.duration),
      pricingModel: body.pricingModel || "TIME", // Herencia de modelo
      travelTime: Number(body.travelTime) || 0, // Herencia de tiempo de viaje
      parentServiceId: parentId,
      address: body.address,
      status: "assigned",
      requiresKey: body.requiresKey || false,
      notes: body.notes || null,
      importantNotes: body.importantNotes || null,
      clientId,
      assignments: employees?.length ? {
        create: employees.map((id: number) => ({ employee: { connect: { id } } }))
      } : undefined,
    },
  })
}

// GET (Mantiene la funcionalidad de reporte pero preparado para los nuevos campos)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get("date")

    if (!dateParam) return NextResponse.json([])

    const parsedDate = new Date(dateParam)
    if (isNaN(parsedDate.getTime())) return NextResponse.json([])

    const start = new Date(parsedDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(parsedDate)
    end.setHours(23, 59, 59, 999)

    const services = await prisma.service.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      include: {
        client: true,
        serviceCode: true,
        assignments: { include: { employee: true } },
      },
      orderBy: { startTime: "asc" },
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