'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Euro, TrendingUp, TrendingDown, Wallet, Shield, ChevronLeft, ChevronRight,
  Settings, Plus, Edit2, Trash2, X, Save, Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { KPICard } from '@/components/app/KPICard'
import { FinancesSoldeChart, FinancesRevenusChart, FinancesChargesPie } from '@/components/app/Charts'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { FinancesParams, FinancesCharge, FinancesMois, FinancesMoisComputed, FinancesProjection } from '@/types'

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const MOIS_FULL = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

// ─── Modal: Edit Monthly Revenue ─────────────────────────────────────────────

interface MoisModalProps {
  open: boolean
  onClose: () => void
  mois: number
  annee: number
  nom1: string
  nom2: string
  chargesTotales: number
  existingEntry: FinancesMois | null
  onSuccess: () => void
}

function MoisModal({ open, onClose, mois, annee, nom1, nom2, chargesTotales, existingEntry, onSuccess }: MoisModalProps) {
  const [revenu1, setRevenu1] = useState('')
  const [revenu2, setRevenu2] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setRevenu1(existingEntry ? String(existingEntry.revenu1) : '')
    setRevenu2(existingEntry ? String(existingEntry.revenu2) : '')
  }, [open, existingEntry])

  const r1 = parseFloat(revenu1) || 0
  const r2 = parseFloat(revenu2) || 0
  const total = r1 + r2
  const epargne = total - chargesTotales

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/finances/mois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annee, mois, revenu1: r1, revenu2: r2 }),
      })
      if (!res.ok) throw new Error()
      toast.success(`${MOIS_FULL[mois - 1]} ${annee} enregistré`)
      onSuccess()
      onClose()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm bg-[#111] border-white/10">
        <DialogHeader>
          <DialogTitle>Revenus — {MOIS_FULL[mois - 1]} {annee}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label htmlFor="r1">Salaire {nom1} (€)</Label>
            <Input id="r1" type="number" step="0.01" min="0" value={revenu1} onChange={(e) => setRevenu1(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="r2">Salaire {nom2} (€)</Label>
            <Input id="r2" type="number" step="0.01" min="0" value={revenu2} onChange={(e) => setRevenu2(e.target.value)} placeholder="0.00" />
          </div>
          {(r1 > 0 || r2 > 0) && (
            <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Total revenus</span>
                <span className="text-white font-semibold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Charges</span>
                <span className="text-red-400">− {formatCurrency(chargesTotales)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
                <span className="text-gray-300">Épargne nette</span>
                <span className={epargne >= 0 ? 'text-emerald-400' : 'text-red-400'}>{formatCurrency(epargne)}</span>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={saving}>Annuler</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Sauvegarde...' : 'Enregistrer'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal: Manage Charges ───────────────────────────────────────────────────

interface ChargesModalProps {
  open: boolean
  onClose: () => void
  charges: FinancesCharge[]
  onSuccess: () => void
}

function ChargesModal({ open, onClose, charges, onSuccess }: ChargesModalProps) {
  const [editId, setEditId] = useState<number | null>(null)
  const [editNom, setEditNom] = useState('')
  const [editMontant, setEditMontant] = useState('')
  const [editType, setEditType] = useState<'fixe' | 'variable'>('fixe')
  const [addMode, setAddMode] = useState(false)
  const [newNom, setNewNom] = useState('')
  const [newMontant, setNewMontant] = useState('')
  const [newType, setNewType] = useState<'fixe' | 'variable'>('fixe')
  const [loading, setLoading] = useState(false)

  const selectClass = 'rounded-md border border-white/20 bg-[#1a1a1a] text-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500'

  function startEdit(c: FinancesCharge) {
    setEditId(c.id)
    setEditNom(c.nom)
    setEditMontant(String(c.montant))
    setEditType(c.type as 'fixe' | 'variable')
    setAddMode(false)
  }

  async function saveEdit() {
    if (!editId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/finances/charges/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: editNom, montant: parseFloat(editMontant) || 0, type: editType }),
      })
      if (!res.ok) throw new Error()
      toast.success('Charge modifiée')
      setEditId(null)
      onSuccess()
    } catch { toast.error('Erreur') } finally { setLoading(false) }
  }

  async function deleteCharge(id: number) {
    if (!confirm('Supprimer cette charge ?')) return
    setLoading(true)
    try {
      await fetch(`/api/finances/charges/${id}`, { method: 'DELETE' })
      toast.success('Charge supprimée')
      if (editId === id) setEditId(null)
      onSuccess()
    } catch { toast.error('Erreur') } finally { setLoading(false) }
  }

  async function addCharge(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/finances/charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: newNom, montant: parseFloat(newMontant) || 0, type: newType }),
      })
      if (!res.ok) throw new Error()
      toast.success('Charge ajoutée')
      setNewNom(''); setNewMontant(''); setNewType('fixe'); setAddMode(false)
      onSuccess()
    } catch { toast.error('Erreur') } finally { setLoading(false) }
  }

  const fixes = charges.filter(c => c.type === 'fixe')
  const variables = charges.filter(c => c.type === 'variable')
  const totalFix = fixes.reduce((s, c) => s + c.montant, 0)
  const totalVar = variables.reduce((s, c) => s + c.montant, 0)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#111] border-white/10">
        <DialogHeader>
          <DialogTitle>Gérer les charges mensuelles</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {['fixe', 'variable'].map((typ) => {
            const list = typ === 'fixe' ? fixes : variables
            const total = typ === 'fixe' ? totalFix : totalVar
            return (
              <div key={typ}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Charges {typ === 'fixe' ? 'fixes' : 'variables'}
                  </h3>
                  <span className="text-xs text-gray-400">{formatCurrency(total)}/mois</span>
                </div>
                <div className="space-y-1">
                  {list.map((c) => (
                    <div key={c.id} className="rounded-lg border border-white/8 bg-white/3 px-3 py-2">
                      {editId === c.id ? (
                        <div className="flex items-center gap-2">
                          <input value={editNom} onChange={(e) => setEditNom(e.target.value)} className="flex-1 bg-transparent text-white text-sm focus:outline-none border-b border-emerald-500/50" />
                          <input value={editMontant} onChange={(e) => setEditMontant(e.target.value)} type="number" step="0.01" className="w-20 bg-transparent text-white text-sm focus:outline-none border-b border-emerald-500/50 text-right" />
                          <select value={editType} onChange={(e) => setEditType(e.target.value as 'fixe' | 'variable')} className={selectClass}>
                            <option value="fixe">Fixe</option>
                            <option value="variable">Variable</option>
                          </select>
                          <button onClick={saveEdit} disabled={loading} className="text-emerald-400 hover:text-emerald-300"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditId(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">{c.nom}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-300 tabular-nums">{formatCurrency(c.montant)}</span>
                            <button onClick={() => startEdit(c)} className="text-gray-600 hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteCharge(c.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Add form */}
          {addMode ? (
            <form onSubmit={addCharge} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Nouvelle charge</p>
              <div className="grid grid-cols-2 gap-3">
                <Input value={newNom} onChange={(e) => setNewNom(e.target.value)} placeholder="Nom" required />
                <Input value={newMontant} onChange={(e) => setNewMontant(e.target.value)} type="number" step="0.01" placeholder="Montant €" required />
              </div>
              <select value={newType} onChange={(e) => setNewType(e.target.value as 'fixe' | 'variable')} className={selectClass + ' w-full'}>
                <option value="fixe">Fixe</option>
                <option value="variable">Variable</option>
              </select>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={loading}>Ajouter</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setAddMode(false)}>Annuler</Button>
              </div>
            </form>
          ) : (
            <button onClick={() => setAddMode(true)} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-white/15 text-gray-600 hover:text-white hover:border-white/30 text-sm transition-colors">
              <Plus className="w-4 h-4" /> Ajouter une charge
            </button>
          )}

          <div className="rounded-xl border border-white/10 bg-white/3 p-3 flex items-center justify-between">
            <span className="text-sm text-gray-400">Total charges mensuelles</span>
            <span className="font-bold text-white tabular-nums">{formatCurrency(totalFix + totalVar)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Modal: Parameters ───────────────────────────────────────────────────────

interface ParamsModalProps {
  open: boolean
  onClose: () => void
  params: FinancesParams | null
  onSuccess: () => void
}

function ParamsModal({ open, onClose, params, onSuccess }: ParamsModalProps) {
  const [form, setForm] = useState({
    nom1: 'Valentin', nom2: 'Clara',
    soldeDepart: '23000', objectifEpargne: '500',
    nbMoisSecurite: '6', anneeRef: '2026',
    revenu1Projection: '2332', revenu2Projection: '436',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !params) return
    setForm({
      nom1: params.nom1, nom2: params.nom2,
      soldeDepart: String(params.soldeDepart),
      objectifEpargne: String(params.objectifEpargne),
      nbMoisSecurite: String(params.nbMoisSecurite),
      anneeRef: String(params.anneeRef),
      revenu1Projection: String(params.revenu1Projection),
      revenu2Projection: String(params.revenu2Projection),
    })
  }, [open, params])

  function upd(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/finances/params', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Paramètres sauvegardés')
      onSuccess()
      onClose()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md bg-[#111] border-white/10">
        <DialogHeader>
          <DialogTitle>Paramètres du couple</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Prénom 1</Label><Input value={form.nom1} onChange={(e) => upd('nom1', e.target.value)} /></div>
            <div className="space-y-1"><Label>Prénom 2</Label><Input value={form.nom2} onChange={(e) => upd('nom2', e.target.value)} /></div>
          </div>
          <div className="space-y-1"><Label>Solde de départ du couple (€)</Label><Input type="number" step="0.01" value={form.soldeDepart} onChange={(e) => upd('soldeDepart', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Objectif épargne (€/mois)</Label><Input type="number" step="1" value={form.objectifEpargne} onChange={(e) => upd('objectifEpargne', e.target.value)} /></div>
            <div className="space-y-1"><Label>Mois de sécurité</Label><Input type="number" step="1" min="1" value={form.nbMoisSecurite} onChange={(e) => upd('nbMoisSecurite', e.target.value)} /></div>
          </div>
          <div className="space-y-1"><Label>Année de référence</Label><Input type="number" step="1" value={form.anneeRef} onChange={(e) => upd('anneeRef', e.target.value)} /></div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider pt-1">Projection 5 ans — revenus mensuels estimés</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Revenu {form.nom1} (€/mois)</Label><Input type="number" step="0.01" value={form.revenu1Projection} onChange={(e) => upd('revenu1Projection', e.target.value)} /></div>
            <div className="space-y-1"><Label>Revenu {form.nom2} (€/mois)</Label><Input type="number" step="0.01" value={form.revenu2Projection} onChange={(e) => upd('revenu2Projection', e.target.value)} /></div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={saving}>Annuler</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Sauvegarde...' : 'Enregistrer'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinancesPage() {
  const { isAdmin } = useAuth()
  const [params, setParams] = useState<FinancesParams | null>(null)
  const [charges, setCharges] = useState<FinancesCharge[]>([])
  const [moisEntries, setMoisEntries] = useState<FinancesMois[]>([])
  const [annee, setAnnee] = useState(2026)
  const [loading, setLoading] = useState(true)

  // Modal states
  const [editMois, setEditMois] = useState<number | null>(null)
  const [showCharges, setShowCharges] = useState(false)
  const [showParams, setShowParams] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, cRes, mRes] = await Promise.all([
        fetch('/api/finances/params'),
        fetch('/api/finances/charges'),
        fetch(`/api/finances/mois?annee=${annee}`),
      ])
      const [pData, cData, mData] = await Promise.all([pRes.json(), cRes.json(), mRes.json()])
      setParams(pData.data)
      setCharges(cData.data ?? [])
      setMoisEntries(mData.data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [annee])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Compute dashboard ─────────────────────────────────────────────────────
  const dash = useMemo(() => {
    if (!params) return null

    const chargesFixes = charges.filter(c => c.type === 'fixe').reduce((s, c) => s + c.montant, 0)
    const chargesVariables = charges.filter(c => c.type === 'variable').reduce((s, c) => s + c.montant, 0)
    const chargesTotales = chargesFixes + chargesVariables

    let solde = params.soldeDepart
    const moisData: FinancesMoisComputed[] = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1
      const entry = moisEntries.find(e => e.mois === m)
      const revenu1 = entry?.revenu1 ?? 0
      const revenu2 = entry?.revenu2 ?? 0
      const revenuTotal = revenu1 + revenu2
      const hasData = revenu1 > 0 || revenu2 > 0
      const epargne = hasData ? revenuTotal - chargesTotales : 0
      if (hasData) solde += epargne
      return {
        mois: m,
        nom: MOIS[i],
        revenu1, revenu2, revenuTotal,
        chargesFixes, chargesVariables, chargesTotales,
        epargne, solde,
        tauxEpargne: revenuTotal > 0 ? epargne / revenuTotal : 0,
        poids1: revenuTotal > 0 ? revenu1 / revenuTotal : 0,
        poids2: revenuTotal > 0 ? revenu2 / revenuTotal : 0,
        hasData,
      }
    })

    const moisAvecDonnees = moisData.filter(m => m.hasData)
    const revenuAnnuel = moisAvecDonnees.reduce((s, m) => s + m.revenuTotal, 0)
    const chargesAnnuelles = chargesTotales * moisAvecDonnees.length
    const epargnAnnuelle = revenuAnnuel - chargesAnnuelles
    const tauxEpargne = revenuAnnuel > 0 ? epargnAnnuelle / revenuAnnuel : 0
    const soldeFin = moisData[11].solde
    const fondUrgence = chargesTotales * params.nbMoisSecurite
    const couvertureUrgence = fondUrgence > 0 ? soldeFin / fondUrgence : 0

    const epargnesmois = moisAvecDonnees.map(m => m.epargne)
    const meilleurMois = epargnesmois.length > 0 ? Math.max(...epargnesmois) : 0
    const pireMois = epargnesmois.length > 0 ? Math.min(...epargnesmois) : 0
    const moisObjectif = moisAvecDonnees.filter(m => m.epargne >= params.objectifEpargne).length

    // ── 5-year projection ──────────────────────────────────────────────────
    const revMensuelProj = params.revenu1Projection + params.revenu2Projection
    const revAnnuelProj = revMensuelProj * 12
    const chargesAnnuellesFixed = chargesTotales * 12
    const epargnAnnuelleProj = revAnnuelProj - chargesAnnuellesFixed

    let soldeProj = params.soldeDepart
    const currentYear = new Date().getFullYear()
    const projectionStartYear = params.anneeRef
    const projection5ans: FinancesProjection[] = []

    for (let y = projectionStartYear; y < projectionStartYear + 5; y++) {
      let revAnnuel: number
      let epargne: number
      let charges: number
      let verts: number

      if (y === annee && moisAvecDonnees.length > 0) {
        // Use actual data for current year if available
        revAnnuel = revenuAnnuel + (revMensuelProj * (12 - moisAvecDonnees.length))
        charges = chargesTotales * 12
        epargne = revAnnuel - charges
        verts = moisAvecDonnees.filter(m => m.epargne >= params.objectifEpargne).length +
          Math.max(0, 12 - moisAvecDonnees.length)
      } else {
        revAnnuel = revAnnuelProj
        charges = chargesAnnuellesFixed
        epargne = epargnAnnuelleProj
        verts = epargne >= params.objectifEpargne * 12 ? 12 : Math.floor(epargne / params.objectifEpargne)
      }

      if (y === projectionStartYear) {
        soldeProj = params.soldeDepart
      }
      soldeProj += epargne

      projection5ans.push({
        annee: y,
        revenuAnnuel: revAnnuel,
        chargesAnnuelles: charges,
        epargnAnnuelle: epargne,
        tauxEpargne: revAnnuel > 0 ? epargne / revAnnuel : 0,
        soldeFin: soldeProj,
        moisVerts: Math.max(0, Math.min(12, verts)),
      })
    }

    // Chart data
    const soldeChartData = [
      { nom: 'Départ', solde: params.soldeDepart },
      ...moisData.filter(m => m.hasData).map(m => ({ nom: m.nom, solde: m.solde })),
    ]

    const revenusChartData = moisData.map(m => ({
      nom: m.nom,
      revenus: m.revenuTotal,
      charges: m.hasData ? m.chargesTotales : 0,
    }))

    const chargesPieData = charges.map(c => ({ nom: c.nom, montant: c.montant }))

    return {
      chargesFixes, chargesVariables, chargesTotales,
      moisData, moisAvecDonnees,
      revenuAnnuel, chargesAnnuelles, epargnAnnuelle, tauxEpargne,
      soldeFin, couvertureUrgence, fondUrgence,
      meilleurMois, pireMois, moisObjectif,
      projection5ans, soldeChartData, revenusChartData, chargesPieData,
    }
  }, [params, charges, moisEntries, annee])

  if (loading || !params || !dash) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const selectClass = 'rounded-md border border-white/15 bg-[#1a1a1a] text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500'

  return (
    <div className="p-4 sm:p-6 max-w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Plan Épargne 1.1</h1>
            <p className="text-gray-400 mt-0.5 text-sm">{params.nom1} &amp; {params.nom2} · Suivi budgétaire</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Year navigation */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1">
            <button onClick={() => setAnnee(a => a - 1)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white font-semibold text-sm min-w-[40px] text-center">{annee}</span>
            <button onClick={() => setAnnee(a => a + 1)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Admin controls */}
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowCharges(true)} className="gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Charges
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowParams(true)} className="gap-1.5">
                <Settings className="w-3.5 h-3.5" /> Paramètres
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Revenus annuels" value={formatCurrency(dash.revenuAnnuel)} icon={TrendingUp} valueClassName="text-sky-400" />
        <KPICard title="Charges annuelles" value={formatCurrency(dash.chargesAnnuelles)} icon={TrendingDown} valueClassName="text-red-400" />
        <KPICard
          title="Épargne nette"
          value={formatCurrency(dash.epargnAnnuelle)}
          icon={Euro}
          valueClassName={dash.epargnAnnuelle >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
        <KPICard title="Taux d'épargne" value={formatPercent(dash.tauxEpargne)} icon={TrendingUp} valueClassName={dash.tauxEpargne >= 0 ? 'text-emerald-400' : 'text-red-400'} />
        <KPICard title="Couverture urgence" value={`${(dash.couvertureUrgence * 100).toFixed(0)}%`} icon={Shield} valueClassName={dash.couvertureUrgence >= 1 ? 'text-emerald-400' : 'text-amber-400'} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Solde fin d\'année', value: formatCurrency(dash.soldeFin), color: dash.soldeFin >= params.soldeDepart ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Meilleur mois', value: formatCurrency(dash.meilleurMois), color: 'text-emerald-400' },
          { label: 'Pire mois', value: formatCurrency(dash.pireMois), color: dash.pireMois >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: `Mois ≥ objectif (${formatCurrency(params.objectifEpargne)})`, value: `${dash.moisObjectif}/12`, color: 'text-sky-400' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-white/10 bg-[#111] p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider truncate">{item.label}</p>
            <p className={cn('text-xl font-bold mt-1.5', item.color)}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Solde cumulé — {annee}</CardTitle>
          </CardHeader>
          <CardContent>
            {dash.soldeChartData.length > 1 ? (
              <FinancesSoldeChart data={dash.soldeChartData} soldeDepart={params.soldeDepart} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">Aucune donnée pour {annee}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Répartition des charges — {formatCurrency(dash.chargesTotales)}/mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dash.chargesPieData.length > 0 ? (
              <FinancesChargesPie data={dash.chargesPieData} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">Aucune charge configurée</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs charges chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Revenus vs Charges par mois — {annee}</CardTitle>
        </CardHeader>
        <CardContent>
          <FinancesRevenusChart data={dash.revenusChartData} />
        </CardContent>
      </Card>

      {/* Monthly analysis table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Analyse mensuelle — {annee}</CardTitle>
            <span className="text-xs text-gray-500">{dash.moisAvecDonnees.length}/12 mois renseignés</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/2">
                  {['Mois', `Rev. ${params.nom1}`, `Rev. ${params.nom2}`, 'Total', 'Ch. Fixes', 'Ch. Var.', 'Épargne', 'Solde fin', 'Taux', ...(isAdmin ? [''] : [])].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-right first:text-left last:text-center">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dash.moisData.map((m) => (
                  <tr key={m.mois} className={cn('border-b border-white/5 last:border-0 transition-colors', m.hasData ? 'hover:bg-white/3' : 'opacity-40')}>
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {m.hasData && (
                          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', m.epargne >= params.objectifEpargne ? 'bg-emerald-400' : m.epargne >= 0 ? 'bg-amber-400' : 'bg-red-400')} />
                        )}
                        {MOIS_FULL[m.mois - 1]}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300 tabular-nums">{m.hasData ? formatCurrency(m.revenu1) : '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-300 tabular-nums">{m.hasData ? formatCurrency(m.revenu2) : '—'}</td>
                    <td className="px-4 py-3 text-right text-white font-semibold tabular-nums">{m.hasData ? formatCurrency(m.revenuTotal) : '—'}</td>
                    <td className="px-4 py-3 text-right text-gray-400 tabular-nums">{formatCurrency(m.chargesFixes)}</td>
                    <td className="px-4 py-3 text-right text-gray-400 tabular-nums">{formatCurrency(m.chargesVariables)}</td>
                    <td className={cn('px-4 py-3 text-right font-semibold tabular-nums', !m.hasData ? 'text-gray-600' : m.epargne >= params.objectifEpargne ? 'text-emerald-400' : m.epargne >= 0 ? 'text-amber-400' : 'text-red-400')}>
                      {m.hasData ? formatCurrency(m.epargne) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-200 tabular-nums font-medium">{m.hasData ? formatCurrency(m.solde) : '—'}</td>
                    <td className={cn('px-4 py-3 text-right tabular-nums', !m.hasData ? 'text-gray-600' : m.tauxEpargne >= 0.3 ? 'text-emerald-400' : m.tauxEpargne >= 0 ? 'text-amber-400' : 'text-red-400')}>
                      {m.hasData ? formatPercent(m.tauxEpargne) : '—'}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setEditMois(m.mois)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-sky-400 transition-colors" title="Modifier">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5-year projection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projection 5 ans — {params.anneeRef} → {params.anneeRef + 4}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/2">
                  {['Année', 'Revenus annuels', 'Charges', 'Épargne', 'Taux', 'Solde fin année', 'Couverture urgence', 'Mois verts'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap text-right first:text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dash.projection5ans.map((p) => {
                  const couv = dash.fondUrgence > 0 ? p.soldeFin / dash.fondUrgence : 0
                  return (
                    <tr key={p.annee} className={cn('border-b border-white/5 last:border-0 hover:bg-white/3', p.annee === annee && 'bg-sky-500/5')}>
                      <td className="px-4 py-3 font-bold text-white">
                        {p.annee}
                        {p.annee === annee && <span className="ml-2 text-[10px] text-sky-400 border border-sky-500/30 px-1.5 py-0.5 rounded-full">En cours</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-sky-400 tabular-nums font-medium">{formatCurrency(p.revenuAnnuel)}</td>
                      <td className="px-4 py-3 text-right text-red-400/80 tabular-nums">{formatCurrency(p.chargesAnnuelles)}</td>
                      <td className={cn('px-4 py-3 text-right font-semibold tabular-nums', p.epargnAnnuelle >= 0 ? 'text-emerald-400' : 'text-red-400')}>{formatCurrency(p.epargnAnnuelle)}</td>
                      <td className={cn('px-4 py-3 text-right tabular-nums', p.tauxEpargne >= 0.3 ? 'text-emerald-400' : 'text-amber-400')}>{formatPercent(p.tauxEpargne)}</td>
                      <td className="px-4 py-3 text-right text-white font-bold tabular-nums">{formatCurrency(p.soldeFin)}</td>
                      <td className={cn('px-4 py-3 text-right tabular-nums', couv >= 1 ? 'text-emerald-400' : 'text-amber-400')}>{(couv * 100).toFixed(0)}%</td>
                      <td className="px-4 py-3 text-right">
                        <span className="flex items-center justify-end gap-1">
                          {Array.from({ length: 12 }, (_, i) => (
                            <span key={i} className={cn('w-2 h-2 rounded-full', i < p.moisVerts ? 'bg-emerald-400' : 'bg-white/10')} />
                          ))}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charges breakdown info */}
      <div className="grid sm:grid-cols-2 gap-4">
        {(['fixe', 'variable'] as const).map(type => {
          const list = charges.filter(c => c.type === type)
          const total = list.reduce((s, c) => s + c.montant, 0)
          return (
            <div key={type} className="rounded-xl border border-white/10 bg-[#111] p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Charges {type === 'fixe' ? 'fixes' : 'variables'}</p>
                <span className="text-sm font-bold text-white">{formatCurrency(total)}/mois</span>
              </div>
              <div className="space-y-2">
                {list.map(c => (
                  <div key={c.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{c.nom}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-300 tabular-nums">{formatCurrency(c.montant)}</span>
                      <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-sky-500/60" style={{ width: `${total > 0 ? (c.montant / total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals */}
      {editMois !== null && (
        <MoisModal
          open={editMois !== null}
          onClose={() => setEditMois(null)}
          mois={editMois}
          annee={annee}
          nom1={params.nom1}
          nom2={params.nom2}
          chargesTotales={dash.chargesTotales}
          existingEntry={moisEntries.find(m => m.mois === editMois) ?? null}
          onSuccess={fetchData}
        />
      )}
      <ChargesModal open={showCharges} onClose={() => setShowCharges(false)} charges={charges} onSuccess={fetchData} />
      <ParamsModal open={showParams} onClose={() => setShowParams(false)} params={params} onSuccess={fetchData} />
    </div>
  )
}
