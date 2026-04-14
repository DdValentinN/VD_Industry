'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Article, Parametre } from '@/types'

const PER_PAGE_OPTIONS = [25, 50, 100, 0] // 0 = Tout

interface ArticleTableProps {
  articles: Article[]
  parametres: Parametre
  onEdit?: (article: Article) => void
}

export function ArticleTable({ articles, parametres, onEdit }: ArticleTableProps) {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  const [filterStatut, setFilterStatut] = useState('')
  const [filterCategorie, setFilterCategorie] = useState('')
  const [filterMois, setFilterMois] = useState('')

  const categories = useMemo(
    () => Array.from(new Set(articles.map((a) => a.categorie))).sort(),
    [articles],
  )

  const moisList = useMemo(
    () =>
      Array.from(new Set(articles.map((a) => a.dateAchat.slice(0, 7))))
        .sort()
        .reverse(),
    [articles],
  )

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      if (filterStatut && a.statut !== filterStatut) return false
      if (filterCategorie && a.categorie !== filterCategorie) return false
      if (filterMois && a.dateAchat.slice(0, 7) !== filterMois) return false
      return true
    })
  }, [articles, filterStatut, filterCategorie, filterMois])

  const effectivePerPage = perPage === 0 ? filtered.length : perPage
  const totalPages = Math.max(1, Math.ceil(filtered.length / effectivePerPage))
  const paginated = perPage === 0 ? filtered : filtered.slice((page - 1) * perPage, page * perPage)

  function resetFilters() {
    setFilterStatut('')
    setFilterCategorie('')
    setFilterMois('')
    setPage(1)
  }

  function changePage(n: number) {
    setPage(Math.min(Math.max(1, n), totalPages))
  }

  function getBeneficeStyle(benefice: number): string {
    if (benefice >= 0) return 'text-emerald-400'
    if (benefice >= -parametres.seuilOrange) return 'text-amber-400'
    return 'text-red-400'
  }

  const selectClass =
    'rounded-md border border-white/15 bg-[#1a1a1a] text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500'

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterStatut}
          onChange={(e) => { setFilterStatut(e.target.value); setPage(1) }}
          className={selectClass}
        >
          <option value="">Tous les statuts</option>
          <option value="En stock">En stock</option>
          <option value="Vendu">Vendu</option>
        </select>

        <select
          value={filterCategorie}
          onChange={(e) => { setFilterCategorie(e.target.value); setPage(1) }}
          className={selectClass}
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filterMois}
          onChange={(e) => { setFilterMois(e.target.value); setPage(1) }}
          className={selectClass}
        >
          <option value="">Tous les mois</option>
          {moisList.map((m) => (
            <option key={m} value={m}>
              {format(new Date(m + '-01'), 'MMMM yyyy', { locale: fr })}
            </option>
          ))}
        </select>

        {(filterStatut || filterCategorie || filterMois) && (
          <button
            onClick={resetFilters}
            className="text-sm text-gray-400 hover:text-white underline transition-colors"
          >
            Réinitialiser
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1) }}
            className={selectClass}
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
            <option value={0}>Tout afficher</option>
          </select>
          <span className="text-sm text-gray-500">
            {filtered.length} article(s)
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/3 border-b border-white/10">
                {['ID', 'Photo', 'Article', 'Catégorie', 'Date achat', 'Pr. achat', 'Frais', 'Pr. vente', 'Bénéfice', 'Marge', 'Statut', ...(onEdit ? ['Actions'] : [])].map(
                  (h) => (
                    <th
                      key={h}
                      className={cn(
                        'px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap',
                        ['Pr. achat', 'Frais', 'Pr. vente', 'Bénéfice', 'Marge'].includes(h)
                          ? 'text-right'
                          : ['Statut', 'Actions'].includes(h)
                          ? 'text-center'
                          : 'text-left',
                      )}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={onEdit ? 12 : 11} className="px-4 py-12 text-center text-gray-500">
                    Aucun article trouvé
                  </td>
                </tr>
              ) : (
                paginated.map((article) => {
                  const benefice =
                    article.prixVente != null
                      ? article.prixVente - article.prixAchat - article.fraisDivers
                      : null
                  const marge =
                    benefice !== null && article.prixVente && article.prixVente > 0
                      ? benefice / article.prixVente
                      : null

                  return (
                    <tr
                      key={article.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {article.articleId}
                      </td>
                      <td className="px-4 py-3">
                        {article.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={article.imageUrl}
                            alt={article.nom}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/8 flex items-center justify-center text-gray-600 text-xs">
                            —
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white font-medium max-w-[160px]">
                        <span className="block truncate" title={article.nom}>
                          {article.nom}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {article.categorie}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {format(new Date(article.dateAchat), 'dd/MM/yyyy', { locale: fr })}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300 whitespace-nowrap">
                        {formatCurrency(article.prixAchat)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 whitespace-nowrap">
                        {formatCurrency(article.fraisDivers)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300 whitespace-nowrap">
                        {article.prixVente != null ? formatCurrency(article.prixVente) : '—'}
                      </td>
                      <td
                        className={cn(
                          'px-4 py-3 text-right font-semibold whitespace-nowrap',
                          benefice !== null ? getBeneficeStyle(benefice) : 'text-gray-500',
                        )}
                      >
                        {benefice !== null ? formatCurrency(benefice) : '—'}
                      </td>
                      <td
                        className={cn(
                          'px-4 py-3 text-right whitespace-nowrap',
                          marge !== null
                            ? marge >= 0
                              ? 'text-emerald-400'
                              : 'text-red-400'
                            : 'text-gray-500',
                        )}
                      >
                        {marge !== null ? formatPercent(marge) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={article.statut === 'Vendu' ? 'default' : 'secondary'}
                        >
                          {article.statut}
                        </Badge>
                      </td>
                      {onEdit && (
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => onEdit(article)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => changePage(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-400 min-w-[80px] text-center">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => changePage(page + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
