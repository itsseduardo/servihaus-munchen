import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { employeeId, date, duration, type, reason } = body

    const newBlock = await prisma.timeBlock.create({
      data: {
        employeeId: parseInt(employeeId),
        date: new Date(date),
        duration: parseFloat(duration),
        type,
        reason: reason || null,
      },
    })

    return NextResponse.json(newBlock)
  } catch (error) {
    console.error("TIME_BLOCK_CREATE_ERROR:", error)
    return NextResponse.json({ error: "Fehler beim Erstellen des Zeitblocks" }, { status: 500 })
  }
}