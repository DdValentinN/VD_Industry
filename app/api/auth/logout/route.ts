import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { SESSION_COOKIE } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
