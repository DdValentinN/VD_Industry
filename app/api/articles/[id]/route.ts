import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

interface Params {
  params: { id: string }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const article = await prisma.article.findUnique({ where: { id: params.id } })
    if (!article) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
    return NextResponse.json({ data: article })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const body = await req.json()

    if (!body.nom?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    if (!body.categorie?.trim()) return NextResponse.json({ error: 'Catégorie requise' }, { status: 400 })
    if (!body.dateAchat) return NextResponse.json({ error: 'Date d\'achat requise' }, { status: 400 })
    const prixAchat = parseFloat(body.prixAchat)
    if (isNaN(prixAchat)) return NextResponse.json({ error: 'Prix d\'achat invalide' }, { status: 400 })

    const fraisDivers = parseFloat(body.fraisDivers)
    const prixVente = body.prixVente !== undefined && body.prixVente !== '' ? parseFloat(body.prixVente) : null

    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        nom: body.nom.trim(),
        categorie: body.categorie.trim(),
        dateAchat: new Date(body.dateAchat),
        prixAchat,
        fraisDivers: isNaN(fraisDivers) ? 0 : fraisDivers,
        prixVente: prixVente !== null && isNaN(prixVente) ? null : prixVente,
        statut: body.statut,
        notes: body.notes?.trim() || null,
        imageUrl: body.imageUrl?.trim() || null,
      },
    })

    return NextResponse.json({ data: article })
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
    console.error(err)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    await prisma.article.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
    console.error(err)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
