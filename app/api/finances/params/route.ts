import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

export async function GET() {
  try {
    const params = await prisma.financesParams.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    })
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

    const soldeDepart = parseFloat(body.soldeDepart)
    const objectifEpargne = parseFloat(body.objectifEpargne)
    const nbMoisSecurite = parseInt(body.nbMoisSecurite)
    const anneeRef = parseInt(body.anneeRef)
    const revenu1Projection = parseFloat(body.revenu1Projection)
    const revenu2Projection = parseFloat(body.revenu2Projection)
    const salaire1 = parseFloat(body.salaire1)
    const apl1 = parseFloat(body.apl1)
    const aideMobili1 = parseFloat(body.aideMobili1)
    const primeActivite1 = parseFloat(body.primeActivite1)

    const data = {
      nom1: body.nom1 ?? 'Valentin',
      nom2: body.nom2 ?? 'Clara',
      soldeDepart: isNaN(soldeDepart) ? 0 : soldeDepart,
      objectifEpargne: isNaN(objectifEpargne) ? 500 : objectifEpargne,
      nbMoisSecurite: isNaN(nbMoisSecurite) ? 6 : nbMoisSecurite,
      anneeRef: isNaN(anneeRef) ? 2026 : anneeRef,
      revenu1Projection: isNaN(revenu1Projection) ? 0 : revenu1Projection,
      revenu2Projection: isNaN(revenu2Projection) ? 0 : revenu2Projection,
      salaire1: isNaN(salaire1) ? 1636 : salaire1,
      apl1: isNaN(apl1) ? 199 : apl1,
      aideMobili1: isNaN(aideMobili1) ? 100 : aideMobili1,
      primeActivite1: isNaN(primeActivite1) ? 150 : primeActivite1,
    }

    const params = await prisma.financesParams.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    })
    return NextResponse.json({ data: params })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
