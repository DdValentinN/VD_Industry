import { NextRequest, NextResponse } from 'next/server'
import { getHistory } from '@/lib/yahoo'

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')
  const range = req.nextUrl.searchParams.get('range') ?? '1y'

  if (!ticker) return NextResponse.json({ error: 'ticker requis' }, { status: 400 })

  try {
    const data = await getHistory(ticker, range)
    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
