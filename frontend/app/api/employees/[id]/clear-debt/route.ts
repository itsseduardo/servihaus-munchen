import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const updatedEmployee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: { debtHours: 0 }
    })

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error("Error clearing debt:", error)
    return NextResponse.json({ error: "Error al saldar la deuda" }, { status: 500 })
  }
}