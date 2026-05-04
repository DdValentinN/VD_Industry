import { prisma } from '@/lib/prisma'
import { calculateBenefit } from '@/lib/utils'
import { Hero } from '@/components/portfolio/Hero'

export const dynamic = 'force-dynamic'
import { About } from '@/components/portfolio/About'
import { Skills } from '@/components/portfolio/Skills'
import { Experience } from '@/components/portfolio/Experience'
import { Education } from '@/components/portfolio/Education'
import { Contact } from '@/components/portfolio/Contact'
import { Footer } from '@/components/portfolio/Footer'

async function getPortfolioStats() {
  try {
    const vendus = await prisma.article.findMany({
      where: { statut: 'Vendu', prixVente: { not: null } },
    })
    const beneficeTotal = vendus.reduce(
      (sum, a) => sum + calculateBenefit(a.prixVente!, a.prixAchat, a.fraisDivers),
      0,
    )
    const marges = vendus
      .filter((a) => a.prixVente! > 0)
      .map((a) => calculateBenefit(a.prixVente!, a.prixAchat, a.fraisDivers) / a.prixVente!)
    const margeMoyenne = marges.length > 0 ? marges.reduce((s, m) => s + m, 0) / marges.length : 0
    return { nbVendus: vendus.length, beneficeTotal, margeMoyenne }
  } catch {
    return { nbVendus: 0, beneficeTotal: 0, margeMoyenne: 0 }
  }
}

export default async function HomePage() {
  const stats = await getPortfolioStats()

  return (
    <main>
      <Hero />
      <About
        nbVendus={stats.nbVendus}
        beneficeTotal={stats.beneficeTotal}
        margeMoyenne={stats.margeMoyenne}
      />
      <Skills />
      <Experience />
      <Education />
      <Contact />
      <Footer />
    </main>
  )
}
