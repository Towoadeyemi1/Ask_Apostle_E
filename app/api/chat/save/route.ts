import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { messages } = await req.json()

  const chatSession = await prisma.chatSession.create({
    data: {
      userId: session.user.id,
      messages: {
        create: messages.map(message => ({
          content: message.content,
          isUser: message.isUser,
        }))
      }
    }
  })

  return NextResponse.json({ message: "Chat saved successfully" })
}