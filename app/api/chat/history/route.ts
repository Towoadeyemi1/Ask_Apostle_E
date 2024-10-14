import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const chatSessions = await prisma.chatSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { messages: true },
  })

  const messages = chatSessions.flatMap(session => session.messages)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

  return NextResponse.json(messages)
}