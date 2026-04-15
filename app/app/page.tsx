'use client'

import { useEffect, useState } from 'react'
import {
  Euro, TrendingUp, Package, ShoppingCart, BarChart3,
  ArrowUpRight, ArrowDownRight, Minus, Trophy, Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MonthlyBarChart, CategoryPieChart } from '@/components/app/Charts'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Stats, Article } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface KPICardProps {
  title: string
  value: string
  icon: React.ElementType
  valueClassName?: string
  trend?: number | null   // % change vs last period
  sub?: string
}

function KPICard({ title, value, icon: Icon, valueClassName, trend, sub }: KPICardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111] p-5 flex flex-col gap-3 hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate pr-2">{title}</p>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <p className={cn('text-2xl font-bold text-white', valueClassName)}>{value}</p>
      {(trend != null || sub) && (
        <div className="flex items-center gap-1.5">
          {trend != null && (
            <span className={cn(
              'flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
              trend > 0 ? 'text-emerald-400 bg-emerald-500/10' :
              trend < 0 ? 'text-red-400 bg-red-500/10' :
              'text-gray-500 bg-white/5',
            )}>
              {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> :
               trend < 0 ? <ArrowDownRight className="w-3 h-3" /> :
               <Minus className="w-3 h-3" />}
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          )}
          {sub && <span className="text-[11px] text-gray-600">{sub}</span>}
        </div>
      )}
    </div>
  )
}

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

  // Compute month-over-month trend from beneficeParMois
  const months = stats.beneficeParMois
  const lastBenef = months.length >= 1 ? months[months.length - 1]?.benefice ?? 0 : 0
  const prevBenef = months.length >= 2 ? months[months.length - 2]?.benefice ?? 0 : null
  const benefTrend = prevBenef != null && prevBenef !== 0
    ? ((lastBenef - prevBenef) / Math.abs(prevBenef)) * 100
    : null

  // Top 3 articles by margin
  const topArticles: Article[] = [...(stats.dernieresVentes ?? [])]
    .filter((a) => a.prixVente != null)
    .map((a) => ({
      ...a,
      _benefice: a.prixVente! - a.prixAchat - a.fraisDivers,
    } as any))
    .sort((a: any, b: any) => b._benefice - a._benefice)
    .slice(0, 3)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Vue d&apos;ensemble de ton activité Vinted</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Chiffre d'affaires"
          value={formatCurrency(stats.chiffreAffaires)}
          icon={Euro}
          sub="cumulé"
        />
        <KPICard
          title="Bénéfice net"
          value={formatCurrency(stats.beneficeNet)}
          icon={TrendingUp}
          valueClassName={stats.beneficeNet >= 0 ? 'text-emerald-400' : 'text-red-400'}
          trend={benefTrend}
          sub="vs mois préc."
        />
        <KPICard
          title="Marge moyenne"
          value={formatPercent(stats.margeMoyenne)}
          icon={BarChart3}
          valueClassName={stats.margeMoyenne >= 0.2 ? 'text-emerald-400' : stats.margeMoyenne >= 0.1 ? 'text-amber-400' : 'text-red-400'}
        />
        <KPICard
          title="Articles vendus"
          value={String(stats.nbVendus)}
          icon={ShoppingCart}
          sub="au total"
        />
        <KPICard
          title="En stock"
          value={String(stats.nbEnStock)}
          icon={Package}
          valueClassName="text-amber-400"
          sub="articles"
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

      {/* Bottom row: recent sales + top performers */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent sales — takes 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <CardTitle className="text-base">Dernières ventes</CardTitle>
            </div>
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
                      <th className="px-6 py-3 text-left text-gray-500 font-medium hidden sm:table-cell">Catégorie</th>
                      <th className="px-6 py-3 text-right text-gray-500 font-medium">Vendu</th>
                      <th className="px-6 py-3 text-right text-gray-500 font-medium">Bénéfice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.dernieresVentes.map((a: Article) => {
                      const benefice = a.prixVente != null
                        ? a.prixVente - a.prixAchat - a.fraisDivers
                        : null
                      const marge = a.prixVente != null && a.prixVente > 0
                        ? benefice! / a.prixVente
                        : null
                      return (
                        <tr key={a.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-white font-medium text-sm">{a.nom}</p>
                            <p className="text-gray-600 text-xs mt-0.5">
                              {format(new Date(a.dateAchat), 'dd MMM yyyy', { locale: fr })}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-xs hidden sm:table-cell">
                            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/8">
                              {a.categorie}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-300 font-medium">
                            {a.prixVente != null ? formatCurrency(a.prixVente) : '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {benefice !== null ? (
                              <div>
                                <p className={cn('font-semibold text-sm', benefice >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                                  {benefice >= 0 ? '+' : ''}{formatCurrency(benefice)}
                                </p>
                                {marge !== null && (
                                  <p className="text-gray-600 text-xs">
                                    {(marge * 100).toFixed(0)}%
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
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

        {/* Top performers */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <CardTitle className="text-base">Meilleures ventes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topArticles.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-4">Pas encore de données</p>
            ) : (
              topArticles.map((a: any, i: number) => {
                const medals = ['🥇', '🥈', '🥉']
                const marge = a.prixVente > 0 ? (a._benefice / a.prixVente) * 100 : 0
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8">
                    <span className="text-lg">{medals[i]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{a.nom}</p>
                      <p className="text-gray-600 text-xs">{formatCurrency(a.prixVente)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold text-sm">+{formatCurrency(a._benefice)}</p>
                      <p className="text-gray-500 text-xs">{marge.toFixed(0)}% marge</p>
                    </div>
                  </div>
                )
              })
            )}

            {/* Category breakdown */}
            {stats.repartitionCategorie.length > 0 && (
              <div className="pt-3 border-t border-white/8 space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Par catégorie</p>
                {stats.repartitionCategorie
                  .sort((a, b) => b.benefice - a.benefice)
                  .slice(0, 3)
                  .map((cat) => (
                    <div key={cat.categorie} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{cat.categorie}</span>
                      <div className="text-right">
                        <span className="text-white font-medium">{cat.count} art.</span>
                        <span className={cn('ml-2', cat.benefice >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {cat.benefice >= 0 ? '+' : ''}{formatCurrency(cat.benefice)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
