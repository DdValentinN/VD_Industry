import crypto from 'crypto'
import { NextRequest } from 'next/server'

export const SESSION_COOKIE = 'vd-session'

const SECRET = process.env.SESSION_SECRET ?? 'vd-fallback-secret'

// ─── User definitions ─────────────────────────────────────────────────────────
// userId is the key used for DB scoping — keep it stable regardless of username

export type UserId = 'valentin' | 'loukasbrz'
export type UserRole = 'admin' | 'user'

interface UserDef {
  userId: UserId
  username: string   // login credential
  password: string
  role: UserRole
}

const USERS: UserDef[] = [
  {
    userId:   'valentin',
    username: process.env.ADMIN_USERNAME ?? 'valentin',
    password: process.env.ADMIN_PASSWORD ?? '',
    role:     'admin',
  },
  {
    userId:   'loukasbrz',
    username: 'loukasbrz',
    password: process.env.LOUKAS_PASSWORD ?? '1234',
    role:     'user',
  },
]

export function findUserByCredentials(username: string, password: string): UserDef | null {
  return USERS.find(u => u.username === username && u.password === password) ?? null
}

// ─── Token: "{userId}.{HMAC(SECRET, userId)}" ─────────────────────────────────

export function createToken(userId: UserId): string {
  const hmac = crypto.createHmac('sha256', SECRET).update(userId).digest('hex')
  return `${userId}.${hmac}`
}

export function parseToken(token: string): UserId | null {
  const dot = token.indexOf('.')
  if (dot === -1) return null
  const userId = token.slice(0, dot) as UserId
  const hmac   = token.slice(dot + 1)
  if (hmac.length !== 64) return null
  try {
    const expected = crypto.createHmac('sha256', SECRET).update(userId).digest('hex')
    if (crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'))) {
      // Verify userId is a known user
      if (USERS.some(u => u.userId === userId)) return userId
    }
  } catch {}
  return null
}

export function getUserIdFromRequest(req: NextRequest): UserId | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  return token ? parseToken(token) : null
}

export function getUserDefFromRequest(req: NextRequest): UserDef | null {
  const userId = getUserIdFromRequest(req)
  return userId ? (USERS.find(u => u.userId === userId) ?? null) : null
}

/** Returns true if the request has any valid session (any user) */
export function isLoggedIn(req: NextRequest): boolean {
  return getUserIdFromRequest(req) !== null
}

/** Returns true only for admin users */
export function isAdminRequest(req: NextRequest): boolean {
  const u = getUserDefFromRequest(req)
  return u?.role === 'admin'
}
