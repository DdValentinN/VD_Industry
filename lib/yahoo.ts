import yahooFinance from 'yahoo-finance2'
import type { ETFQuote, HistoryPoint } from '@/types'

// Suppress noisy validation warnings
try { yahooFinance.setGlobalConfig({ validation: { logOptionsErrors: false } }) } catch {}

export async function searchTickerByISIN(isin: string): Promise<string | null> {
  try {
    const results = await yahooFinance.search(isin, { quotesCount: 5, newsCount: 0 })
    // Prefer ETF/Fund type
    const etf = (results.quotes ?? []).find(
      (q: any) => q.typeDisp === 'ETF' || q.typeDisp === 'Fund' || q.quoteType === 'ETF'
    ) as any
    return etf?.symbol ?? (results.quotes?.[0] as any)?.symbol ?? null
  } catch {
    return null
  }
}

export async function getQuote(ticker: string): Promise<ETFQuote | null> {
  try {
    const q = await yahooFinance.quote(ticker) as any
    const current = q.regularMarketPrice ?? 0
    const prev = q.regularMarketPreviousClose ?? current
    return {
      currentPrice: current,
      previousClose: prev,
      change: q.regularMarketChange ?? (current - prev),
      changePercent: (q.regularMarketChangePercent ?? 0) / 100,
      currency: q.currency ?? 'EUR',
      dayHigh: q.regularMarketDayHigh ?? current,
      dayLow: q.regularMarketDayLow ?? current,
      marketState: q.marketState ?? 'CLOSED',
    }
  } catch {
    return null
  }
}

export async function getHistory(ticker: string, range = '1y'): Promise<HistoryPoint[]> {
  try {
    const now = Date.now()
    const ms = (d: number) => new Date(now - d * 86_400_000)
    const period1Map: Record<string, Date> = {
      '1m':  ms(30),
      '3m':  ms(90),
      '6m':  ms(180),
      '1y':  ms(365),
      '3y':  ms(365 * 3),
      'max': new Date('2015-01-01'),
    }
    const period1 = period1Map[range] ?? period1Map['1y']
    const interval: '1d' | '1wk' = ['1m', '3m'].includes(range) ? '1d' : '1wk'

    const rows = await yahooFinance.historical(ticker, { period1, interval })
    return rows
      .filter((r: any) => r.close != null && r.close > 0)
      .map((r: any) => ({
        date: (r.date as Date).toISOString().split('T')[0],
        prix: r.close as number,
      }))
  } catch {
    return []
  }
}
