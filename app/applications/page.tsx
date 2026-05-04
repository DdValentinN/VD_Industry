import { prisma } from '@/lib/prisma'
import { calculateBenefit } from '@/lib/utils'
import { AppsGrid } from '@/components/apps/AppsGrid'
import { Footer } from '@/components/portfolio/Footer'

export const dynamic = 'force-dynamic'

async function getVintedStats() {
  try {
    const [total, vendus] = await Promise.all([
      prisma.article.count({ where: { userId: 'valentin' } }),
      prisma.article.findMany({
        where: { userId: 'valentin', statut: 'Vendu', prixVente: { not: null } },
      }),
    ])
    const beneficeTotal = vendus.reduce(
      (sum, a) => sum + calculateBenefit(a.prixVente!, a.prixAchat, a.fraisDivers),
      0,
    )
    const marges = vendus
      .filter((a) => a.prixVente! > 0)
      .map((a) => calculateBenefit(a.prixVente!, a.prixAchat, a.fraisDivers) / a.prixVente!)
    const margeMoyenne = marges.length > 0 ? marges.reduce((s, m) => s + m, 0) / marges.length : 0
    return { total, nbVendus: vendus.length, beneficeTotal, margeMoyenne }
  } catch {
    return { total: 0, nbVendus: 0, beneficeTotal: 0, margeMoyenne: 0 }
  }
}

async function getFitnessStats() {
  try {
    const [nbSeances, nbJours] = await Promise.all([
      prisma.fitnessSeance.count(),
      prisma.fitnessJour.count({ where: { pas: { gt: 0 } } }),
    ])
    return { nbSeances, nbJoursActifs: nbJours }
  } catch {
    return { nbSeances: 0, nbJoursActifs: 0 }
  }
}

async function getInvestStats() {
  try {
    const etfs = await prisma.investETF.findMany({ where: { userId: 'valentin' }, include: { transactions: true } })
    const nbETFs = etfs.length
    let coutTotal = 0
    for (const etf of etfs) {
      for (const t of etf.transactions) {
        if (t.type === 'achat') coutTotal += t.quantite * t.prix
        else coutTotal -= t.quantite * t.prix
      }
    }
    return { nbETFs, coutTotal: Math.max(0, coutTotal) }
  } catch {
    return { nbETFs: 0, coutTotal: 0 }
  }
}

async function getFinancesStats() {
  try {
    const [fParams, charges, moisData] = await Promise.all([
      prisma.financesParams.findFirst(),
      prisma.financesCharge.findMany(),
      prisma.financesMois.findMany({ where: { annee: new Date().getFullYear() } }),
    ])
    if (!fParams) return { revenuAnnuel: 0, epargnAnnuelle: 0, tauxEpargne: 0, soldeFin: 0 }

    const chargesTotales = charges.reduce((s, c) => s + c.montant, 0)
    const moisAvecData = moisData.filter(m => m.revenu1 > 0 || m.revenu2 > 0)
    const revenuAnnuel = moisAvecData.reduce((s, m) => s + m.revenu1 + m.revenu2, 0)
    const chargesAnnuelles = chargesTotales * moisAvecData.length
    const epargnAnnuelle = revenuAnnuel - chargesAnnuelles
    const tauxEpargne = revenuAnnuel > 0 ? epargnAnnuelle / revenuAnnuel : 0

    let solde = fParams.soldeDepart
    let prevSolde = fParams.soldeDepart
    for (const m of moisData.sort((a, b) => a.mois - b.mois)) {
      if (m.revenu1 > 0 || m.revenu2 > 0) {
        solde += (m.revenu1 + m.revenu2) - chargesTotales
      }
    }

    return { revenuAnnuel, epargnAnnuelle, tauxEpargne, soldeFin: solde }
  } catch {
    return { revenuAnnuel: 0, epargnAnnuelle: 0, tauxEpargne: 0, soldeFin: 0 }
  }
}

export default async function ApplicationsPage() {
  const [vintedStats, financesStats, investStats, fitnessStats] = await Promise.all([
    getVintedStats(), getFinancesStats(), getInvestStats(), getFitnessStats(),
  ])
  return (
    <>
      <AppsGrid vintedStats={vintedStats} financesStats={financesStats} investStats={investStats} fitnessStats={fitnessStats} />
      <Footer />
    </>
  )
}
