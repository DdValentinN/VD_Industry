'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Upload, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { Article } from '@/types'

const CATEGORIES = [
  'Vêtements', 'Chaussures', 'Accessoires', 'Maison',
  'Sport', 'Électronique', 'Jeux & Jouets', 'Livres & BD', 'Autres',
]

interface FormState {
  nom: string
  categorie: string
  dateAchat: string
  prixAchat: string
  fraisDivers: string
  prixVente: string
  statut: string
  notes: string
}

const defaultForm: FormState = {
  nom: '',
  categorie: 'Vêtements',
  dateAchat: new Date().toISOString().split('T')[0],
  prixAchat: '',
  fraisDivers: '0',
  prixVente: '',
  statut: 'En stock',
  notes: '',
}

interface ArticleModalProps {
  open: boolean
  onClose: () => void
  article?: Article | null
  onSuccess: () => void
}

export function ArticleModal({ open, onClose, article, onSuccess }: ArticleModalProps) {
  const [form, setForm] = useState<FormState>(defaultForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (article) {
      setForm({
        nom: article.nom,
        categorie: article.categorie,
        dateAchat: new Date(article.dateAchat).toISOString().split('T')[0],
        prixAchat: String(article.prixAchat),
        fraisDivers: String(article.fraisDivers),
        prixVente: article.prixVente != null ? String(article.prixVente) : '',
        statut: article.statut,
        notes: article.notes ?? '',
      })
      setImagePreview(article.imageUrl ?? null)
      setImageFile(null)
    } else {
      setForm(defaultForm)
      setImagePreview(null)
      setImageFile(null)
    }
  }, [article, open])

  const prixVenteNum = parseFloat(form.prixVente) || 0
  const prixAchatNum = parseFloat(form.prixAchat) || 0
  const fraisDiversNum = parseFloat(form.fraisDivers) || 0
  const benefice = form.prixVente ? prixVenteNum - prixAchatNum - fraisDiversNum : null
  const marge = benefice !== null && prixVenteNum > 0 ? benefice / prixVenteNum : null

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Seules les images sont acceptées')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function update(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      let imageUrl: string | null = article?.imageUrl ?? null

      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!uploadRes.ok) throw new Error("Échec de l'upload de l'image")
        const { url } = await uploadRes.json()
        imageUrl = url
      }

      const payload = {
        nom: form.nom.trim(),
        categorie: form.categorie,
        dateAchat: new Date(form.dateAchat).toISOString(),
        prixAchat: parseFloat(form.prixAchat) || 0,
        fraisDivers: parseFloat(form.fraisDivers) || 0,
        prixVente: form.prixVente ? parseFloat(form.prixVente) : null,
        statut: form.statut,
        notes: form.notes.trim() || null,
        imageUrl,
      }

      const url = article ? `/api/articles/${article.id}` : '/api/articles'
      const res = await fetch(url, {
        method: article ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erreur serveur')
      }

      toast.success(article ? 'Article modifié !' : 'Article ajouté !')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!article) return
    if (!confirm(`Supprimer "${article.nom}" ? Cette action est irréversible.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/articles/${article.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Suppression échouée')
      toast.success('Article supprimé')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const selectClass =
    'w-full mt-1 rounded-md border border-white/20 bg-[#1a1a1a] text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0'

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto bg-[#111] border-white/10">
        <DialogHeader>
          <DialogTitle>
            {article ? "Modifier l'article" : 'Ajouter un article'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Image upload */}
          <div>
            <Label>Photo (optionnel)</Label>
            <div
              className={`mt-1.5 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : 'border-white/15 hover:border-white/30'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-36 rounded-lg mx-auto object-cover"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation()
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm">Glisser une image ici ou cliquer pour choisir</p>
                  <p className="text-xs mt-1 text-gray-600">PNG, JPG, WEBP acceptés</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
                e.target.value = ''
              }}
            />
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <Label htmlFor="nom">Nom de l&apos;article *</Label>
              <Input
                id="nom"
                required
                value={form.nom}
                onChange={(e) => update('nom', e.target.value)}
                placeholder="ex: Veste Nike vintage..."
              />
            </div>

            <div>
              <Label htmlFor="categorie">Catégorie *</Label>
              <select
                id="categorie"
                value={form.categorie}
                onChange={(e) => update('categorie', e.target.value)}
                className={selectClass}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <Label htmlFor="statut">Statut *</Label>
              <select
                id="statut"
                value={form.statut}
                onChange={(e) => update('statut', e.target.value)}
                className={selectClass}
              >
                <option value="En stock">En stock</option>
                <option value="Vendu">Vendu</option>
              </select>
            </div>

            <div>
              <Label htmlFor="dateAchat">Date d&apos;achat *</Label>
              <Input
                id="dateAchat"
                type="date"
                required
                value={form.dateAchat}
                onChange={(e) => update('dateAchat', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="prixAchat">Prix d&apos;achat (€) *</Label>
              <Input
                id="prixAchat"
                type="number"
                step="0.01"
                min="0"
                required
                value={form.prixAchat}
                onChange={(e) => update('prixAchat', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="fraisDivers">Frais divers (€)</Label>
              <Input
                id="fraisDivers"
                type="number"
                step="0.01"
                min="0"
                value={form.fraisDivers}
                onChange={(e) => update('fraisDivers', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="prixVente">Prix de vente (€)</Label>
              <Input
                id="prixVente"
                type="number"
                step="0.01"
                min="0"
                value={form.prixVente}
                onChange={(e) => update('prixVente', e.target.value)}
                placeholder="Optionnel"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Remarques, état de l'article..."
                rows={2}
              />
            </div>
          </div>

          {/* Live calculation */}
          {form.prixVente && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">Bénéfice net</p>
                <p className={`text-xl font-bold ${benefice! >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(benefice!)}
                </p>
              </div>
              {marge !== null && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Marge</p>
                  <p className={`text-xl font-bold ${marge >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPercent(marge)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-1">
            {article && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                size="sm"
              >
                Supprimer
              </Button>
            )}
            <div className="flex gap-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'En cours...' : article ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
