import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const VALID_STATUSES = ["PENDING", "IN_REVIEW", "RESOLVED", "REJECTED"]

function isValidStatus(status: unknown) {
  return typeof status === "string" && VALID_STATUSES.includes(status)
}

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

  return { userId: session.user.id }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const { id } = await context.params
    const requestId = Number(id)

    if (!Number.isInteger(requestId)) {
      return NextResponse.json(
        { error: "Invalid request id" },
        { status: 400 }
      )
    }

    const body = await req.json()

    if (!isValidStatus(body.status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const existing = await prisma.clientRequest.findUnique({
      where: {
        id: requestId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      )
    }

    const adminNotes =
      typeof body.adminNotes === "string"
        ? body.adminNotes.trim() || null
        : existing.adminNotes

    const adminResponse =
      typeof body.adminResponse === "string"
        ? body.adminResponse.trim() || null
        : existing.adminResponse

    const statusChanged = existing.status !== body.status

    const updated = await prisma.clientRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: body.status,
        adminNotes,
        adminResponse,
        statusChangedAt: statusChanged ? new Date() : existing.statusChangedAt,
        resolvedAt:
          body.status === "RESOLVED" || body.status === "REJECTED"
            ? new Date()
            : null,
      },
      include: {
        client: true,
        service: {
          include: {
            serviceCode: true,
          },
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_CLIENT_REQUEST",
        entityType: "CLIENT_REQUEST",
        entityId: updated.id,
        userId: auth.userId,
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updated),
        reason: "Client request updated by admin",
      },
    }).catch(() => null)

    return NextResponse.json(updated)
  } catch (error) {
    console.error("ADMIN CLIENT REQUEST UPDATE ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}