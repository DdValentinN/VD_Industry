import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

export async function GET() {
  try {
    const profile = await prisma.fitnessProfile.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    })
    return NextResponse.json({ data: profile })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const body = await req.json()

    const objectifPas = parseInt(body.objectifPas)
    const objectifCal = parseInt(body.objectifCal)
    const objectifProteines = parseInt(body.objectifProteines)
    const objectifGlucides = parseInt(body.objectifGlucides)
    const objectifLipides = parseInt(body.objectifLipides)
    const poids = parseFloat(body.poids)
    const taille = parseInt(body.taille)
    const age = parseInt(body.age)

    const data = {
      objectifPas: isNaN(objectifPas) ? 10000 : objectifPas,
      objectifCal: isNaN(objectifCal) ? 2500 : objectifCal,
      objectifProteines: isNaN(objectifProteines) ? 150 : objectifProteines,
      objectifGlucides: isNaN(objectifGlucides) ? 250 : objectifGlucides,
      objectifLipides: isNaN(objectifLipides) ? 80 : objectifLipides,
      poids: isNaN(poids) ? 75 : poids,
      taille: isNaN(taille) ? 178 : taille,
      age: isNaN(age) ? 22 : age,
    }

    const profile = await prisma.fitnessProfile.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    })
    return NextResponse.json({ data: profile })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
