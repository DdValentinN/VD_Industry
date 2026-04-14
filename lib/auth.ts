import crypto from 'crypto'
import { NextRequest } from 'next/server'

export const SESSION_COOKIE = 'vd-session'

const SECRET = process.env.SESSION_SECRET ?? 'vd-fallback-secret'
const PAYLOAD = 'vd-admin'

/** Creates a deterministic HMAC token from the secret */
export function createToken(): string {
  return crypto.createHmac('sha256', SECRET).update(PAYLOAD).digest('hex')
}

/** Validates a token using constant-time comparison */
export function validateToken(token: string): boolean {
  if (!token || token.length !== 64) return false
  try {
    const expected = createToken()
    return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

/** Returns true if the incoming request has a valid admin session cookie */
export function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  return token ? validateToken(token) : false
}
