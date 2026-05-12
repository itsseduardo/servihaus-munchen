import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

function formatDuration(teamDuration?: number | null) {
  if (!teamDuration || teamDuration <= 0) return "—"

  const totalMinutes = Math.round(teamDuration * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`
  if (hours > 0) return `${hours}h`
  return `${minutes}min`
}

function formatTime(startTime?: Date | null) {
  if (!startTime) return "—"

  return startTime.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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

    const services = await prisma.service.findMany({
      where: {
        clientId: user.client.id,
        date: {
          lt: new Date(),
        },
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
      include: {
        serviceCode: true,
        assignments: {
          include: {
            employee: true,
          },
        },
      },
    })

    const items = services.map((service) => {
      const professionals = service.assignments.map(
        (assignment) =>
          `${assignment.employee.firstName} ${assignment.employee.lastName}`
      )

      return {
        id: service.id,
        code:
          service.serviceCode?.code ||
          service.code ||
          `S-${service.id}`,
        dateIso: service.date.toISOString(),
        dateLabel: service.date.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        timeLabel: formatTime(service.startTime),
        serviceType:
          service.serviceCode?.description ||
          service.code ||
          "Reinigung",
        category:
          service.serviceCode?.code ||
          service.code ||
          "Allgemein",
        durationLabel: formatDuration(service.teamDuration),
        durationValue: service.teamDuration ?? 0,
        professionals,
        primaryProfessional: professionals[0] || "Nicht zugewiesen",
        fullTeam:
          professionals.length > 0
            ? professionals.join(" · ")
            : "Nicht zugewiesen",
        status: service.status || "COMPLETED",
        notes: service.notes || "",
      }
    })

    return NextResponse.json({
      items,
      total: items.length,
    })
  } catch (error) {
    console.error("CLIENT HISTORY GET ERROR:", error)

    return NextResponse.json(
      { error: "Verlauf konnte nicht geladen werden." },
      { status: 500 }
    )
  }
}