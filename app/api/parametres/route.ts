import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

export async function GET() {
  try {
    let params = await prisma.parametre.findUnique({ where: { id: 1 } })

    if (!params) {
      params = await prisma.parametre.create({
        data: { id: 1, seuilOrange: 2, margeCible: 0.3 },
      })
    }

    return NextResponse.json({ data: params })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const body = await req.json()

    const params = await prisma.parametre.upsert({
      where: { id: 1 },
      update: {
        seuilOrange: body.seuilOrange,
        margeCible: body.margeCible,
      },
      create: {
        id: 1,
        seuilOrange: body.seuilOrange,
        margeCible: body.margeCible,
      },
    })

    return NextResponse.json({ data: params })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }
}
