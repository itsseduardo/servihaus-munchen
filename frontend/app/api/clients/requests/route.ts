import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const VALID_TYPES = [
  "EXTRA_SERVICE",
  "SERVICE_ISSUE",
  "CHANGE_REQUEST",
  "CANCELLATION_REQUEST",
]

function isValidType(type: unknown) {
  return typeof type === "string" && VALID_TYPES.includes(type)
}

async function getClientFromSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  if (session.user.role !== "CLIENT") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  const client = await prisma.client.findFirst({
    where: {
      user: {
        id: session.user.id,
      },
    },
  })

  if (!client) {
    return {
      error: NextResponse.json(
        { error: "No client profile linked to this user" },
        { status: 404 }
      ),
    }
  }

  return { client }
}

export async function GET() {
  try {
    const result = await getClientFromSession()
    if (result.error) return result.error

    const requests = await prisma.clientRequest.findMany({
      where: {
        clientId: result.client.id,
      },
      include: {
        service: {
          include: {
            serviceCode: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("CLIENT REQUESTS GET ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const result = await getClientFromSession()
    if (result.error) return result.error

    const body = await req.json()

    if (!isValidType(body.type)) {
      return NextResponse.json(
        { error: "Invalid request type" },
        { status: 400 }
      )
    }

    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : "Neue Anfrage"

    const message =
      typeof body.message === "string" && body.message.trim()
        ? body.message.trim()
        : null

    const serviceId =
      body.serviceId !== undefined && body.serviceId !== null && body.serviceId !== ""
        ? Number(body.serviceId)
        : null

    if (serviceId && !Number.isInteger(serviceId)) {
      return NextResponse.json(
        { error: "Invalid service id" },
        { status: 400 }
      )
    }

    if (serviceId) {
      const service = await prisma.service.findFirst({
        where: {
          id: serviceId,
          clientId: result.client.id,
        },
      })

      if (!service) {
        return NextResponse.json(
          { error: "Service not found for this client" },
          { status: 404 }
        )
      }
    }

    const request = await prisma.clientRequest.create({
      data: {
        clientId: result.client.id,
        serviceId,
        type: body.type,
        title,
        message,
        requestedDate: body.requestedDate
          ? new Date(body.requestedDate)
          : null,
        requestedTime: body.requestedTime || null,
      },
      include: {
        service: {
          include: {
            serviceCode: true,
          },
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        action: "CREATE_CLIENT_REQUEST",
        entityType: "CLIENT_REQUEST",
        entityId: request.id,
        userId: String(result.client.id),
        oldValue: null,
        newValue: JSON.stringify(request),
        reason: "Client created request",
      },
    }).catch(() => null)

    return NextResponse.json(request)
  } catch (error) {
    console.error("CLIENT REQUEST CREATE ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}