import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import prisma from '@/lib/prisma'

export async function DELETE(req: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const { userId } = params

  await prisma.user.update({
    where: { id: userId },
    data: { isAdmin: false },
  })

  return NextResponse.json({ message: "Admin removed successfully" })
}