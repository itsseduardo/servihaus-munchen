import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { employeeId, date, duration, type, reason } = body

    // 1. Mapear el tipo de bloque de tiempo a nuestro Enum de Auditoría
    let auditType: "ADJUSTMENT" | "ABSENCE" | "OVERTIME" = "ADJUSTMENT"
    
    // Asumimos algunos tipos comunes que podrías estar usando
    if (type === "VACATION" || type === "SICK_LEAVE" || type === "ABSENCE") {
      auditType = "ABSENCE"
    } else if (type === "OVERTIME") {
      auditType = "OVERTIME"
    }

    // 2. Ejecutar la Transacción (Todo o Nada)
    const [newBlock, auditLog] = await prisma.$transaction([
      
      // A. Crear el bloque de tiempo (Lo que ya tenías)
      prisma.timeBlock.create({
        data: {
          employeeId: parseInt(employeeId),
          date: new Date(date),
          duration: parseFloat(duration),
          type,
          reason: reason || null,
        },
      }),

      // B. Crear el registro en la Auditoría (Historie & Kontrolle)
      prisma.employeeAuditLog.create({
        data: {
          employeeId: parseInt(employeeId),
          date: new Date(date),
          type: auditType,
          hours: parseFloat(duration),
          reason: `Manuelle Buchung (${type}): ${reason || "Ohne Begründung"}`,
          // Nota: Si usas next-auth, aquí podrías sacar el nombre de la sesión
          // const session = await getServerSession()
          // performedBy: session?.user?.name || "Administrator"
          performedBy: "Administrator", 
        }
      })
    ])

    // Retornamos el bloque de tiempo como lo esperaba el frontend
    return NextResponse.json(newBlock)
    
  } catch (error) {
    console.error("TIME_BLOCK_CREATE_ERROR:", error)
    return NextResponse.json({ error: "Fehler beim Erstellen des Zeitblocks" }, { status: 500 })
  }
}