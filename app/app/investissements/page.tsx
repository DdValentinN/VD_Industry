'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  TrendingUp, TrendingDown, RefreshCw, Plus, Trash2, X,
  ChevronUp, ChevronDown, BarChart3, Calendar, Info,
  ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import type { PortfolioETF, InvestTransaction, InvestPlan, HistoryPoint } from '@/types'

const RANGES = [
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1A', value: '1y' },
  { label: '3A', value: '3y' },
  { label: 'MAX', value: 'max' },
]

// ─── Add Transaction Modal ────────────────────────────────────────────────────

interface TxModalProps {
  open: boolean
  onClose: () => void
  etfs: PortfolioETF[]
  onSuccess: () => void
}

function TxModal({ open, onClose, etfs, onSuccess }: TxModalProps) {
  const [etfId, setEtfId] = useState('')
  const [type, setType] = useState<'achat' | 'vente'>('achat')
  const [quantite, setQuantite] = useState('')
  const [prix, setPrix] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (etfs.length > 0 && !etfId) setEtfId(String(etfs[0].id))
    // Prefill prix with current price if available
  }, [open, etfs, etfId])

  useEffect(() => {
    if (etfId && etfs.length > 0) {
      const etf = etfs.find(e => String(e.id) === etfId)
      if (etf?.quote?.currentPrice) setPrix(etf.quote.currentPrice.toFixed(4))
    }
  }, [etfId, etfs])

  const total = (parseFloat(quantite) || 0) * (parseFloat(prix) || 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/invest/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etfId, type, quantite, prix, date, notes: notes || null }),
      })
      if (!res.ok) throw new Error()
      toast.success('Transaction enregistrée')
      setQuantite(''); setPrix(''); setNotes(''); setType('achat')
      onSuccess()
      onClose()
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const selectClass = 'w-full rounded-md border border-white/20 bg-[#1a1a1a] text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500'

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm bg-[#111] border-white/10">
        <DialogHeader>
          <DialogTitle>Nouvelle transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>ETF</Label>
            <select value={etfId} onChange={(e) => setEtfId(e.target.value)} className={selectClass}>
              {etfs.map(e => <option key={e.id} value={e.id}>{e.nomCourt}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <select value={type} onChange={(e) => setType(e.target.value as 'achat' | 'vente')} className={selectClass}>
                <option value="achat">Achat</option>
                <option value="vente">Vente</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Quantité (parts)</Label>
              <Input type="number" step="1" min="0.001" value={quantite} onChange={(e) => setQuantite(e.target.value)} placeholder="ex: 10" required />
            </div>
            <div className="space-y-1">
              <Label>Prix unitaire (€)</Label>
              <Input type="number" step="0.0001" min="0" value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="ex: 6.18" required />
            </div>
          </div>
          {total > 0 && (
            <div className="rounded-xl bg-white/3 border border-white/10 p-3 flex justify-between text-sm">
              <span className="text-gray-400">Total {type}</span>
              <span className="font-bold text-white">{formatCurrency(total)}</span>
            </div>
          )}
          <div className="space-y-1">
            <Label>Notes (optionnel)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ex: DCA semaine 1" />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={saving}>Annuler</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'En cours...' : 'Enregistrer'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Price Chart ──────────────────────────────────────────────────────────────

function PriceChart({ data, couleur, prixMoyen }: { data: HistoryPoint[]; couleur: string; prixMoyen: number }) {
  if (data.length === 0) {
    return <div className="h-[280px] flex items-center justify-center text-gray-500 text-sm">Chargement des données...</div>
  }
  const first = data[0]?.prix ?? 0
  const last = data[data.length - 1]?.prix ?? 0
  const isUp = last >= first

  const gradId = `grad-${couleur.replace('#', '')}`
  const strokeColor = isUp ? '#10b981' : '#ef4444'
  const gradColor = isUp ? '#10b981' : '#ef4444'

  const fmt = (v: number) => `${v.toFixed(2)}€`

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={gradColor} stopOpacity={0.25} />
            <stop offset="95%" stopColor={gradColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="rgba(255,255,255,0.2)"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
          axisLine={false} tickLine={false}
          tickFormatter={(d: string) => {
            const dt = new Date(d)
            return `${dt.toLocaleString('fr', { month: 'short' })} ${dt.getFullYear().toString().slice(2)}`
          }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="rgba(255,255,255,0.2)"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
          axisLine={false} tickLine={false}
          tickFormatter={fmt}
          width={54}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: 12 }}
          formatter={(v: number) => [fmt(v), 'Prix']}
          labelFormatter={(l: string) => new Date(l).toLocaleDateString('fr')}
        />
        {prixMoyen > 0 && (
          <ReferenceLine y={prixMoyen} stroke="rgba(245,158,11,0.5)" strokeDasharray="4 4"
            label={{ value: `PMA ${fmt(prixMoyen)}`, position: 'insideTopRight', fill: 'rgba(245,158,11,0.8)', fontSize: 10 }}
          />
        )}
        <Area type="monotone" dataKey="prix" stroke={strokeColor} strokeWidth={2} fill={`url(#${gradId})`} dot={false} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── ETF Card ─────────────────────────────────────────────────────────────────

function ETFCard({ etf, onClick, selected }: { etf: PortfolioETF; onClick: () => void; selected: boolean }) {
  const hasQuote = etf.quote !== null
  const price = etf.quote?.currentPrice ?? etf.prixMoyen
  const change = etf.quote?.changePercent ?? 0
  const isUp = change >= 0

  return (
    <button
      onClick={onClick}
      className={cn(
        'text-left rounded-2xl border p-5 transition-all duration-200 w-full',
        selected
          ? 'border-emerald-500/40 bg-emerald-500/8 shadow-lg shadow-emerald-500/10'
          : 'border-white/10 bg-[#111] hover:border-white/20 hover:bg-white/3',
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: etf.couleur }} />
          <div>
            <p className="text-white font-semibold text-sm leading-none">{etf.nomCourt}</p>
            <p className="text-gray-600 text-[10px] mt-0.5">{etf.isin}</p>
          </div>
        </div>
        {hasQuote && (
          <span className={cn('flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
            isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
          )}>
            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change * 100).toFixed(2)}%
          </span>
        )}
      </div>

      <div className="mb-4">
        <p className="text-2xl font-black text-white tabular-nums">{formatCurrency(price)}</p>
        {hasQuote && (
          <p className={cn('text-xs mt-0.5 tabular-nums', isUp ? 'text-emerald-400' : 'text-red-400')}>
            {isUp ? '+' : ''}{formatCurrency(etf.quote!.change)} aujourd&apos;hui
          </p>
        )}
        {!hasQuote && <p className="text-xs text-gray-600 mt-0.5">Prix d&apos;achat moyen</p>}
      </div>

      <div className="border-t border-white/8 pt-3 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Quantité</span>
          <span className="text-gray-300 font-medium">{etf.quantite} parts</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Valeur</span>
          <span className="text-white font-semibold">{formatCurrency(etf.valeurActuelle)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Plus-value</span>
          <span className={cn('font-semibold', etf.plusValue >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {etf.plusValue >= 0 ? '+' : ''}{formatCurrency(etf.plusValue)}
            {' '}({etf.plusValue >= 0 ? '+' : ''}{(etf.performance * 100).toFixed(2)}%)
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── Plan Display ─────────────────────────────────────────────────────────────

function PlanCard({ plan, portfolio }: { plan: InvestPlan; portfolio: PortfolioETF[] }) {
  const msci = portfolio.find(e => e.nomCourt.toLowerCase().includes('msci') || e.nomCourt.toLowerCase().includes('world'))
  const stoxx = portfolio.find(e => e.nomCourt.toLowerCase().includes('stoxx') || e.nomCourt.toLowerCase().includes('europe'))
  const emerg = portfolio.find(e => e.nomCourt.toLowerCase().includes('emerg') || e.nomCourt.toLowerCase().includes('pea emerg'))

  const priceM = msci?.quote?.currentPrice ?? msci?.prixMoyen ?? 0
  const priceS = stoxx?.quote?.currentPrice ?? stoxx?.prixMoyen ?? 0
  const priceE = emerg?.quote?.currentPrice ?? emerg?.prixMoyen ?? 0

  function weekPlan(week: number) {
    const montant = [plan.montantS1, plan.montantS2, plan.montantS3, plan.montantS4][week - 1]
    if (week < 4) {
      const parts = priceM > 0 ? Math.floor(montant / priceM) : '?'
      const reste = priceM > 0 ? (montant - (typeof parts === 'number' ? parts * priceM : 0)).toFixed(2) : '—'
      return { montant, items: [`${parts} parts MSCI World`, `(reste ~${reste}€)`] }
    }
    // Week 4
    const costEmerg = plan.partsEmergS4 * priceE
    const costStorxx = plan.partsStorxxS4 * priceS
    const remaining = montant - costEmerg - costStorxx
    const partsM = priceM > 0 && remaining > 0 ? Math.floor(remaining / priceM) : '?'
    return {
      montant,
      items: [
        `${plan.partsEmergS4} parts PEA Emergents`,
        `${plan.partsStorxxS4} parts STOXX 600`,
        `${partsM} parts MSCI World (reste)`,
      ],
    }
  }

  const weeks = [1, 2, 3, 4]
  const current = ((plan.cycleWeek - 1) % 4) + 1
  const currentPlan = weekPlan(current)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Plan d&apos;investissement PEA</CardTitle>
          <span className="text-xs text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            Semaine {current}/4
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {weeks.map((w) => {
            const p = weekPlan(w)
            const isCurrent = w === current
            return (
              <div key={w} className={cn('rounded-xl p-3 text-center transition-all', isCurrent ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-white/3 border border-white/8')}>
                <p className={cn('text-[10px] font-semibold uppercase tracking-wider mb-1', isCurrent ? 'text-emerald-400' : 'text-gray-600')}>S{w}</p>
                <p className={cn('text-sm font-bold', isCurrent ? 'text-white' : 'text-gray-500')}>{p.montant}€</p>
              </div>
            )
          })}
        </div>

        {/* Current week details */}
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-3">
            Cette semaine — {currentPlan.montant}€ à investir
          </p>
          <div className="space-y-1.5">
            {currentPlan.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvestissementsPage() {
  const { isAdmin } = useAuth()
  const [portfolio, setPortfolio] = useState<PortfolioETF[]>([])
  const [plan, setPlan] = useState<InvestPlan | null>(null)
  const [transactions, setTransactions] = useState<InvestTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Chart state
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [range, setRange] = useState('1y')
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [histLoading, setHistLoading] = useState(false)

  // Modals
  const [txModal, setTxModal] = useState(false)

  const fetchPortfolio = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [pRes, planRes, txRes] = await Promise.all([
        fetch('/api/invest/portfolio'),
        fetch('/api/invest/plan'),
        fetch('/api/invest/transactions'),
      ])
      const [pData, planData, txData] = await Promise.all([pRes.json(), planRes.json(), txRes.json()])
      setPortfolio(pData.data ?? [])
      setPlan(planData.data ?? null)
      setTransactions(txData.data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchPortfolio() }, [fetchPortfolio])

  const fetchHistory = useCallback(async () => {
    const etf = portfolio[selectedIdx]
    if (!etf?.ticker) return
    setHistLoading(true)
    try {
      const res = await fetch(`/api/invest/history?ticker=${encodeURIComponent(etf.ticker)}&range=${range}`)
      const data = await res.json()
      setHistory(data.data ?? [])
    } catch { setHistory([]) } finally { setHistLoading(false) }
  }, [portfolio, selectedIdx, range])

  useEffect(() => {
    if (portfolio.length > 0) fetchHistory()
  }, [fetchHistory])

  async function deleteTx(id: number) {
    if (!confirm('Supprimer cette transaction ?')) return
    try {
      await fetch(`/api/invest/transactions/${id}`, { method: 'DELETE' })
      toast.success('Transaction supprimée')
      fetchPortfolio(true)
    } catch { toast.error('Erreur') }
  }

  async function advanceCycleWeek() {
    if (!plan) return
    const next = (plan.cycleWeek % 4) + 1
    try {
      await fetch('/api/invest/plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...plan, cycleWeek: next }),
      })
      setPlan(p => p ? { ...p, cycleWeek: next } : p)
      toast.success(`Semaine ${next} du cycle`)
    } catch { toast.error('Erreur') }
  }

  const totaux = useMemo(() => {
    const valeurTotale = portfolio.reduce((s, e) => s + e.valeurActuelle, 0)
    const investi = portfolio.reduce((s, e) => s + e.valeurInvestie, 0)
    const plusValue = valeurTotale - investi
    const perf = investi > 0 ? plusValue / investi : 0
    return { valeurTotale, investi, plusValue, perf }
  }, [portfolio])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Récupération des cours en temps réel...</p>
      </div>
    )
  }

  const selectedETF = portfolio[selectedIdx]

  return (
    <div className="p-4 sm:p-6 max-w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Mon PEA</h1>
            <p className="text-gray-400 mt-0.5 text-sm">Tracker d&apos;investissements · Données en temps réel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPortfolio(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-xs transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            Actualiser
          </button>
          {isAdmin && (
            <Button size="sm" onClick={() => setTxModal(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Transaction
            </Button>
          )}
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Valeur du PEA', value: formatCurrency(totaux.valeurTotale), color: 'text-white', big: true },
          { label: 'Total investi', value: formatCurrency(totaux.investi), color: 'text-gray-300' },
          {
            label: 'Plus-value latente',
            value: (totaux.plusValue >= 0 ? '+' : '') + formatCurrency(totaux.plusValue),
            color: totaux.plusValue >= 0 ? 'text-emerald-400' : 'text-red-400',
          },
          {
            label: 'Performance',
            value: (totaux.perf >= 0 ? '+' : '') + (totaux.perf * 100).toFixed(2) + '%',
            color: totaux.perf >= 0 ? 'text-emerald-400' : 'text-red-400',
          },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-white/10 bg-[#111] p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{k.label}</p>
            <p className={cn('text-2xl font-black mt-2 tabular-nums', k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* ETF Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {portfolio.map((etf, i) => (
          <ETFCard
            key={etf.id}
            etf={etf}
            selected={selectedIdx === i}
            onClick={() => setSelectedIdx(i)}
          />
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {portfolio.map((etf, i) => (
                <button
                  key={etf.id}
                  onClick={() => setSelectedIdx(i)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    selectedIdx === i ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: etf.couleur }} />
                  {etf.nomCourt}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {RANGES.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                    range === r.value ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-600 hover:text-gray-300'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          {selectedETF && (
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-black text-white tabular-nums">
                {formatCurrency(selectedETF.quote?.currentPrice ?? selectedETF.prixMoyen)}
              </span>
              {selectedETF.quote && (
                <span className={cn('text-sm font-semibold', selectedETF.quote.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {selectedETF.quote.changePercent >= 0 ? '+' : ''}{(selectedETF.quote.changePercent * 100).toFixed(2)}%
                  {' '}({selectedETF.quote.changePercent >= 0 ? '+' : ''}{formatCurrency(selectedETF.quote.change)})
                </span>
              )}
              {!selectedETF.ticker && (
                <span className="text-xs text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Ticker en cours de résolution...
                </span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-2">
          {histLoading ? (
            <div className="h-[280px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <PriceChart
              data={history}
              couleur={selectedETF?.couleur ?? '#10b981'}
              prixMoyen={selectedETF?.prixMoyen ?? 0}
            />
          )}
          {selectedETF && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
              <span className="inline-block w-3 h-px border-t border-dashed border-amber-500/60" />
              <span>Ligne orange = prix moyen d&apos;achat ({formatCurrency(selectedETF.prixMoyen)})</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan + Transactions row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {plan && <PlanCard plan={plan} portfolio={portfolio} />}

        {/* Transactions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Historique des transactions</CardTitle>
              {isAdmin && plan && (
                <button
                  onClick={advanceCycleWeek}
                  className="text-xs text-sky-400 border border-sky-500/30 px-2.5 py-1 rounded-full hover:bg-sky-500/10 transition-colors"
                >
                  Semaine suivante →
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[320px] overflow-y-auto overflow-x-auto">
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">Aucune transaction</p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/8 bg-white/2">
                      <th className="px-4 py-2 text-left text-gray-500">Date</th>
                      <th className="px-4 py-2 text-left text-gray-500">ETF</th>
                      <th className="px-4 py-2 text-right text-gray-500">Qté</th>
                      <th className="px-4 py-2 text-right text-gray-500">Prix</th>
                      <th className="px-4 py-2 text-right text-gray-500">Total</th>
                      {isAdmin && <th className="px-4 py-2" />}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                        <td className="px-4 py-2.5 text-gray-400">{new Date(tx.date).toLocaleDateString('fr')}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', tx.type === 'achat' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>
                              {tx.type === 'achat' ? 'A' : 'V'}
                            </span>
                            <span className="text-white">{tx.etf?.nomCourt ?? '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-300 tabular-nums">{tx.quantite}</td>
                        <td className="px-4 py-2.5 text-right text-gray-300 tabular-nums">{formatCurrency(tx.prix)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-white tabular-nums">{formatCurrency(tx.quantite * tx.prix)}</td>
                        {isAdmin && (
                          <td className="px-4 py-2.5 text-center">
                            <button onClick={() => deleteTx(tx.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction modal */}
      <TxModal open={txModal} onClose={() => setTxModal(false)} etfs={portfolio} onSuccess={() => fetchPortfolio(true)} />
    </div>
  )
}
