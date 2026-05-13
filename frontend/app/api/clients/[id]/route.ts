import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

//
// GET CLIENT DETAIL
//
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const clientId = Number(id)

    if (!Number.isInteger(clientId)) {
      return NextResponse.json(
        { error: "Invalid client id" },
        { status: 400 }
      )
    }

    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        contracts: {
          orderBy: {
            createdAt: "desc",
          },
        },
        services: {
          include: {
            serviceCode: true,
            assignments: {
              include: {
                employee: true,
              },
            },
          },
          orderBy: [
            { date: "desc" },
            { startTime: "desc" },
          ],
        },
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("CLIENT DETAIL ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

//
// UPDATE CLIENT
//
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const clientId = Number(id)

    if (!Number.isInteger(clientId)) {
      return NextResponse.json(
        { error: "Invalid client id" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.address !== undefined) updateData.address = body.address
    if (body.email !== undefined) updateData.email = body.email
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.category !== undefined) updateData.category = body.category
    if (body.clientType !== undefined) updateData.clientType = body.clientType

    const updated = await prisma.client.update({
      where: {
        id: clientId,
      },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("CLIENT UPDATE ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

//
// DELETE CLIENT
//
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const clientId = Number(id)

    if (!Number.isInteger(clientId)) {
      return NextResponse.json(
        { error: "Invalid client id" },
        { status: 400 }
      )
    }

    await prisma.client.delete({
      where: {
        id: clientId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("CLIENT DELETE ERROR:", error)

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    )
  }
}