'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Plus, ShoppingBag, Package, TrendingUp, Wallet, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ArticleTable } from '@/components/app/ArticleTable'
import { ArticleModal } from '@/components/app/ArticleModal'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Article, Parametre } from '@/types'

interface KPI {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  color?: string
}

function MiniKPI({ label, value, sub, icon: Icon, color }: KPI) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111] p-4 flex flex-col gap-2 hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
      <p className={cn('text-xl font-bold text-white', color)}>{value}</p>
      {sub && <p className="text-[11px] text-gray-600">{sub}</p>}
    </div>
  )
}

export default function VentesPage() {
  const { isLoggedIn } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [parametres, setParametres] = useState<Parametre | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editArticle, setEditArticle] = useState<Article | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [articlesRes, parametresRes] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/parametres'),
      ])
      const articlesData = await articlesRes.json()
      const parametresData = await parametresRes.json()
      setArticles(articlesData.data ?? [])
      setParametres(parametresData.data ?? { id: 1, seuilOrange: 2, margeCible: 0.3 })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function openAdd() { setEditArticle(null); setModalOpen(true) }
  function openEdit(article: Article) { setEditArticle(article); setModalOpen(true) }

  const stats = useMemo(() => {
    const enStock = articles.filter((a) => a.statut === 'En stock')
    const vendus = articles.filter((a) => a.statut === 'Vendu' && a.prixVente != null)

    const valeurStock = enStock.reduce((s, a) => s + a.prixAchat, 0)
    const beneficeTotal = vendus.reduce(
      (s, a) => s + (a.prixVente! - a.prixAchat - a.fraisDivers),
      0,
    )
    const ca = vendus.reduce((s, a) => s + a.prixVente!, 0)

    const marges = vendus
      .filter((a) => a.prixVente! > 0)
      .map((a) => (a.prixVente! - a.prixAchat - a.fraisDivers) / a.prixVente!)
    const margeMoy = marges.length > 0 ? marges.reduce((s, m) => s + m, 0) / marges.length : 0

    // Ce mois-ci
    const now = new Date()
    const moisCle = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const vendusCeMois = vendus.filter((a) => a.dateAchat.slice(0, 7) === moisCle).length

    return { enStock: enStock.length, vendus: vendus.length, valeurStock, beneficeTotal, ca, margeMoy, vendusCeMois }
  }, [articles])

  return (
    <div className="p-4 sm:p-6 max-w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Ventes</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {articles.length} articles au total · {stats.enStock} en stock · {stats.vendus} vendus
          </p>
        </div>
        {isLoggedIn && (
          <Button onClick={openAdd} className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un article
          </Button>
        )}
      </div>

      {/* KPI Strip */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <MiniKPI
            label="En stock"
            value={String(stats.enStock)}
            sub={`${formatCurrency(stats.valeurStock)} immobilisés`}
            icon={Package}
            color="text-amber-400"
          />
          <MiniKPI
            label="Articles vendus"
            value={String(stats.vendus)}
            sub={`dont ${stats.vendusCeMois} ce mois`}
            icon={ShoppingBag}
          />
          <MiniKPI
            label="Chiffre d'affaires"
            value={formatCurrency(stats.ca)}
            icon={Wallet}
          />
          <MiniKPI
            label="Bénéfice total"
            value={formatCurrency(stats.beneficeTotal)}
            icon={TrendingUp}
            color={stats.beneficeTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
          <MiniKPI
            label="Marge moyenne"
            value={formatPercent(stats.margeMoy)}
            icon={BarChart3}
            color={stats.margeMoy >= 0.2 ? 'text-emerald-400' : stats.margeMoy >= 0.1 ? 'text-amber-400' : 'text-red-400'}
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ArticleTable
          articles={articles}
          parametres={parametres ?? { id: 1, seuilOrange: 2, margeCible: 0.3 }}
          onEdit={isLoggedIn ? openEdit : undefined}
        />
      )}

      {isLoggedIn && (
        <ArticleModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditArticle(null) }}
          article={editArticle}
          onSuccess={fetchData}
        />
      )}
    </div>
  )
}
