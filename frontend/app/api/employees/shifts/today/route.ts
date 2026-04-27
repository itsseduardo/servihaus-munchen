import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

// 1. GET: Saber si ya inició turno hoy
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const shift = await prisma.workShift.findFirst({
      where: {
        employee: { user: { email: session.user.email } },
        date: { gte: today, lt: tomorrow }
      }
    })

    return NextResponse.json(shift || null)
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// 2. PATCH: Marcar Fin de Turno (Clock Out)
export async function PATCH() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    // Buscamos el turno abierto de hoy
    const openShift = await prisma.workShift.findFirst({
      where: {
        employee: { user: { email: session.user.email } },
        date: { gte: today, lt: tomorrow },
        clockOut: null
      }
    })

    if (!openShift) return NextResponse.json({ error: "No hay turno activo para cerrar" }, { status: 400 })

    const updatedShift = await prisma.workShift.update({
      where: { id: openShift.id },
      data: { clockOut: new Date() }
    })

    return NextResponse.json(updatedShift)
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}