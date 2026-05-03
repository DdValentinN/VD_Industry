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
