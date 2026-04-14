'use client'

import { useEffect, useState } from 'react'
import { Euro, TrendingUp, Package, ShoppingCart, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KPICard } from '@/components/app/KPICard'
import { MonthlyBarChart, CategoryPieChart } from '@/components/app/Charts'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { Stats, Article } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStats(d.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Vue d&apos;ensemble de ton activité Vinted</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Chiffre d'affaires"
          value={formatCurrency(stats.chiffreAffaires)}
          icon={Euro}
          className="lg:col-span-1"
        />
        <KPICard
          title="Bénéfice net"
          value={formatCurrency(stats.beneficeNet)}
          icon={TrendingUp}
          valueClassName={stats.beneficeNet >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
        <KPICard
          title="Marge moyenne"
          value={formatPercent(stats.margeMoyenne)}
          icon={BarChart3}
          valueClassName={stats.margeMoyenne >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
        <KPICard
          title="Articles vendus"
          value={String(stats.nbVendus)}
          icon={ShoppingCart}
        />
        <KPICard
          title="En stock"
          value={String(stats.nbEnStock)}
          icon={Package}
          valueClassName="text-amber-400"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bénéfice par mois</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.beneficeParMois.length > 0 ? (
              <MonthlyBarChart data={stats.beneficeParMois} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                Pas encore de données
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.repartitionCategorie.length > 0 ? (
              <CategoryPieChart data={stats.repartitionCategorie} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                Pas encore de données
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent sales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dernières ventes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stats.dernieresVentes.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">Aucune vente pour l&apos;instant</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="px-6 py-3 text-left text-gray-500 font-medium">Article</th>
                    <th className="px-6 py-3 text-left text-gray-500 font-medium hidden sm:table-cell">Date</th>
                    <th className="px-6 py-3 text-right text-gray-500 font-medium">Pr. vente</th>
                    <th className="px-6 py-3 text-right text-gray-500 font-medium">Bénéfice</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.dernieresVentes.map((a: Article) => {
                    const benefice = a.prixVente != null
                      ? a.prixVente - a.prixAchat - a.fraisDivers
                      : null
                    return (
                      <tr key={a.id} className="border-b border-white/5 last:border-0">
                        <td className="px-6 py-4 text-white font-medium">{a.nom}</td>
                        <td className="px-6 py-4 text-gray-400 hidden sm:table-cell">
                          {format(new Date(a.dateAchat), 'dd/MM/yyyy', { locale: fr })}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-300">
                          {a.prixVente != null ? formatCurrency(a.prixVente) : '—'}
                        </td>
                        <td className={`px-6 py-4 text-right font-semibold ${
                          benefice !== null
                            ? benefice >= 0 ? 'text-emerald-400' : 'text-red-400'
                            : 'text-gray-500'
                        }`}>
                          {benefice !== null ? formatCurrency(benefice) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
