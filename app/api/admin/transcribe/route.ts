import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import fs from 'fs/promises'
import path from 'path'
import prisma from '@/lib/prisma'
import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
})

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const uploadDir = path.join(process.cwd(), 'uploads')
  const files = await fs.readdir(uploadDir)

  for (const file of files) {
    if (path.extname(file) === '.mp3') {
      const filePath = path.join(uploadDir, file)
      
      try {
        // Upload the file to AssemblyAI
        const upload = await client.transcripts.audio.upload(filePath)

        // Start the transcription
        const transcript = await client.transcripts.create({
          audio_url: upload.upload_url,
          speaker_labels: true,
        })

        // Wait for the transcription to complete
        const result = await client.transcripts.wait(transcript.id)

        if (result.status === 'completed') {
          // Save the transcription to the database
          await prisma.transcription.create({
            data: {
              filename: file,
              content: result.text,
            },
          })

          // Move the processed file to a 'processed' folder
          const processedDir = path.join(process.cwd(), 'processed')
          await fs.mkdir(processedDir, { recursive: true })
          await fs.rename(filePath, path.join(processedDir, file))
        } else {
          console.error(`Transcription failed for file: ${file}`)
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error)
      }
    }
  }

  return NextResponse.json({ message: "Transcription process completed" })
}