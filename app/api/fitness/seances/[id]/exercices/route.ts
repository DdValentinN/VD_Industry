import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const body = await req.json()

    if (!body.nom?.trim()) return NextResponse.json({ error: 'Nom de l\'exercice requis' }, { status: 400 })

    const seanceId = parseInt(params.id)
    if (isNaN(seanceId)) return NextResponse.json({ error: 'ID séance invalide' }, { status: 400 })

    const existing = await prisma.fitnessExercice.count({ where: { seanceId } })
    const exercice = await prisma.fitnessExercice.create({
      data: {
        seanceId,
        nom: body.nom.trim(),
        muscle: body.muscle ?? 'pectoraux',
        ordre: existing,
        series: {
          create: (body.series ?? []).map((s: { repetitions: number; poids: number }, i: number) => {
            const reps = parseInt(s.repetitions as unknown as string)
            const poids = parseFloat(s.poids as unknown as string)
            return {
              repetitions: isNaN(reps) ? 10 : reps,
              poids: isNaN(poids) ? 0 : poids,
              numero: i + 1,
            }
          }),
        },
      },
      include: { series: true },
    })
    return NextResponse.json({ data: exercice }, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
