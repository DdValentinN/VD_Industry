import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Export de toutes les données depuis Neon...')

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

  const outPath = join(__dirname, 'backup.json')
  writeFileSync(outPath, JSON.stringify(backup, null, 2))

  console.log('✅ Export terminé !')
  console.log(`   Articles         : ${articles.length}`)
  console.log(`   Finances charges : ${financesCharges.length}`)
  console.log(`   Finances mois    : ${financesMois.length}`)
  console.log(`   ETFs             : ${investETFs.length}`)
  console.log(`   Transactions     : ${investTransactions.length}`)
  console.log(`   Séances fitness  : ${fitnessSeances.length}`)
  console.log(`   Jours fitness    : ${fitnessJours.length}`)
  console.log(`\n📁 Fichier : prisma/backup.json`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
