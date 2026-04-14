import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

export async function GET() {
  try {
    const charges = await prisma.financesCharge.findMany({
      orderBy: [{ type: 'asc' }, { nom: 'asc' }],
    })
    return NextResponse.json({ data: charges })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const body = await req.json()

    if (!body.nom?.trim()) return NextResponse.json({ error: 'Nom de la charge requis' }, { status: 400 })
    const montant = parseFloat(body.montant)
    if (isNaN(montant)) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })

    const charge = await prisma.financesCharge.create({
      data: {
        nom: body.nom.trim(),
        montant,
        type: body.type ?? 'fixe',
      },
    })
    return NextResponse.json({ data: charge }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
