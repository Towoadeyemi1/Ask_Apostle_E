import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const data = await req.formData()
  const files: File[] = data.getAll('files') as File[]

  const uploadDir = path.join(process.cwd(), 'uploads')

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadDir, file.name)
    await writeFile(filePath, buffer)
  }

  return NextResponse.json({ message: "Files uploaded successfully" })
}