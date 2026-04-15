import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

interface Params {
  params: { id: string }
}

export async function GET(req: NextRequest, { params }: Params) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const article = await prisma.article.findFirst({ where: { id: params.id, userId } })
    if (!article) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
    return NextResponse.json({ data: article })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const body = await req.json()

    if (!body.nom?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    if (!body.categorie?.trim()) return NextResponse.json({ error: 'Catégorie requise' }, { status: 400 })
    if (!body.dateAchat) return NextResponse.json({ error: 'Date d\'achat requise' }, { status: 400 })
    const prixAchat = parseFloat(body.prixAchat)
    if (isNaN(prixAchat)) return NextResponse.json({ error: 'Prix d\'achat invalide' }, { status: 400 })

    const fraisDivers = parseFloat(body.fraisDivers)
    const prixVente = body.prixVente !== undefined && body.prixVente !== '' ? parseFloat(body.prixVente) : null

    const article = await prisma.article.updateMany({
      where: { id: params.id, userId },
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

    if (article.count === 0) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
    const updated = await prisma.article.findFirst({ where: { id: params.id, userId } })
    return NextResponse.json({ data: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const result = await prisma.article.deleteMany({ where: { id: params.id, userId } })
    if (result.count === 0) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
