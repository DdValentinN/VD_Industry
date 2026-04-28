import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function main() {
  const backupPath = join(__dirname, 'backup.json')
  const backup = JSON.parse(readFileSync(backupPath, 'utf-8'))

  console.log('🔄 Import des données vers Supabase...')
  console.log(`   Export du : ${backup.exportedAt}`)

  // Order matters: respect foreign keys
  // 1. Tables sans dépendances
  if (backup.articles?.length) {
    await prisma.article.createMany({ data: backup.articles, skipDuplicates: true })
    console.log(`✅ Articles         : ${backup.articles.length}`)
  }

  if (backup.parametres?.length) {
    await prisma.parametre.createMany({ data: backup.parametres, skipDuplicates: true })
    console.log(`✅ Parametres       : ${backup.parametres.length}`)
  }

  if (backup.financesParams?.length) {
    await prisma.financesParams.createMany({ data: backup.financesParams, skipDuplicates: true })
    console.log(`✅ FinancesParams    : ${backup.financesParams.length}`)
  }

  if (backup.financesCharges?.length) {
    await prisma.financesCharge.createMany({ data: backup.financesCharges, skipDuplicates: true })
    console.log(`✅ FinancesCharges  : ${backup.financesCharges.length}`)
  }

  if (backup.financesMois?.length) {
    await prisma.financesMois.createMany({ data: backup.financesMois, skipDuplicates: true })
    console.log(`✅ FinancesMois     : ${backup.financesMois.length}`)
  }

  // 2. InvestETF avant InvestTransaction
  if (backup.investETFs?.length) {
    await prisma.investETF.createMany({ data: backup.investETFs, skipDuplicates: true })
    console.log(`✅ ETFs             : ${backup.investETFs.length}`)
  }

  if (backup.investTransactions?.length) {
    await prisma.investTransaction.createMany({ data: backup.investTransactions, skipDuplicates: true })
    console.log(`✅ Transactions     : ${backup.investTransactions.length}`)
  }

  if (backup.investPlans?.length) {
    await prisma.investPlan.createMany({ data: backup.investPlans, skipDuplicates: true })
    console.log(`✅ InvestPlans      : ${backup.investPlans.length}`)
  }

  // 3. Fitness — profile, séances, exercices, séries, jours, repas
  if (backup.fitnessProfile?.length) {
    await prisma.fitnessProfile.createMany({ data: backup.fitnessProfile, skipDuplicates: true })
    console.log(`✅ FitnessProfile   : ${backup.fitnessProfile.length}`)
  }

  if (backup.fitnessSeances?.length) {
    await prisma.fitnessSeance.createMany({ data: backup.fitnessSeances, skipDuplicates: true })
    console.log(`✅ Séances          : ${backup.fitnessSeances.length}`)
  }

  if (backup.fitnessExercices?.length) {
    await prisma.fitnessExercice.createMany({ data: backup.fitnessExercices, skipDuplicates: true })
    console.log(`✅ Exercices        : ${backup.fitnessExercices.length}`)
  }

  if (backup.fitnessSeries?.length) {
    await prisma.fitnessSerie.createMany({ data: backup.fitnessSeries, skipDuplicates: true })
    console.log(`✅ Séries           : ${backup.fitnessSeries.length}`)
  }

  if (backup.fitnessJours?.length) {
    await prisma.fitnessJour.createMany({ data: backup.fitnessJours, skipDuplicates: true })
    console.log(`✅ Jours fitness    : ${backup.fitnessJours.length}`)
  }

  if (backup.fitnessRepas?.length) {
    await prisma.fitnessRepas.createMany({ data: backup.fitnessRepas, skipDuplicates: true })
    console.log(`✅ Repas            : ${backup.fitnessRepas.length}`)
  }

  console.log('\n🎉 Import terminé — toutes les données sont sur Supabase !')
}

main()
  .catch((err) => { console.error('❌ Erreur import :', err); process.exit(1) })
  .finally(() => prisma.$disconnect())
