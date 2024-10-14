import { NextResponse } from 'next/server'
import { RateLimiter } from 'limiter'

const limiter = new RateLimiter({
  tokensPerInterval: 5,
  interval: 'minute',
  fireImmediately: true,
})

export async function rateLimit(req: Request) {
  const remaining = await limiter.removeTokens(1)
  
  if (remaining < 0) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
}