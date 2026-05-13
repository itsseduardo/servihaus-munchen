import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"

import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const newPassword = String(body.newPassword || "")
    const confirmPassword = String(body.confirmPassword || "")

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Das Passwort muss mindestens 8 Zeichen haben." },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Die Passwörter stimmen nicht überein." },
        { status: 400 }
      )
    }

    if (newPassword === "Kundenshm2026*") {
      return NextResponse.json(
        { error: "Bitte wählen Sie ein neues Passwort." },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}