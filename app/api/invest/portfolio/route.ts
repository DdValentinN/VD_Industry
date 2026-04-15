import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'
import { searchTickerByISIN, getQuote } from '@/lib/yahoo'

export const dynamic = 'force-dynamic'

function computePosition(transactions: { type: string; quantite: number; prix: number }[]) {
  let quantite = 0
  let coutTotal = 0
  for (const t of transactions) {
    if (t.type === 'achat') {
      coutTotal += t.quantite * t.prix
      quantite += t.quantite
    } else if (quantite > 0) {
      const ratio = t.quantite / quantite
      coutTotal = coutTotal * (1 - ratio)
      quantite -= t.quantite
    }
  }
  const prixMoyen = quantite > 0 ? coutTotal / quantite : 0
  return { quantite, prixMoyen, coutTotal }
}

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req) ?? 'valentin'

  try {
    let etfs = await prisma.investETF.findMany({
      where: { userId },
      include: { transactions: { orderBy: { date: 'asc' } } },
    })

    // Auto-seed ETFs for known users with no data yet
    if (etfs.length === 0 && userId !== 'valentin') {
      // Per-user ETF definitions (each user has their own ISINs / positions)
      const USER_ETFS: Record<string, { isin: string; nom: string; nomCourt: string; couleur: string; quantite: number; prix: number }[]> = {
        loukasbrz: [
          { isin: 'FR001400U5Q4', nom: 'MSCI World PEA', nomCourt: 'MSCI World',    couleur: '#10b981', quantite: 5, prix: 45 },
          { isin: 'FR0006174348', nom: 'PEA Emergents Monde', nomCourt: 'PEA Emergents', couleur: '#a78bfa', quantite: 1, prix: 30 },
        ],
      }

      const seeds = USER_ETFS[userId] ?? []
      for (const s of seeds) {
        try {
          const existing = await prisma.investETF.findFirst({ where: { isin: s.isin, userId } })
          if (!existing) {
            const etf = await prisma.investETF.create({
              data: { isin: s.isin, nom: s.nom, nomCourt: s.nomCourt, ticker: '', couleur: s.couleur, userId },
            })
            await prisma.investTransaction.create({
              data: { etfId: etf.id, type: 'achat', quantite: s.quantite, prix: s.prix, date: new Date('2026-01-01'), notes: 'Position initiale' },
            })
          }
        } catch (err) {
          console.error('[invest/portfolio] seed ETF failed', s.isin, userId, err)
        }
      }

      // Ensure InvestPlan exists for this user
      await prisma.investPlan.upsert({
        where: { userId },
        update: {},
        create: { userId, montantS1: 100, montantS2: 100, montantS3: 100, montantS4: 150, partsEmergS4: 2, partsStorxxS4: 2, cycleWeek: 1 },
      })

      etfs = await prisma.investETF.findMany({
        where: { userId },
        include: { transactions: { orderBy: { date: 'asc' } } },
      })
    }

    const results = await Promise.all(
      etfs.map(async (etf) => {
        const pos = computePosition(etf.transactions)

        let ticker = etf.ticker
        if (!ticker) {
          const found = await searchTickerByISIN(etf.isin)
          if (found) {
            ticker = found
            await prisma.investETF.update({ where: { id: etf.id }, data: { ticker: found } })
          }
        }

        const quote = ticker ? await getQuote(ticker) : null
        const currentPrice = quote?.currentPrice ?? pos.prixMoyen
        const valeurActuelle = pos.quantite * currentPrice
        const valeurInvestie = pos.quantite * pos.prixMoyen
        const plusValue = valeurActuelle - valeurInvestie
        const performance = valeurInvestie > 0 ? plusValue / valeurInvestie : 0

        return {
          ...etf,
          ticker,
          quantite: pos.quantite,
          prixMoyen: pos.prixMoyen,
          valeurInvestie,
          valeurActuelle,
          plusValue,
          performance,
          quote,
        }
      })
    )

    return NextResponse.json({ data: results })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
