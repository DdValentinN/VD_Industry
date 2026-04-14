import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

async function getVintedCookie(): Promise<string> {
  // Fetch the catalog page to get a valid anonymous session cookie
  const res = await fetch('https://www.vinted.fr/catalog', {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
    },
    redirect: 'follow',
    cache: 'no-store',
  })

  // getSetCookie() returns a proper array (Node 18+), avoiding the comma-splitting bug
  const setCookies: string[] =
    typeof (res.headers as any).getSetCookie === 'function'
      ? (res.headers as any).getSetCookie()
      : (res.headers.get('set-cookie') ?? '').split(/(?<=;),\s*/)

  return setCookies
    .map((c: string) => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ')
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const params = new URLSearchParams()
  params.set('per_page', '30')
  params.set('order', 'newest_first')
  params.set('page', '1')

  const text = searchParams.get('search_text')
  if (text) params.set('search_text', text)

  const priceFrom = searchParams.get('price_from')
  if (priceFrom) params.set('price_from', priceFrom)

  const priceTo = searchParams.get('price_to')
  if (priceTo) params.set('price_to', priceTo)

  const catalogIds = searchParams.getAll('catalog_ids[]')
  catalogIds.forEach((id) => params.append('catalog_ids[]', id))

  const statusIds = searchParams.getAll('status_ids[]')
  statusIds.forEach((id) => params.append('status_ids[]', id))

  const apiUrl = `https://www.vinted.fr/api/v2/catalog/items?${params.toString()}`

  try {
    const cookie = await getVintedCookie()

    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Referer': 'https://www.vinted.fr/catalog',
        'Origin': 'https://www.vinted.fr',
        'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return NextResponse.json(
        { error: `Vinted API error: ${res.status}`, detail: body.slice(0, 200) },
        { status: res.status },
      )
    }

    const data = await res.json()

    const items = (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      currency: item.currency || 'EUR',
      brand: item.brand_title || '',
      size: item.size_title || '',
      condition: item.status || '',
      photo: item.photos?.[0]?.full_size_url || item.photos?.[0]?.url || null,
      seller: item.user?.login || '',
      url: `https://www.vinted.fr/items/${item.id}`,
      createdAt: item.created_at_ts || 0,
    }))

    return NextResponse.json({ items, total: data.pagination?.total_entries || 0 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
