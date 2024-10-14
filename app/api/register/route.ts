import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  const { email, password, firstName, lastName } = await req.json()

  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    return NextResponse.json({ message: "You have a registered account, please login" }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const verificationToken = Math.random().toString(36).substring(2, 15)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      verificationToken,
    },
  })

  await sendVerificationEmail(email, verificationToken)

  return NextResponse.json({ message: "User registered successfully. Please check your email for verification." })
}