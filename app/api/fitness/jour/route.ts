import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

export async function GET(req: NextRequest) {
  const dateStr = req.nextUrl.searchParams.get('date')
  const days = req.nextUrl.searchParams.get('days')

  // Return last N days for progression charts
  if (days) {
    const n = parseInt(days) || 30
    const jours = await prisma.fitnessJour.findMany({
      include: { repas: true },
      orderBy: { date: 'desc' },
      take: n,
    })
    return NextResponse.json({ data: jours.reverse() })
  }

  const date = dateStr ? new Date(dateStr) : new Date()
  const dayStart = startOfDay(date)

  try {
    const jour = await prisma.fitnessJour.upsert({
      where: { date: dayStart },
      update: {},
      create: { date: dayStart },
      include: { repas: true },
    })
    return NextResponse.json({ data: jour })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const body = await req.json()
    const date = body.date ? new Date(body.date) : new Date()
    const dayStart = startOfDay(date)

    const pas = body.pas !== undefined ? parseInt(body.pas) : undefined
    const poids =
      body.poids !== undefined
        ? body.poids === '' || body.poids === null
          ? null
          : parseFloat(body.poids)
        : undefined

    const jour = await prisma.fitnessJour.upsert({
      where: { date: dayStart },
      update: {
        ...(pas !== undefined && { pas: isNaN(pas) ? 0 : pas }),
        ...(poids !== undefined && { poids: poids !== null && isNaN(poids) ? null : poids }),
      },
      create: {
        date: dayStart,
        pas: pas !== undefined && !isNaN(pas) ? pas : 0,
        poids: poids !== undefined && poids !== null && !isNaN(poids) ? poids : null,
      },
      include: { repas: true },
    })
    return NextResponse.json({ data: jour })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
