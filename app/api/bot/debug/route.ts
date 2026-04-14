import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

export async function GET() {
  try {
    // Step 1: fetch homepage to get cookies
    const homeRes = await fetch('https://www.vinted.fr/', {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      redirect: 'follow',
      cache: 'no-store',
    })

    const setCookies: string[] =
      typeof (homeRes.headers as any).getSetCookie === 'function'
        ? (homeRes.headers as any).getSetCookie()
        : []

    const cookie = setCookies.map((c: string) => c.split(';')[0].trim()).join('; ')

    // Step 2: call Vinted API
    const apiRes = await fetch('https://www.vinted.fr/api/v2/catalog/items?per_page=5&order=newest_first&page=1&search_text=nike', {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Referer': 'https://www.vinted.fr/',
        'Origin': 'https://www.vinted.fr',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      cache: 'no-store',
    })

    const body = await apiRes.text()

    return NextResponse.json({
      homeStatus: homeRes.status,
      cookieCount: setCookies.length,
      cookiePreview: cookie.slice(0, 200),
      apiStatus: apiRes.status,
      apiBody: body.slice(0, 500),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
