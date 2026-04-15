import { NextRequest, NextResponse } from 'next/server'
import { getUserDefFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getUserDefFromRequest(req)
  if (!user) return NextResponse.json({ isAdmin: false, isLoggedIn: false, userId: null, role: null })
  return NextResponse.json({
    isLoggedIn: true,
    isAdmin: user.role === 'admin',
    userId: user.userId,
    role: user.role,
  })
}
