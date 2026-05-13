import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  if (session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return {
    userId: session.user.id,
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { id } = await context.params
    const contractId = Number(id)

    if (!Number.isInteger(contractId)) {
      return NextResponse.json(
        { error: "Invalid contract id" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const existing = await prisma.clientContract.findUnique({
      where: {
        id: contractId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      )
    }

    const updated = await prisma.clientContract.update({
      where: {
        id: contractId,
      },
      data: {
        title: body.title || existing.title,
        contractType: body.contractType || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        frequency: body.frequency || null,
        agreedHours:
          body.agreedHours === "" || body.agreedHours === null
            ? null
            : Number(body.agreedHours),
        agreedPrice:
          body.agreedPrice === "" || body.agreedPrice === null
            ? null
            : Number(body.agreedPrice),
        pricingModel: body.pricingModel || "TIME",
        notes: body.notes || null,
        status: body.status || "ACTIVE",
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_CLIENT_CONTRACT",
        entityType: "CLIENT_CONTRACT",
        entityId: updated.id,
        userId: auth.userId,
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updated),
        reason: "Client contract updated",
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("CLIENT CONTRACT UPDATE ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}