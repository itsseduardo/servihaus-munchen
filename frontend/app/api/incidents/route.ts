import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const incidents = await prisma.employeeAuditLog.findMany({
      orderBy: {
        date: 'desc' // Del más reciente al más antiguo
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            profession: true
          }
        }
      }
    })

    return NextResponse.json(incidents)
  } catch (error) {
    console.error("ERROR FETCHING GLOBAL INCIDENTS:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Vorfälle" }, { status: 500 })
  }
}