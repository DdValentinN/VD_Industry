import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

export async function GET() {
  try {
    const seances = await prisma.fitnessSeance.findMany({
      include: {
        exercices: {
          include: { series: { orderBy: { numero: 'asc' } } },
          orderBy: { ordre: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
      take: 20,
    })
    return NextResponse.json({ data: seances })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const body = await req.json()

    if (!body.nom?.trim()) return NextResponse.json({ error: 'Nom de séance requis' }, { status: 400 })

    const duree = parseInt(body.duree)

    const seance = await prisma.fitnessSeance.create({
      data: {
        nom: body.nom.trim(),
        type: body.type ?? 'musculation',
        date: body.date ? new Date(body.date) : new Date(),
        duree: isNaN(duree) ? 60 : duree,
        notes: body.notes?.trim() || null,
      },
      include: { exercices: { include: { series: true } } },
    })
    return NextResponse.json({ data: seance }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
