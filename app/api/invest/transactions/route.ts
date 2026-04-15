import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const transactions = await prisma.investTransaction.findMany({
      where: { etf: { userId } },
      include: { etf: true },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json({ data: transactions })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()

    const etfId = parseInt(body.etfId)
    if (isNaN(etfId)) return NextResponse.json({ error: 'ETF invalide' }, { status: 400 })

    // Verify the ETF belongs to this user
    const etf = await prisma.investETF.findFirst({ where: { id: etfId, userId } })
    if (!etf) return NextResponse.json({ error: 'ETF introuvable' }, { status: 404 })

    const quantite = parseFloat(body.quantite)
    if (isNaN(quantite) || quantite <= 0) return NextResponse.json({ error: 'Quantité invalide' }, { status: 400 })
    const prix = parseFloat(body.prix)
    if (isNaN(prix) || prix <= 0) return NextResponse.json({ error: 'Prix invalide' }, { status: 400 })
    if (!body.date) return NextResponse.json({ error: 'Date requise' }, { status: 400 })

    const tx = await prisma.investTransaction.create({
      data: {
        etfId,
        type: body.type ?? 'achat',
        quantite,
        prix,
        date: new Date(body.date),
        notes: body.notes?.trim() || null,
      },
      include: { etf: true },
    })
    return NextResponse.json({ data: tx }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
