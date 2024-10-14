import { encode } from 'gpt-3-encoder'

interface Embedding {
  id: string
  vector: number[]
  text: string
}

class InMemoryVectorStore {
  private embeddings: Embedding[] = []

  async addEmbedding(id: string, vector: number[], text: string) {
    this.embeddings.push({ id, vector, text })
  }

  async search(queryVector: number[], topK: number = 5): Promise<Embedding[]> {
    const results = this.embeddings
      .map(embedding => ({
        ...embedding,
        similarity: this.cosineSimilarity(queryVector, embedding.vector)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)

    return results
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0)
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    return dotProduct / (magnitudeA * magnitudeB)
  }
}

export const vectorStore = new InMemoryVectorStore()

export function chunkText(text: string, maxTokens: number = 500): string[] {
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