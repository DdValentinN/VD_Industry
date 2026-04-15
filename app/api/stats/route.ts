import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function calcBenefit(prixVente: number, prixAchat: number, fraisDivers: number) {
  return prixVente - prixAchat - fraisDivers
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req) ?? 'valentin'

  try {
    const [all, vendus] = await Promise.all([
      prisma.article.findMany({ where: { userId }, orderBy: { dateAchat: 'desc' } }),
      prisma.article.findMany({
        where: { userId, statut: 'Vendu', prixVente: { not: null } },
        orderBy: { dateAchat: 'desc' },
      }),
    ])

    const nbEnStock = all.filter((a) => a.statut === 'En stock').length

    const chiffreAffaires = vendus.reduce((s, a) => s + (a.prixVente ?? 0), 0)
    const beneficeNet = vendus.reduce(
      (s, a) => s + calcBenefit(a.prixVente!, a.prixAchat, a.fraisDivers),
      0,
    )

    const marges = vendus
      .filter((a) => a.prixVente! > 0)
      .map((a) => calcBenefit(a.prixVente!, a.prixAchat, a.fraisDivers) / a.prixVente!)
    const margeMoyenne =
      marges.length > 0 ? marges.reduce((s, m) => s + m, 0) / marges.length : 0

    const byMonth: Record<string, number> = {}
    for (const a of vendus) {
      const key = format(new Date(a.dateAchat), 'MMM yy', { locale: fr })
      byMonth[key] = (byMonth[key] ?? 0) + calcBenefit(a.prixVente!, a.prixAchat, a.fraisDivers)
    }
    const beneficeParMois = Object.entries(byMonth).map(([mois, benefice]) => ({
      mois,
      benefice: Math.round(benefice * 100) / 100,
      ca: 0,
    }))

    const byCat: Record<string, { count: number; benefice: number }> = {}
    for (const a of all) {
      if (!byCat[a.categorie]) byCat[a.categorie] = { count: 0, benefice: 0 }
      byCat[a.categorie].count++
      if (a.statut === 'Vendu' && a.prixVente != null) {
        byCat[a.categorie].benefice += calcBenefit(a.prixVente, a.prixAchat, a.fraisDivers)
      }
    }
    const repartitionCategorie = Object.entries(byCat).map(([categorie, data]) => ({
      categorie,
      count: data.count,
      benefice: Math.round(data.benefice * 100) / 100,
    }))

    const dernieresVentes = vendus.slice(0, 5)

    return NextResponse.json({
      data: {
        chiffreAffaires: Math.round(chiffreAffaires * 100) / 100,
        beneficeNet: Math.round(beneficeNet * 100) / 100,
        margeMoyenne: Math.round(margeMoyenne * 10000) / 10000,
        nbVendus: vendus.length,
        nbEnStock,
        beneficeParMois,
        repartitionCategorie,
        dernieresVentes,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
