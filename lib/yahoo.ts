import yahooFinance from 'yahoo-finance2'
import type { ETFQuote, HistoryPoint } from '@/types'

// Simple in-memory cache to avoid hammering Yahoo on every request
interface CacheEntry { data: unknown; ts: number; ttl: number }
const _cache = new Map<string, CacheEntry>()

function fromCache<T>(key: string): T | null {
  const hit = _cache.get(key)
  if (hit && Date.now() - hit.ts < hit.ttl) return hit.data as T
  return null
}

function toCache(key: string, data: unknown, ttlMs: number) {
  _cache.set(key, { data, ts: Date.now(), ttl: ttlMs })
}

const QUOTE_TTL  = 5  * 60 * 1000       // 5 min
const HIST_TTL   = 60 * 60 * 1000       // 1 h
const SEARCH_TTL = 24 * 60 * 60 * 1000  // 24 h

export async function searchTickerByISIN(isin: string): Promise<string | null> {
  const ckey = `search:${isin}`
  const hit = fromCache<string | null>(ckey)
  if (hit !== null) return hit

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (yahooFinance as any).search(isin, { quotesCount: 5, newsCount: 0 })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const etf = (results?.quotes ?? []).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (q: any) => q.typeDisp === 'ETF' || q.typeDisp === 'Fund' || q.quoteType === 'ETF',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ticker = etf?.symbol ?? (results?.quotes?.[0] as any)?.symbol ?? null
    toCache(ckey, ticker, SEARCH_TTL)
    return ticker
  } catch {
    return null
  }
}

export async function getQuote(ticker: string): Promise<ETFQuote | null> {
  const ckey = `quote:${ticker}`
  const hit = fromCache<ETFQuote>(ckey)
  if (hit) return hit

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = await (yahooFinance as any).quote(ticker) as any
    if (!q) return null
    const current = q.regularMarketPrice ?? 0
    const prev    = q.regularMarketPreviousClose ?? current
    const quote: ETFQuote = {
      currentPrice:  current,
      previousClose: prev,
      change:        q.regularMarketChange          ?? (current - prev),
      changePercent: (q.regularMarketChangePercent  ?? 0) / 100,
      currency:      q.currency           ?? 'EUR',
      dayHigh:       q.regularMarketDayHigh ?? current,
      dayLow:        q.regularMarketDayLow  ?? current,
      marketState:   q.marketState          ?? 'CLOSED',
    }
    toCache(ckey, quote, QUOTE_TTL)
    return quote
  } catch {
    return null
  }
}

export async function getHistory(ticker: string, range = '1y'): Promise<HistoryPoint[]> {
  const ckey = `hist:${ticker}:${range}`
  const hit = fromCache<HistoryPoint[]>(ckey)
  if (hit) return hit

  try {
    const now = Date.now()
    const ms  = (d: number) => new Date(now - d * 86_400_000)
    const period1Map: Record<string, Date> = {
      '1m':  ms(30),
      '3m':  ms(90),
      '6m':  ms(180),
      '1y':  ms(365),
      '3y':  ms(365 * 3),
      'max': new Date('2015-01-01'),
    }
    const period1  = period1Map[range] ?? period1Map['1y']
    const interval: '1d' | '1wk' = ['1m', '3m'].includes(range) ? '1d' : '1wk'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (yahooFinance as any).historical(ticker, { period1, interval }) as any[]
    const data: HistoryPoint[] = rows
      .filter((r: any) => r.close != null && r.close > 0)
      .map((r: any) => ({
        date: (r.date as Date).toISOString().split('T')[0],
        prix: r.close as number,
      }))
    toCache(ckey, data, HIST_TTL)
    return data
  } catch {
    return []
  }
}
