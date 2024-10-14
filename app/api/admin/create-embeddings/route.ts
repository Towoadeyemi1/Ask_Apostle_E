import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import prisma from '@/lib/prisma'
import pinecone from '@/lib/pinecone'
import openai from '@/lib/openai'
import { encode } from 'gpt-3-encoder'

function chunkText(text: string, maxTokens: number = 500): string[] {
  const tokens = encode(text)
  const chunks: string[] = []
  let currentChunk: number[] = []

  for (const token of tokens) {
    if (currentChunk.length + 1 > maxTokens) {
      chunks.push(decode(currentChunk))
      currentChunk = []
    }
    currentChunk.push(token)
  }

  if (currentChunk.length > 0) {
    chunks.push(decode(currentChunk))
  }

  return chunks
}

function decode(tokens: number[]): string {
  return tokens.map(token => String.fromCharCode(token)).join('')
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const transcriptions = await prisma.transcription.findMany({
    where: { 
      embeddingCreated: false
    },
  })

  const index = pinecone.Index('your-index-name')

  for (const transcription of transcriptions) {
    const chunks = chunkText(transcription.content)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk,
      })

      const embedding = embeddingResponse.data[0].embedding

      await index.upsert({
        upsertRequest: {
          vectors: [
            {
              id: `${transcription.id}-${i}`,
              values: embedding,
              metadata: {
                text: chunk,
                transcriptionId: transcription.id,
              },
            },
          ],
        },
      })
    }

    await prisma.transcription.update({
      where: { id: transcription.id },
      data: { embeddingCreated: true },
    })
  }

  return NextResponse.json({ message: "Embeddings created successfully" })
}