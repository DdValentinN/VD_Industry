import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Admin uniquement' }, { status: 403 })
  }

  const [
    articles,
    parametres,
    financesParams,
    financesCharges,
    financesMois,
    investETFs,
    investTransactions,
    investPlans,
    fitnessProfile,
    fitnessSeances,
    fitnessExercices,
    fitnessSeries,
    fitnessJours,
    fitnessRepas,
  ] = await Promise.all([
    prisma.article.findMany(),
    prisma.parametre.findMany(),
    prisma.financesParams.findMany(),
    prisma.financesCharge.findMany(),
    prisma.financesMois.findMany(),
    prisma.investETF.findMany(),
    prisma.investTransaction.findMany(),
    prisma.investPlan.findMany(),
    prisma.fitnessProfile.findMany(),
    prisma.fitnessSeance.findMany(),
    prisma.fitnessExercice.findMany(),
    prisma.fitnessSerie.findMany(),
    prisma.fitnessJour.findMany(),
    prisma.fitnessRepas.findMany(),
  ])

  const backup = {
    exportedAt: new Date().toISOString(),
    articles,
    parametres,
    financesParams,
    financesCharges,
    financesMois,
    investETFs,
    investTransactions,
    investPlans,
    fitnessProfile,
    fitnessSeances,
    fitnessExercices,
    fitnessSeries,
    fitnessJours,
    fitnessRepas,
  }

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="vdindustry-backup.json"',
    },
  })
}
