import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const body = await req.json()

    if (!body.nom?.trim()) return NextResponse.json({ error: 'Nom du repas requis' }, { status: 400 })

    const date = body.date ? new Date(body.date) : new Date()
    const dayStart = startOfDay(date)

    const calories = parseInt(body.calories)
    const proteines = parseFloat(body.proteines)
    const glucides = parseFloat(body.glucides)
    const lipides = parseFloat(body.lipides)

    // Upsert the jour first
    const jour = await prisma.fitnessJour.upsert({
      where: { date: dayStart },
      update: {},
      create: { date: dayStart },
    })

    const repas = await prisma.fitnessRepas.create({
      data: {
        jourId: jour.id,
        nom: body.nom.trim(),
        calories: isNaN(calories) ? 0 : calories,
        proteines: isNaN(proteines) ? 0 : proteines,
        glucides: isNaN(glucides) ? 0 : glucides,
        lipides: isNaN(lipides) ? 0 : lipides,
        moment: body.moment ?? 'dejeuner',
      },
    })
    return NextResponse.json({ data: repas }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
