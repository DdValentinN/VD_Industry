import type { ETFQuote, HistoryPoint } from '@/types'

// ─── Cache ────────────────────────────────────────────────────────────────────

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

const QUOTE_TTL  = 10 * 60 * 1000      // 10 min
const HIST_TTL   = 60 * 60 * 1000      // 1 h
const SEARCH_TTL = 24 * 60 * 60 * 1000 // 24 h

// ─── Yahoo Finance headers (mimics a real browser) ────────────────────────────

const YF_HEADERS: HeadersInit = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  'Referer': 'https://finance.yahoo.com/',
  'Origin': 'https://finance.yahoo.com',
}

// Use query2 — less rate-limited than query1 from server environments
const BASE = 'https://query2.finance.yahoo.com'

// ─── Direct HTTP helpers ──────────────────────────────────────────────────────

async function yf8Chart(ticker: string, interval: string, range: string) {
  const url = `${BASE}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}&includePrePost=false`
  const res = await fetch(url, { headers: YF_HEADERS, signal: AbortSignal.timeout(10_000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<any>
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function searchTickerByISIN(isin: string): Promise<string | null> {
  const ckey = `search:${isin}`
  const hit = fromCache<string>(ckey)
  if (hit) return hit

  // Try Yahoo search v1
  try {
    const url = `${BASE}/v1/finance/search?q=${encodeURIComponent(isin)}&quotesCount=5&newsCount=0&enableFuzzyQuery=false&enableNavLinks=false`
    const res = await fetch(url, { headers: YF_HEADERS, signal: AbortSignal.timeout(8_000) })
    if (res.ok) {
      const data = await res.json() as any
      const quotes: any[] = data?.quotes ?? []
      const etf = quotes.find(q => q.typeDisp === 'ETF' || q.typeDisp === 'Fund' || q.quoteType === 'ETF')
      const ticker = etf?.symbol ?? quotes[0]?.symbol ?? null
      if (ticker) { toCache(ckey, ticker, SEARCH_TTL); return ticker }
    }
  } catch {}

  // Fallback: yahoo-finance2 npm (may work locally / on some servers)
  try {
    const yf = (await import('yahoo-finance2')).default as any
    const results = await yf.search(isin, { quotesCount: 5, newsCount: 0 })
    const quotes: any[] = results?.quotes ?? []
    const etf = quotes.find((q: any) => q.typeDisp === 'ETF' || q.quoteType === 'ETF')
    const ticker = etf?.symbol ?? quotes[0]?.symbol ?? null
    if (ticker) { toCache(ckey, ticker, SEARCH_TTL); return ticker }
  } catch {}

  return null
}

// XTB/Degiro use .FR suffix; Yahoo Finance uses .PA for Euronext Paris
function normalizeTickerForYahoo(ticker: string): string {
  return ticker.endsWith('.FR') ? ticker.slice(0, -3) + '.PA' : ticker
}

export async function getQuote(ticker: string): Promise<ETFQuote | null> {
  ticker = normalizeTickerForYahoo(ticker)
  const ckey = `quote:${ticker}`
  const hit = fromCache<ETFQuote>(ckey)
  if (hit) return hit

  // Primary: direct v8 chart API (5d range, 1d interval)
  try {
    const data = await yf8Chart(ticker, '1d', '5d')
    const meta: any = data?.chart?.result?.[0]?.meta
    if (meta?.regularMarketPrice) {
      const current = meta.regularMarketPrice as number
      const prev    = (meta.previousClose ?? meta.chartPreviousClose ?? current) as number
      const quote: ETFQuote = {
        currentPrice:  current,
        previousClose: prev,
        change:        current - prev,
        changePercent: prev > 0 ? (current - prev) / prev : 0,
        currency:      meta.currency      ?? 'EUR',
        dayHigh:       meta.regularMarketDayHigh ?? current,
        dayLow:        meta.regularMarketDayLow  ?? current,
        marketState:   meta.marketState          ?? 'CLOSED',
      }
      toCache(ckey, quote, QUOTE_TTL)
      return quote
    }
  } catch {}

  // Fallback: yahoo-finance2 npm
  try {
    const yf  = (await import('yahoo-finance2')).default as any
    const q   = await yf.quote(ticker) as any
    if (q?.regularMarketPrice) {
      const current = q.regularMarketPrice as number
      const prev    = q.regularMarketPreviousClose ?? current
      const quote: ETFQuote = {
        currentPrice:  current,
        previousClose: prev,
        change:        q.regularMarketChange        ?? (current - prev),
        changePercent: (q.regularMarketChangePercent ?? 0) / 100,
        currency:      q.currency          ?? 'EUR',
        dayHigh:       q.regularMarketDayHigh ?? current,
        dayLow:        q.regularMarketDayLow  ?? current,
        marketState:   q.marketState          ?? 'CLOSED',
      }
      toCache(ckey, quote, QUOTE_TTL)
      return quote
    }
  } catch {}

  return null
}

export async function getHistory(ticker: string, range = '1y'): Promise<HistoryPoint[]> {
  ticker = normalizeTickerForYahoo(ticker)
  const ckey = `hist:${ticker}:${range}`
  const hit  = fromCache<HistoryPoint[]>(ckey)
  if (hit) return hit

  const interval = ['1m', '3m'].includes(range) ? '1d' : '1wk'

  // Primary: direct v8 chart API
  try {
    const data = await yf8Chart(ticker, interval, range)
    const result: any = data?.chart?.result?.[0]
    if (result) {
      const timestamps: number[] = result.timestamp ?? []
      const closes: number[]     = result.indicators?.quote?.[0]?.close ?? []
      const points: HistoryPoint[] = timestamps
        .map((ts, i) => ({ date: new Date(ts * 1000).toISOString().split('T')[0], prix: closes[i] }))
        .filter(p => p.prix != null && p.prix > 0) as HistoryPoint[]
      if (points.length > 0) { toCache(ckey, points, HIST_TTL); return points }
    }
  } catch {}

  // Fallback: yahoo-finance2 npm
  try {
    const yf     = (await import('yahoo-finance2')).default as any
    const now    = Date.now()
    const ms     = (d: number) => new Date(now - d * 86_400_000)
    const p1Map: Record<string, Date> = {
      '1m': ms(30), '3m': ms(90), '6m': ms(180),
      '1y': ms(365), '3y': ms(365 * 3), 'max': new Date('2015-01-01'),
    }
    const rows = await yf.historical(ticker, { period1: p1Map[range] ?? p1Map['1y'], interval })
    const data: HistoryPoint[] = (rows as any[])
      .filter((r: any) => r.close != null && r.close > 0)
      .map((r: any) => ({ date: (r.date as Date).toISOString().split('T')[0], prix: r.close as number }))
    toCache(ckey, data, HIST_TTL)
    return data
  } catch {}

  return []
}
