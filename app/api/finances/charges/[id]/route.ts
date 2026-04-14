import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const body = await req.json()

    if (!body.nom?.trim()) return NextResponse.json({ error: 'Nom de la charge requis' }, { status: 400 })
    const montant = parseFloat(body.montant)
    if (isNaN(montant)) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })

    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })

    const charge = await prisma.financesCharge.update({
      where: { id },
      data: { nom: body.nom.trim(), montant, type: body.type },
    })
    return NextResponse.json({ data: charge })
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Charge introuvable' }, { status: 404 })
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    await prisma.financesCharge.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Charge introuvable' }, { status: 404 })
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
