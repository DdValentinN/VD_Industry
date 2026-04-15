import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest, isLoggedIn } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const articles = await prisma.article.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: articles })
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

    if (!body.nom?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    if (!body.categorie?.trim()) return NextResponse.json({ error: 'Catégorie requise' }, { status: 400 })
    if (!body.dateAchat) return NextResponse.json({ error: 'Date d\'achat requise' }, { status: 400 })
    const prixAchat = parseFloat(body.prixAchat)
    if (isNaN(prixAchat)) return NextResponse.json({ error: 'Prix d\'achat invalide' }, { status: 400 })

    // Generate next articleId per user (prefix with user initials for clarity)
    const last = await prisma.article.findFirst({
      where: { userId },
      orderBy: { articleId: 'desc' },
      select: { articleId: true },
    })
    const lastNum = last ? parseInt(last.articleId.replace(/\D/g, ''), 10) : 0
    const articleId = `A-${String(lastNum + 1).padStart(3, '0')}`

    const fraisDivers = parseFloat(body.fraisDivers)
    const prixVente = body.prixVente !== undefined && body.prixVente !== '' ? parseFloat(body.prixVente) : null

    const article = await prisma.article.create({
      data: {
        articleId,
        nom: body.nom.trim(),
        categorie: body.categorie.trim(),
        dateAchat: new Date(body.dateAchat),
        prixAchat,
        fraisDivers: isNaN(fraisDivers) ? 0 : fraisDivers,
        prixVente: prixVente !== null && isNaN(prixVente) ? null : prixVente,
        statut: body.statut ?? 'En stock',
        notes: body.notes?.trim() || null,
        imageUrl: body.imageUrl?.trim() || null,
        userId,
      },
    })

    return NextResponse.json({ data: article }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}
