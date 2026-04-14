'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ArticleTable } from '@/components/app/ArticleTable'
import { ArticleModal } from '@/components/app/ArticleModal'
import { useAuth } from '@/context/AuthContext'
import type { Article, Parametre } from '@/types'

export default function VentesPage() {
  const { isAdmin } = useAuth()
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

  return (
    <div className="p-4 sm:p-6 max-w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Ventes</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Tous tes articles — achetés et revendus</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd} className="w-full sm:w-auto shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un article
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ArticleTable
          articles={articles}
          parametres={parametres ?? { id: 1, seuilOrange: 2, margeCible: 0.3 }}
          onEdit={isAdmin ? openEdit : undefined}
        />
      )}

      {isAdmin && (
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
