import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 1. Turnos (Asistencia diaria)
    const shifts = await prisma.workShift.findMany({
      include: { employee: true },
      orderBy: { date: 'desc' }
    })

    // 2. Servicios con Ajustes (Lo que José toca en "Zeit buchen")
    const manualAdjustments = await prisma.service.findMany({
      where: {
        OR: [
          { adminNotes: { not: null } },
          { overtimeJustification: { not: null } }
        ]
      },
      include: { 
        assignments: { include: { employee: true } },
        client: true 
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ shifts, manualAdjustments })
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar la bitácora" }, { status: 500 })
  }
}