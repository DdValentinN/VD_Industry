import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const plan = await prisma.investPlan.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })
    return NextResponse.json({ data: plan })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()

    const montantS1     = parseFloat(body.montantS1)
    const montantS2     = parseFloat(body.montantS2)
    const montantS3     = parseFloat(body.montantS3)
    const montantS4     = parseFloat(body.montantS4)
    const partsEmergS4  = parseInt(body.partsEmergS4)
    const partsStorxxS4 = parseInt(body.partsStorxxS4)
    const cycleWeek     = parseInt(body.cycleWeek)

    const data = {
      montantS1:     isNaN(montantS1)     ? 100 : montantS1,
      montantS2:     isNaN(montantS2)     ? 100 : montantS2,
      montantS3:     isNaN(montantS3)     ? 100 : montantS3,
      montantS4:     isNaN(montantS4)     ? 150 : montantS4,
      partsEmergS4:  isNaN(partsEmergS4)  ? 2   : partsEmergS4,
      partsStorxxS4: isNaN(partsStorxxS4) ? 2   : partsStorxxS4,
      cycleWeek:     isNaN(cycleWeek)     ? 1   : cycleWeek,
    }

    const plan = await prisma.investPlan.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    })
    return NextResponse.json({ data: plan })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
