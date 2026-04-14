import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const count = await prisma.article.count()
    const first = await prisma.article.findFirst()
    return NextResponse.json({
      count,
      first,
      db: process.env.DATABASE_URL?.slice(0, 40) + '...',
    })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message), stack: String(err?.stack) }, { status: 500 })
  }
}
