import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const adminAccounts = await prisma.user.findMany({
    where: { isAdmin: true },
    select: { id: true, email: true },
  })

  return NextResponse.json(adminAccounts)
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const { email } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isAdmin: true },
  })

  return NextResponse.json({ message: "Admin added successfully" })
}