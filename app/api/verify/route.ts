import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const { token } = await req.json()

  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  })

  if (!user) {
    return NextResponse.json({ error: "Invalid verification token" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { verified: true, verificationToken: null },
  })

  return NextResponse.json({ message: "Email verified successfully" })
}