import { NextRequest, NextResponse } from 'next/server'
import { createToken, findUserByCredentials, SESSION_COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Identifiants requis' }, { status: 400 })
    }

    const user = findUserByCredentials(username, password)
    if (!user) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const token = createToken(user.userId)
    const response = NextResponse.json({ success: true, role: user.role, userId: user.userId })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
