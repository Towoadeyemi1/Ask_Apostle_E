import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const transcriptions = await prisma.transcription.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(transcriptions)
}