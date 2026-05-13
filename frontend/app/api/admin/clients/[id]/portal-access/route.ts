import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

const DEFAULT_CLIENT_PASSWORD = "Kundenshm2026*"

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

    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        user: true,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    if (!client.email) {
      return NextResponse.json(
        { error: "Der Kunde hat keine E-Mail-Adresse hinterlegt." },
        { status: 400 }
      )
    }

    const normalizedEmail = client.email.trim().toLowerCase()
    const hashedPassword = await bcrypt.hash(DEFAULT_CLIENT_PASSWORD, 12)

    let user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: client.name,
          email: normalizedEmail,
          password: hashedPassword,
          role: "CLIENT",
          mustChangePassword: true,
        },
      })
    } else {
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: user.name || client.name,
          role: "CLIENT",
          password: hashedPassword,
          mustChangePassword: true,
        },
      })
    }

    const updatedClient = await prisma.client.update({
      where: {
        id: client.id,
      },
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        portalInvitationSentAt: new Date(),
        portalInvitationSentBy: auth.userId,
      },
    })

    const loginUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://servihausmunchen.de"

    const subject = "Ihr Zugang zum ServiHaus Kundenportal"

    const body = `Guten Tag ${client.name},

Ihr Zugang zum ServiHaus Kundenportal wurde erstellt.

Login:
${loginUrl}/login

E-Mail:
${normalizedEmail}

Vorläufiges Passwort:
${DEFAULT_CLIENT_PASSWORD}

Aus Sicherheitsgründen werden Sie beim ersten Login gebeten, Ihr Passwort zu ändern.

Mit freundlichen Grüßen
ServiHaus München`

    return NextResponse.json({
      success: true,
      client: updatedClient,
      user: {
        id: user.id,
        email: user.email,
        mustChangePassword: user.mustChangePassword,
      },
      email: {
        to: normalizedEmail,
        subject,
        body,
        mailto: `mailto:${encodeURIComponent(normalizedEmail)}?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(body)}`,
      },
    })
  } catch (error) {
    console.error("CLIENT PORTAL ACCESS ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}