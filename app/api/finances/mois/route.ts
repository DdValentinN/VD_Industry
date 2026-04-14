import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const annee = parseInt(req.nextUrl.searchParams.get('annee') ?? '2026')
    const mois = await prisma.financesMois.findMany({
      where: { annee },
      orderBy: { mois: 'asc' },
    })
    return NextResponse.json({ data: mois })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const body = await req.json()
    const entry = await prisma.financesMois.upsert({
      where: { annee_mois: { annee: body.annee, mois: body.mois } },
      update: {
        revenu1: parseFloat(body.revenu1) || 0,
        revenu2: parseFloat(body.revenu2) || 0,
      },
      create: {
        annee: body.annee,
        mois: body.mois,
        revenu1: parseFloat(body.revenu1) || 0,
        revenu2: parseFloat(body.revenu2) || 0,
      },
    })
    return NextResponse.json({ data: entry })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
