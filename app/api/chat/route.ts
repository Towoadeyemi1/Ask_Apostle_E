import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import prisma from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'
import pinecone from '@/lib/pinecone'
import openai from '@/lib/openai'

export async function POST(req: Request) {
  const rateLimitResult = await rateLimit(req)
  if (rateLimitResult) return rateLimitResult

  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { message } = await req.json()

  // Generate embedding for the user's message
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: message,
  })

  const queryEmbedding = embeddingResponse.data[0].embedding

  // Search for relevant chunks in Pinecone
  const index = pinecone.Index('your-index-name')
  const queryResponse = await index.query({
    queryRequest: {
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    },
  })

  // Prepare the context for the LLM
  const context = queryResponse.matches.map(match => match.metadata.text).join("\n\n")

  // Generate a response using the LLM
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a spiritual guide named Apostle E. Use the provided context to answer the user's question." },
      { role: "user", content: `Context: ${context}\n\nQuestion: ${message}` }
    ],
  })

  const botResponse = completion.choices[0].message.content

  // Save the chat session and messages
  const chatSession = await prisma.chatSession.create({
    data: {
      userId: session.user.id,
      messages: {
        create: [
          { content: message, isUser: true },
          { content: botResponse, isUser: false }
        ]
      }
    }
  })

  return NextResponse.json({ response: botResponse })
}