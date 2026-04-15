'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  TrendingUp, TrendingDown, RefreshCw, Plus, Trash2,
  BarChart3, Calendar, ArrowUpRight, ArrowDownRight,
  Wallet, PieChart as PieIcon, List, Target,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
  PieChart, Pie, Cell,
} from 'recharts'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import type { PortfolioETF, InvestTransaction, InvestPlan, HistoryPoint } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const RANGES = [
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1A', value: '1y' },
  { label: '3A', value: '3y' },
  { label: 'MAX', value: 'max' },
]

type Tab = 'overview' | 'positions' | 'transactions' | 'plan'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',      label: 'Vue générale',  icon: PieIcon },
  { id: 'positions',     label: 'Positions',     icon: BarChart3 },
  { id: 'transactions',  label: 'Transactions',  icon: List },
  { id: 'plan',          label: 'Plan DCA',      icon: Target },
]

// ─── Add Transaction Modal ────────────────────────────────────────────────────

interface TxModalProps {
  open: boolean
  onClose: () => void
  etfs: PortfolioETF[]
  onSuccess: () => void
}

function TxModal({ open, onClose, etfs, onSuccess }: TxModalProps) {
  const [etfId, setEtfId]     = useState('')
  const [type, setType]       = useState<'achat' | 'vente'>('achat')
  const [quantite, setQuantite] = useState('')
  const [prix, setPrix]       = useState('')
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes]     = useState('')
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!open) return
    if (etfs.length > 0 && !etfId) setEtfId(String(etfs[0].id))
  }, [open, etfs, etfId])

  useEffect(() => {
    if (!etfId || etfs.length === 0) return
    const etf = etfs.find(e => String(e.id) === etfId)
    if (etf?.quote?.currentPrice) setPrix(etf.quote.currentPrice.toFixed(4))
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

  const sel = 'w-full rounded-md border border-white/20 bg-[#1a1a1a] text-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500'

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm bg-[#111] border-white/10">
        <DialogHeader>
          <DialogTitle>Nouvelle transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>ETF</Label>
            <select value={etfId} onChange={(e) => setEtfId(e.target.value)} className={sel}>
              {etfs.map(e => <option key={e.id} value={e.id}>{e.nomCourt}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <select value={type} onChange={(e) => setType(e.target.value as 'achat' | 'vente')} className={sel}>
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
              <Input type="number" step="0.001" min="0.001" value={quantite} onChange={(e) => setQuantite(e.target.value)} placeholder="ex: 10" required />
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

function PriceChart({ data, prixMoyen, isUp }: { data: HistoryPoint[]; prixMoyen: number; isUp: boolean }) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center gap-2 text-gray-600">
        <BarChart3 className="w-8 h-8 opacity-30" />
        <p className="text-sm">Données de cours indisponibles</p>
        <p className="text-xs">Yahoo Finance peut être inaccessible depuis le serveur</p>
      </div>
    )
  }

  const strokeColor = isUp ? '#10b981' : '#ef4444'
  const gradId = `grad-${isUp ? 'up' : 'down'}`
  const fmt = (v: number) => `${v.toFixed(2)}€`

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={strokeColor} stopOpacity={0.2} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="rgba(255,255,255,0.15)"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
          axisLine={false} tickLine={false}
          tickFormatter={(d: string) => {
            const dt = new Date(d)
            return `${dt.toLocaleString('fr', { month: 'short' })} ${dt.getFullYear().toString().slice(2)}`
          }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="rgba(255,255,255,0.15)"
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
          axisLine={false} tickLine={false}
          tickFormatter={fmt}
          width={56}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: 12 }}
          formatter={(v: number) => [fmt(v), 'Cours']}
          labelFormatter={(l: string) => new Date(l).toLocaleDateString('fr')}
        />
        {prixMoyen > 0 && (
          <ReferenceLine y={prixMoyen} stroke="rgba(245,158,11,0.6)" strokeDasharray="4 4"
            label={{ value: `PMA ${fmt(prixMoyen)}`, position: 'insideTopRight', fill: 'rgba(245,158,11,0.85)', fontSize: 10 }}
          />
        )}
        <Area type="monotone" dataKey="prix" stroke={strokeColor} strokeWidth={2} fill={`url(#${gradId})`} dot={false} activeDot={{ r: 4, fill: strokeColor }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Custom Donut label ───────────────────────────────────────────────────────

function DonutLabel({ cx, cy, total }: { cx: number; cy: number; total: number }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-8" fontSize="13" fill="rgba(255,255,255,0.45)">Total</tspan>
      <tspan x={cx} dy="22" fontSize="17" fontWeight="800" fill="#fff">{formatCurrency(total)}</tspan>
    </text>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ portfolio, totaux }: { portfolio: PortfolioETF[]; totaux: Totaux }) {
  const isEmpty = totaux.valeurTotale === 0

  // When all values are 0, give equal weight so the donut renders
  const alloc = portfolio.map(e => ({
    name:  e.nomCourt,
    value: isEmpty ? 1 : e.valeurActuelle,
    color: e.couleur,
  }))

  return (
    <div className="space-y-5">
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Valeur du PEA', value: formatCurrency(totaux.valeurTotale), color: 'text-white', icon: Wallet, sub: 'Cours en temps réel' },
          { label: 'Total investi', value: formatCurrency(totaux.investi), color: 'text-gray-200', icon: TrendingUp, sub: 'Capital placé' },
          {
            label: 'Plus-value latente',
            value: (totaux.plusValue >= 0 ? '+' : '') + formatCurrency(totaux.plusValue),
            color: totaux.plusValue >= 0 ? 'text-emerald-400' : 'text-red-400',
            icon: totaux.plusValue >= 0 ? TrendingUp : TrendingDown,
            sub: 'Non réalisée',
          },
          {
            label: 'Performance',
            value: (totaux.perf >= 0 ? '+' : '') + (totaux.perf * 100).toFixed(2) + '%',
            color: totaux.perf >= 0 ? 'text-emerald-400' : 'text-red-400',
            icon: totaux.perf >= 0 ? ArrowUpRight : ArrowDownRight,
            sub: 'Depuis le premier achat',
          },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-white/10 bg-[#111] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{k.label}</p>
              <k.icon className={cn('w-4 h-4 opacity-50', k.color)} />
            </div>
            <p className={cn('text-2xl font-black tabular-nums', k.color)}>{k.value}</p>
            <p className="text-xs text-gray-700 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Donut + allocation */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Donut chart */}
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Répartition</p>
          <div className="flex items-center justify-center">
            <PieChart width={240} height={240}>
              <Pie
                data={alloc.length > 0 ? alloc : [{ name: 'Vide', value: 1, color: 'rgba(255,255,255,0.06)' }]}
                cx={120} cy={120}
                innerRadius={72} outerRadius={100}
                paddingAngle={isEmpty ? 0 : 3}
                dataKey="value"
                label={false}
                strokeWidth={0}
              >
                {(alloc.length > 0 ? alloc : [{ name: 'Vide', value: 1, color: 'rgba(255,255,255,0.06)' }]).map((entry, i) => (
                  <Cell key={i} fill={isEmpty ? 'rgba(255,255,255,0.08)' : entry.color} stroke="transparent" />
                ))}
              </Pie>
              {isEmpty
                ? (
                  <text x={120} y={120} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={120} dy="-8" fontSize="13" fill="rgba(255,255,255,0.3)">Portfolio</tspan>
                    <tspan x={120} dy="22" fontSize="15" fontWeight="700" fill="rgba(255,255,255,0.4)">Vide</tspan>
                  </text>
                ) : (
                  <DonutLabel cx={120} cy={120} total={totaux.valeurTotale} />
                )
              }
            </PieChart>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-1">
            {alloc.map((e) => (
              <div key={e.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                <span className="text-xs text-gray-400">{e.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation bars */}
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5 flex flex-col justify-between">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Détail du portefeuille</p>
          {isEmpty && (
            <p className="text-xs text-gray-600 mb-3 italic">Aucune position — ajoute ta première transaction via le bouton "+ Transaction"</p>
          )}
          <div className="space-y-4">
            {portfolio
              .slice()
              .sort((a, b) => b.valeurActuelle - a.valeurActuelle)
              .map((etf) => {
                const pct = totaux.valeurTotale > 0 ? (etf.valeurActuelle / totaux.valeurTotale) * 100 : 0
                const isUp = etf.performance >= 0
                return (
                  <div key={etf.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: etf.couleur }} />
                        <span className="text-sm text-gray-200 font-medium">{etf.nomCourt}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-400 tabular-nums">{formatCurrency(etf.valeurActuelle)}</span>
                        {!isEmpty && (
                          <span className={cn('text-xs font-semibold w-14 text-right tabular-nums', isUp ? 'text-emerald-400' : 'text-red-400')}>
                            {isUp ? '+' : ''}{(etf.performance * 100).toFixed(2)}%
                          </span>
                        )}
                        <span className="text-gray-600 w-10 text-right tabular-nums">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: etf.couleur }} />
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Bottom totals */}
          <div className="mt-5 pt-4 border-t border-white/8 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600">Total investi</p>
              <p className="text-sm font-bold text-white tabular-nums mt-0.5">{formatCurrency(totaux.investi)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Gain / Perte</p>
              <p className={cn('text-sm font-bold tabular-nums mt-0.5', totaux.plusValue >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {totaux.plusValue >= 0 ? '+' : ''}{formatCurrency(totaux.plusValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market status row */}
      <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Performance journalière</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {portfolio.map((etf) => {
            const hasQ = etf.quote !== null
            const dayChange = etf.quote?.changePercent ?? 0
            const dayVal   = etf.quote?.change ?? 0
            const isUp = dayChange >= 0
            return (
              <div key={etf.id} className="rounded-xl border border-white/8 bg-white/2 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: etf.couleur }} />
                    <span className="text-sm font-semibold text-white">{etf.nomCourt}</span>
                  </div>
                  {hasQ ? (
                    <span className={cn('flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full', isUp ? 'bg-emerald-500/12 text-emerald-400' : 'bg-red-500/12 text-red-400')}>
                      {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(dayChange * 100).toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-500/70 border border-amber-500/25 px-2 py-0.5 rounded-full">Hors ligne</span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Cours actuel</span>
                    <span className="text-white font-medium tabular-nums">{formatCurrency(etf.quote?.currentPrice ?? etf.prixMoyen)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Variation jour</span>
                    <span className={cn('font-medium tabular-nums', isUp ? 'text-emerald-400' : 'text-red-400')}>
                      {hasQ ? `${isUp ? '+' : ''}${formatCurrency(dayVal)}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Marché</span>
                    <span className={cn('font-medium', etf.quote?.marketState === 'REGULAR' ? 'text-emerald-400' : 'text-gray-500')}>
                      {etf.quote?.marketState === 'REGULAR' ? 'Ouvert' : etf.quote?.marketState === 'CLOSED' ? 'Fermé' : hasQ ? etf.quote!.marketState : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Positions Tab ────────────────────────────────────────────────────────────

function PositionsTab({
  portfolio, selectedIdx, setSelectedIdx, range, setRange, history, histLoading,
}: {
  portfolio: PortfolioETF[]
  selectedIdx: number
  setSelectedIdx: (i: number) => void
  range: string
  setRange: (r: string) => void
  history: HistoryPoint[]
  histLoading: boolean
}) {
  const etf = portfolio[selectedIdx]
  if (!etf) return null

  const isUp = (etf.quote?.changePercent ?? 0) >= 0
  const perfUp = etf.performance >= 0

  return (
    <div className="space-y-5">
      {/* ETF selector */}
      <div className="flex flex-wrap gap-2">
        {portfolio.map((e, i) => (
          <button
            key={e.id}
            onClick={() => setSelectedIdx(i)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150',
              selectedIdx === i
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-white/10 bg-[#111] text-gray-400 hover:text-white hover:border-white/20',
            )}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.couleur }} />
            {e.nomCourt}
          </button>
        ))}
      </div>

      {/* ETF hero */}
      <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: etf.couleur }} />
              <p className="text-lg font-bold text-white">{etf.nom}</p>
            </div>
            <p className="text-xs text-gray-600">{etf.isin} · {etf.ticker ?? 'ticker non résolu'}</p>
          </div>
          {etf.quote && (
            <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold', isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20')}>
              {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs((etf.quote.changePercent ?? 0) * 100).toFixed(2)}%
              <span className="text-xs font-medium opacity-70">aujourd&apos;hui</span>
            </div>
          )}
        </div>

        {/* Price + metrics grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Cours actuel', value: formatCurrency(etf.quote?.currentPrice ?? etf.prixMoyen), color: 'text-white', big: true },
            { label: 'Prix moyen d\'achat', value: formatCurrency(etf.prixMoyen), color: 'text-amber-400' },
            { label: 'Quantité', value: `${etf.quantite} parts`, color: 'text-gray-200' },
            { label: 'Valeur investie', value: formatCurrency(etf.valeurInvestie), color: 'text-gray-200' },
            { label: 'Valeur actuelle', value: formatCurrency(etf.valeurActuelle), color: 'text-white' },
            { label: 'Plus-value', value: (etf.plusValue >= 0 ? '+' : '') + formatCurrency(etf.plusValue), color: perfUp ? 'text-emerald-400' : 'text-red-400' },
            { label: 'Performance', value: (etf.performance >= 0 ? '+' : '') + (etf.performance * 100).toFixed(2) + '%', color: perfUp ? 'text-emerald-400' : 'text-red-400' },
            { label: 'Haut / Bas du jour', value: etf.quote ? `${formatCurrency(etf.quote.dayHigh)} / ${formatCurrency(etf.quote.dayLow)}` : '—', color: 'text-gray-400' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-white/3 border border-white/8 p-3">
              <p className="text-xs text-gray-500 mb-1">{m.label}</p>
              <p className={cn('font-bold tabular-nums', m.big ? 'text-xl' : 'text-sm', m.color)}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div>
          {/* Range selector */}
          <div className="flex items-center gap-1 mb-3">
            {RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
                  range === r.value ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-600 hover:text-gray-300 hover:bg-white/5',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          {histLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <PriceChart data={history} prixMoyen={etf.prixMoyen} isUp={isUp} />
          )}
          {etf.prixMoyen > 0 && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
              <span className="inline-block w-4 border-t border-dashed border-amber-500/60" />
              Ligne dorée = Prix moyen d&apos;achat ({formatCurrency(etf.prixMoyen)})
            </div>
          )}
        </div>
      </div>

      {/* Per-ETF transaction mini-history */}
      {etf.transactions && etf.transactions.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Historique — {etf.nomCourt}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="py-2 pr-4 text-left text-gray-500">Date</th>
                  <th className="py-2 pr-4 text-left text-gray-500">Type</th>
                  <th className="py-2 pr-4 text-right text-gray-500">Qté</th>
                  <th className="py-2 pr-4 text-right text-gray-500">Prix</th>
                  <th className="py-2 text-right text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {etf.transactions.slice().reverse().map((tx) => (
                  <tr key={tx.id} className="border-b border-white/5 last:border-0">
                    <td className="py-2.5 pr-4 text-gray-400">{new Date(tx.date).toLocaleDateString('fr')}</td>
                    <td className="py-2.5 pr-4">
                      <span className={cn('px-1.5 py-0.5 rounded font-semibold', tx.type === 'achat' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>
                        {tx.type === 'achat' ? 'Achat' : 'Vente'}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-gray-300 tabular-nums">{tx.quantite}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-300 tabular-nums">{formatCurrency(tx.prix)}</td>
                    <td className="py-2.5 text-right font-semibold text-white tabular-nums">{formatCurrency(tx.quantite * tx.prix)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────

function TransactionsTab({ transactions, isAdmin, onDelete }: { transactions: InvestTransaction[]; isAdmin: boolean; onDelete: (id: number) => void }) {
  const stats = useMemo(() => {
    const achats = transactions.filter(t => t.type === 'achat')
    const ventes = transactions.filter(t => t.type === 'vente')
    const totalAchats = achats.reduce((s, t) => s + t.quantite * t.prix, 0)
    const totalVentes = ventes.reduce((s, t) => s + t.quantite * t.prix, 0)
    return { nbAchats: achats.length, nbVentes: ventes.length, totalAchats, totalVentes }
  }, [transactions])

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Achats', value: stats.nbAchats.toString(), sub: formatCurrency(stats.totalAchats), color: 'text-emerald-400' },
          { label: 'Ventes', value: stats.nbVentes.toString(), sub: formatCurrency(stats.totalVentes), color: 'text-red-400' },
          { label: 'Capital déployé', value: formatCurrency(stats.totalAchats), sub: `${stats.nbAchats} ordres`, color: 'text-white' },
          { label: 'Réalisé', value: formatCurrency(stats.totalVentes), sub: `${stats.nbVentes} ordres`, color: 'text-white' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-[#111] p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className={cn('text-xl font-black mt-2 tabular-nums', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-600 mt-0.5 tabular-nums">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-[#111] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <p className="text-sm font-semibold text-white">Toutes les transactions</p>
        </div>
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-12">Aucune transaction enregistrée</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/8 bg-white/2">
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Date</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">ETF</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Type</th>
                  <th className="px-5 py-3 text-right text-gray-500 font-medium">Quantité</th>
                  <th className="px-5 py-3 text-right text-gray-500 font-medium">Prix unit.</th>
                  <th className="px-5 py-3 text-right text-gray-500 font-medium">Total</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Notes</th>
                  {isAdmin && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody>
                {transactions.slice().reverse().map(tx => (
                  <tr key={tx.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{new Date(tx.date).toLocaleDateString('fr', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                    <td className="px-5 py-3 text-white font-medium">{tx.etf?.nomCourt ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide', tx.type === 'achat' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-300 tabular-nums">{tx.quantite}</td>
                    <td className="px-5 py-3 text-right text-gray-300 tabular-nums">{formatCurrency(tx.prix)}</td>
                    <td className="px-5 py-3 text-right font-bold text-white tabular-nums">{formatCurrency(tx.quantite * tx.prix)}</td>
                    <td className="px-5 py-3 text-gray-600 max-w-[120px] truncate">{tx.notes ?? '—'}</td>
                    {isAdmin && (
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => onDelete(tx.id)} className="text-gray-700 hover:text-red-400 transition-colors">
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
      </div>
    </div>
  )
}

// ─── Plan DCA Tab ─────────────────────────────────────────────────────────────

function PlanTab({
  plan, portfolio, isAdmin, onAdvanceWeek,
}: {
  plan: InvestPlan | null
  portfolio: PortfolioETF[]
  isAdmin: boolean
  onAdvanceWeek: () => void
}) {
  if (!plan) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-600">
      <Target className="w-10 h-10 opacity-30" />
      <p className="text-sm">Aucun plan DCA configuré</p>
    </div>
  )

  const msci  = portfolio.find(e => e.nomCourt.toLowerCase().includes('msci') || e.nomCourt.toLowerCase().includes('world'))
  const stoxx = portfolio.find(e => e.nomCourt.toLowerCase().includes('stoxx') || e.nomCourt.toLowerCase().includes('europe'))
  const emerg = portfolio.find(e => e.nomCourt.toLowerCase().includes('emerg'))

  const priceM = msci?.quote?.currentPrice  ?? msci?.prixMoyen  ?? 0
  const priceS = stoxx?.quote?.currentPrice ?? stoxx?.prixMoyen ?? 0
  const priceE = emerg?.quote?.currentPrice ?? emerg?.prixMoyen ?? 0

  function weekPlan(week: number) {
    const montant = [plan!.montantS1, plan!.montantS2, plan!.montantS3, plan!.montantS4][week - 1]
    if (week < 4) {
      const parts  = priceM > 0 ? Math.floor(montant / priceM) : '?'
      const reste  = priceM > 0 ? (montant - (typeof parts === 'number' ? parts * priceM : 0)).toFixed(2) : '—'
      return { montant, items: [`${parts} parts MSCI World`, `Reste ~${reste}€`] }
    }
    const costE   = plan!.partsEmergS4 * priceE
    const costS   = plan!.partsStorxxS4 * priceS
    const rem     = montant - costE - costS
    const partsM  = priceM > 0 && rem > 0 ? Math.floor(rem / priceM) : '?'
    return {
      montant,
      items: [
        `${plan!.partsEmergS4} parts PEA Émergents`,
        `${plan!.partsStorxxS4} parts STOXX 600`,
        `${partsM} parts MSCI World (reste)`,
      ],
    }
  }

  const current = ((plan.cycleWeek - 1) % 4) + 1
  const weeks   = [1, 2, 3, 4]
  const totalMensuel = plan.montantS1 + plan.montantS2 + plan.montantS3 + plan.montantS4

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white font-bold">Plan d&apos;investissement PEA</p>
            <p className="text-gray-500 text-sm mt-0.5">Cycle DCA mensuel · 4 semaines</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-500/8 px-3 py-1.5 rounded-full font-semibold">
              Semaine {current} / 4
            </span>
            {isAdmin && (
              <button
                onClick={onAdvanceWeek}
                className="text-xs text-sky-400 border border-sky-500/30 px-3 py-1.5 rounded-full hover:bg-sky-500/10 transition-colors"
              >
                Suivante →
              </button>
            )}
          </div>
        </div>

        {/* Weekly amounts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {weeks.map((w) => {
            const p = weekPlan(w)
            const isCur = w === current
            return (
              <div key={w} className={cn('rounded-xl p-4 border transition-all', isCur ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-white/3 border-white/8')}>
                <div className="flex items-center justify-between mb-1">
                  <p className={cn('text-[10px] font-bold uppercase tracking-wider', isCur ? 'text-emerald-400' : 'text-gray-600')}>
                    Semaine {w}
                  </p>
                  {isCur && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                </div>
                <p className={cn('text-xl font-black tabular-nums', isCur ? 'text-white' : 'text-gray-500')}>{p.montant}€</p>
                <div className="mt-2 space-y-0.5">
                  {p.items.map((item, i) => (
                    <p key={i} className={cn('text-[10px]', isCur ? 'text-gray-400' : 'text-gray-700')}>{item}</p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Total mensuel */}
        <div className="rounded-xl bg-white/3 border border-white/8 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Budget mensuel total</p>
            <p className="text-2xl font-black text-white tabular-nums mt-1">{totalMensuel}€</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Budget annuel estimé</p>
            <p className="text-lg font-bold text-emerald-400 tabular-nums mt-1">{(totalMensuel * 12).toLocaleString('fr')}€</p>
          </div>
        </div>
      </div>

      {/* This week detail */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-4">
          Cette semaine — {weekPlan(current).montant}€ à investir
        </p>
        <div className="space-y-2">
          {weekPlan(current).items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-emerald-500/10 last:border-0">
              <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 text-xs font-bold">{i + 1}</span>
              <span className="text-gray-200 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DCA tips */}
      <div className="rounded-2xl border border-white/8 bg-[#111] p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Cours de référence utilisés</p>
        <div className="space-y-2">
          {[
            { etf: msci,  price: priceM, label: 'MSCI World' },
            { etf: stoxx, price: priceS, label: 'STOXX 600' },
            { etf: emerg, price: priceE, label: 'PEA Émergents' },
          ].map(({ etf, price, label }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2">
                {etf && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: etf.couleur }} />}
                <span className="text-sm text-gray-300">{etf?.nomCourt ?? label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-white tabular-nums">
                  {price > 0 ? formatCurrency(price) : '—'}
                </span>
                {etf?.quote && (
                  <span className={cn('ml-2 text-xs', etf.quote.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {etf.quote.changePercent >= 0 ? '+' : ''}{(etf.quote.changePercent * 100).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Totaux type ──────────────────────────────────────────────────────────────

interface Totaux {
  valeurTotale: number
  investi: number
  plusValue: number
  perf: number
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InvestissementsPage() {
  const { isAdmin, isLoggedIn } = useAuth()
  const [portfolio, setPortfolio]       = useState<PortfolioETF[]>([])
  const [plan, setPlan]                 = useState<InvestPlan | null>(null)
  const [transactions, setTransactions] = useState<InvestTransaction[]>([])
  const [loading, setLoading]           = useState(true)
  const [refreshing, setRefreshing]     = useState(false)
  const [tab, setTab]                   = useState<Tab>('overview')

  // Chart state
  const [selectedIdx, setSelectedIdx]   = useState(0)
  const [range, setRange]               = useState('1y')
  const [history, setHistory]           = useState<HistoryPoint[]>([])
  const [histLoading, setHistLoading]   = useState(false)

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
      toast.error('Erreur lors du chargement')
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
      const res  = await fetch(`/api/invest/history?ticker=${encodeURIComponent(etf.ticker)}&range=${range}`)
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

  const totaux: Totaux = useMemo(() => {
    const valeurTotale = portfolio.reduce((s, e) => s + e.valeurActuelle, 0)
    const investi      = portfolio.reduce((s, e) => s + e.valeurInvestie, 0)
    const plusValue    = valeurTotale - investi
    const perf         = investi > 0 ? plusValue / investi : 0
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

  const apiDown = portfolio.length > 0 && portfolio.every(e => e.quote === null)

  return (
    <div className="p-4 sm:p-6 max-w-full space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Mon PEA</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {apiDown
                ? <span className="text-amber-500">⚠ Cours Yahoo indisponibles · affichage au prix d&apos;achat</span>
                : 'Données en temps réel · Yahoo Finance'}
            </p>
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
          {isLoggedIn && (
            <Button size="sm" onClick={() => setTxModal(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Transaction
            </Button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-white/8 pb-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all -mb-px border-b-2',
              tab === t.id
                ? 'text-emerald-400 border-emerald-400 bg-emerald-500/5'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/3',
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab portfolio={portfolio} totaux={totaux} />}
      {tab === 'positions' && (
        <PositionsTab
          portfolio={portfolio}
          selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx}
          range={range}
          setRange={setRange}
          history={history}
          histLoading={histLoading}
        />
      )}
      {tab === 'transactions' && <TransactionsTab transactions={transactions} isAdmin={isAdmin} onDelete={deleteTx} />}
      {tab === 'plan' && <PlanTab plan={plan} portfolio={portfolio} isAdmin={isAdmin} onAdvanceWeek={advanceCycleWeek} />}

      {/* Transaction modal */}
      <TxModal open={txModal} onClose={() => setTxModal(false)} etfs={portfolio} onSuccess={() => fetchPortfolio(true)} />
    </div>
  )
}
