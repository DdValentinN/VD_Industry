'use client'

import { useEffect, useState } from 'react'
import { Save, Settings, Lock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'

export default function ParametresPage() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [seuilOrange, setSeuilOrange] = useState('2')
  const [margeCible, setMargeCible] = useState('30')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/parametres')
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setSeuilOrange(String(d.data.seuilOrange))
          setMargeCible(String(Math.round(d.data.margeCible * 100)))
        }
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

  // Not admin — show locked state
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

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
          <p className="text-gray-400 mt-0.5">Configuration de l&apos;application</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seuils de performance</CardTitle>
          <CardDescription>
            Ces valeurs définissent le code couleur du tableau de ventes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="seuil">Seuil bénéfice (€) — zone orange</Label>
              <Input
                id="seuil"
                type="number"
                step="0.5"
                min="0"
                value={seuilOrange}
                onChange={(e) => setSeuilOrange(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Un bénéfice entre -{seuilOrange}€ et 0€ s&apos;affichera en orange.
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
            </div>

            <div className="rounded-xl border border-white/10 p-4 bg-white/3 space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Aperçu du code couleur
              </p>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-sm text-gray-300">Bénéfice &lt; -{seuilOrange}€</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-sm text-gray-300">-{seuilOrange}€ ≤ Bénéfice &lt; 0€</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-sm text-gray-300">Bénéfice ≥ 0€</span>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
