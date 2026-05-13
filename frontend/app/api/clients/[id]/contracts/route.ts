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

export async function GET(
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

    const contracts = await prisma.clientContract.findMany({
      where: {
        clientId,
      },
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(contracts)
  } catch (error) {
    console.error("CLIENT CONTRACTS GET ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { id } = await context.params
    const clientId = Number(id)

    if (!Number.isInteger(clientId)) {
      return NextResponse.json(
        { error: "Invalid client id" },
        { status: 400 }
      )
    }

    const body = await req.json()

    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : "Kundenvertrag"

    const contract = await prisma.clientContract.create({
      data: {
        clientId,
        title,
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
        action: "CREATE_CLIENT_CONTRACT",
        entityType: "CLIENT_CONTRACT",
        entityId: contract.id,
        userId: auth.userId,
        oldValue: null,
        newValue: JSON.stringify(contract),
        reason: "Client contract created",
      },
    })

    return NextResponse.json(contract)
  } catch (error) {
    console.error("CLIENT CONTRACT CREATE ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}