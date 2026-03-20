import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params
    const serviceId = parseInt(id)

    const body = await req.json()

    const updateData: any = {}

    if (body.status) {
      updateData.status = body.status

      if (body.status === "completed") {
        updateData.actualEndTime = new Date()
      }
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    })

    return NextResponse.json(updated)

  } catch (error) {
    console.error("SERVICE UPDATE ERROR:", error)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const serviceId = parseInt(id)

    await prisma.serviceAssignment.deleteMany({
      where: { serviceId },
    })

    await prisma.service.delete({
      where: { id: serviceId },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("SERVICE DELETE ERROR:", error)
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}