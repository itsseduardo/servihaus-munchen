import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

function splitAddress(address?: string | null) {
  if (!address) {
    return {
      street: "",
      postalCode: "",
      city: "",
    }
  }

  return {
    street: address,
    postalCode: "",
    city: "",
  }
}

function formatServiceTime(startTime?: Date | null, teamDuration?: number | null) {
  if (!startTime) return "Noch nicht festgelegt"

  const start = startTime.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  if (!teamDuration) return start

  const endDate = new Date(startTime)
  endDate.setMinutes(endDate.getMinutes() + teamDuration * 60)

  const end = endDate.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  return `${start} - ${end}`
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        client: {
          include: {
            services: {
              where: {
                date: {
                  gte: new Date(),
                },
              },
              orderBy: [
                { date: "asc" },
                { startTime: "asc" },
              ],
              take: 1,
              include: {
                serviceCode: true,
                assignments: {
                  include: {
                    employee: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user?.client) {
      return NextResponse.json(
        { error: "No client profile linked to this user" },
        { status: 404 }
      )
    }

    const client = user.client
    const nextService = client.services[0] || null

    const totalServices = await prisma.service.count({
      where: {
        clientId: client.id,
      },
    })

    const activePlanning = await prisma.service.count({
      where: {
        clientId: client.id,
        date: {
          gte: new Date(),
        },
      },
    })

    const addressParts = splitAddress(client.address)

    const staff =
      nextService?.assignments?.length
        ? nextService.assignments
            .map((assignment) =>
              `${assignment.employee.firstName} ${assignment.employee.lastName}`
            )
            .join(" & ")
        : "Noch nicht zugewiesen"

    return NextResponse.json({
      id: client.id,
      clientCode: client.clientCode,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      category: client.category,
      clientType: client.clientType,
      hasCompletedOnboarding: client.hasCompletedOnboarding,

      onboardingData: {
        firstName: client.name?.split(" ")[0] || "",
        lastName: client.name?.split(" ").slice(1).join(" ") || "",
        phone: client.phone || "",
        street: addressParts.street,
        postalCode: addressParts.postalCode,
        city: addressParts.city,
      },

      nextService: nextService
        ? {
            id: nextService.id,
            date: nextService.date.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "short",
            }),
            day: nextService.date.toLocaleDateString("de-DE", {
              weekday: "long",
            }),
            time: formatServiceTime(
              nextService.startTime,
              nextService.teamDuration
            ),
            type:
              nextService.serviceCode?.description ||
              nextService.code ||
              "Reinigung",
            staff,
            status: nextService.status || "confirmed",
          }
        : null,

      stats: {
        totalServices,
        activePlanning,
        loyaltyPoints: totalServices * 25,
        pendingInvoices: 0,
      },

      recommendation: {
        title: "Dampfdesinfektion",
        reason: "Empfohlen als Zusatzleistung für Ihren nächsten Termin",
        icon: "sanitizer",
      },
    })
  } catch (error) {
    console.error("CLIENT ME GET ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await req.json()

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        client: true,
      },
    })

    if (!user?.client) {
      return NextResponse.json(
        { error: "No client profile linked to this user" },
        { status: 404 }
      )
    }

    const fullName = [body.firstName, body.lastName]
      .filter(Boolean)
      .join(" ")
      .trim()

    const address = [body.street, body.postalCode, body.city]
      .filter(Boolean)
      .join(", ")
      .trim()

    const updatedClient = await prisma.client.update({
      where: {
        id: user.client.id,
      },
      data: {
        ...(fullName ? { name: fullName } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(address ? { address } : {}),
        hasCompletedOnboarding: true,
      },
    })

    return NextResponse.json({
      success: true,
      client: updatedClient,
    })
  } catch (error) {
    console.error("CLIENT ME PATCH ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}