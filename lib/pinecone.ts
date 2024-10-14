import { PineconeClient } from '@pinecone-database/pinecone'

const pinecone = new PineconeClient()

export async function initPinecone() {
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT!,
    apiKey: process.env.PINECONE_API_KEY!,
  })
}

export default pinecone