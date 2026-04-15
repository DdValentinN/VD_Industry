'use client'

import { useEffect, useState } from 'react'
import {
  Save, Settings, Lock, TrendingUp, Package, ShoppingCart,
  Euro, Bot, CheckCircle2, XCircle, Info, Palette, BarChart3,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface QuickStats {
  chiffreAffaires: number
  beneficeNet: number
  margeMoyenne: number
  nbVendus: number
  nbEnStock: number
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={cn('text-sm font-semibold text-white', color)}>{value}</span>
    </div>
  )
}

export default function ParametresPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [seuilOrange, setSeuilOrange] = useState('2')
  const [margeCible, setMargeCible] = useState('30')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<QuickStats | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/parametres').then(r => r.json()),
      fetch('/api/stats').then(r => r.json()),
    ])
      .then(([pData, sData]) => {
        if (pData.data) {
          setSeuilOrange(String(pData.data.seuilOrange))
          setMargeCible(String(Math.round(pData.data.margeCible * 100)))
        }
        if (sData.data) setStats(sData.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/parametres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seuilOrange: parseFloat(seuilOrange) || 2,
          margeCible: (parseFloat(margeCible) || 30) / 100,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Paramètres sauvegardés !')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Accès restreint</h2>
        <p className="text-gray-500 text-sm max-w-xs mb-6">
          Cette page est réservée à l&apos;administrateur. Connectez-vous pour modifier les paramètres.
        </p>
        <Link
          href="/app/login"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-sm transition-all"
        >
          Se connecter
        </Link>
      </div>
    )
  }

  const margeCibleNum = parseFloat(margeCible) / 100

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Paramètres</h1>
          <p className="text-gray-400 mt-0.5 text-sm">Configuration et vue d&apos;ensemble</p>
        </div>
      </div>

      {/* Quick stats */}
      {stats && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <CardTitle className="text-base">Résumé de l&apos;activité</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Chiffre d\'affaires', value: formatCurrency(stats.chiffreAffaires), icon: Euro, color: 'text-white' },
                { label: 'Bénéfice net', value: formatCurrency(stats.beneficeNet), icon: TrendingUp, color: stats.beneficeNet >= 0 ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Marge moyenne', value: formatPercent(stats.margeMoyenne), icon: BarChart3, color: stats.margeMoyenne >= 0.2 ? 'text-emerald-400' : 'text-amber-400' },
                { label: 'Articles vendus', value: String(stats.nbVendus), icon: ShoppingCart, color: 'text-white' },
                { label: 'En stock', value: String(stats.nbEnStock), icon: Package, color: 'text-amber-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <s.icon className="w-3.5 h-3.5 text-gray-500" />
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">{s.label}</p>
                  </div>
                  <p className={cn('text-lg font-bold', s.color)}>{s.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance thresholds */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            <div>
              <CardTitle className="text-base">Seuils de performance</CardTitle>
              <CardDescription className="mt-0.5">
                Définissent le code couleur du tableau de ventes.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seuil">Seuil bénéfice — zone orange (€)</Label>
                <Input
                  id="seuil"
                  type="number"
                  step="0.5"
                  min="0"
                  value={seuilOrange}
                  onChange={(e) => setSeuilOrange(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Bénéfice entre -{seuilOrange}€ et 0€ → orange
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marge">Marge cible (%)</Label>
                <Input
                  id="marge"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={margeCible}
                  onChange={(e) => setMargeCible(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Objectif de marge sur ventes
                </p>
              </div>
            </div>

            {/* Color preview */}
            <div className="rounded-xl border border-white/10 p-4 bg-white/3 space-y-2.5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Aperçu du code couleur
              </p>
              {[
                { color: 'bg-red-400', dot: 'text-red-400', label: `Bénéfice < -${seuilOrange}€`, example: 'ex: vente à perte' },
                { color: 'bg-amber-400', dot: 'text-amber-400', label: `-${seuilOrange}€ ≤ Bénéfice < 0€`, example: 'légèrement négatif' },
                { color: 'bg-emerald-400', dot: 'text-emerald-400', label: `Bénéfice ≥ 0€`, example: 'objectif atteint' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-3 h-3 rounded-full', row.color)} />
                    <span className="text-sm text-gray-300">{row.label}</span>
                  </div>
                  <span className="text-xs text-gray-600">{row.example}</span>
                </div>
              ))}
              <div className="border-t border-white/8 pt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-purple-400" />
                  <span className="text-sm text-gray-300">Marge ≥ {margeCible}%</span>
                </div>
                <span className="text-xs text-gray-600">marge cible dépassée</span>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bot Vinted status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <div>
              <CardTitle className="text-base">Bot Vinted</CardTitle>
              <CardDescription className="mt-0.5">
                État de la configuration du bot de surveillance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-white/10 p-4 bg-white/3 space-y-3">
            <StatRow label="Endpoint de recherche" value="/api/bot/search" />
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm text-gray-400">Cookie Vinted (VINTED_COOKIE)</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-400">
                <XCircle className="w-4 h-4" />
                À configurer
              </span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Pour que le bot fonctionne sur Vercel, ajoute la variable d&apos;env :</p>
              <code className="block bg-black/40 rounded px-2 py-1.5 text-emerald-400 font-mono">
                VINTED_COOKIE=_vinted_fr_session=...
              </code>
              <p className="text-gray-600">Copie tous les cookies depuis DevTools → Network → vinted.fr → Cookie header</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-400" />
            <CardTitle className="text-base">À propos</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            <StatRow label="Application" value="VD Industry" />
            <StatRow label="Stack" value="Next.js 14 · Prisma · Neon PostgreSQL" />
            <StatRow label="Hébergement" value="Vercel" />
            <StatRow label="Version" value="1.0.0" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
