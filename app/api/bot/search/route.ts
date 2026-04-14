import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

  const brandIds = searchParams.getAll('brand_ids[]')
  brandIds.forEach((id) => params.append('brand_ids[]', id))

  const sizeIds = searchParams.getAll('size_ids[]')
  sizeIds.forEach((id) => params.append('size_ids[]', id))

  const url = `https://www.vinted.fr/api/v2/catalog/items?${params.toString()}`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Referer': 'https://www.vinted.fr/',
        'Origin': 'https://www.vinted.fr',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Vinted API error: ${res.status}` }, { status: res.status })
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
