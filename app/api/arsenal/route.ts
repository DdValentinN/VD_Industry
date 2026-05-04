import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.FOOTBALL_API_KEY ?? ''
const BASE    = 'https://api.football-data.org/v4'
const ARSENAL = 57
const HEADERS = { 'X-Auth-Token': API_KEY }

const cache = new Map<string, { data: unknown; ts: number }>()
const TTL   = 60_000 // 1 min

function fromCache(key: string) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.ts < TTL) return hit.data
  return null
}

async function apiFetch(path: string) {
  const hit = fromCache(path)
  if (hit) return hit
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  cache.set(path, { data, ts: Date.now() })
  return data
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? 'matches'

  try {
    if (type === 'matches') {
      // Prochains matchs + derniers résultats Arsenal
      const data = await apiFetch(`/teams/${ARSENAL}/matches?limit=10&status=SCHEDULED,LIVE,FINISHED`)
      return NextResponse.json({ data })
    }

    if (type === 'live') {
      const data = await apiFetch(`/teams/${ARSENAL}/matches?status=LIVE`)
      return NextResponse.json({ data })
    }

    if (type === 'standings') {
      const data = await apiFetch(`/competitions/PL/standings`)
      return NextResponse.json({ data })
    }

    if (type === 'upcoming') {
      const data = await apiFetch(`/teams/${ARSENAL}/matches?status=SCHEDULED&limit=5`)
      return NextResponse.json({ data })
    }

    if (type === 'results') {
      const data = await apiFetch(`/teams/${ARSENAL}/matches?status=FINISHED&limit=5`)
      return NextResponse.json({ data })
    }

    return NextResponse.json({ error: 'type invalide' }, { status: 400 })
  } catch (err) {
    console.error('[arsenal api]', err)
    return NextResponse.json({ error: 'API indisponible', detail: String(err) }, { status: 503 })
  }
}
