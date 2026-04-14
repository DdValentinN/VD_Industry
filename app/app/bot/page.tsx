'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Play, Square, Bell, BellOff, ExternalLink, RefreshCw, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

// Vinted catalog categories (FR)
const CATEGORIES = [
  { id: '', label: 'Toutes catégories' },
  { id: '1904', label: 'Femme' },
  { id: '4', label: 'Homme' },
  { id: '1', label: 'Enfants' },
  { id: '12', label: 'Maison' },
  { id: '2', label: 'Divertissement' },
]

const CONDITIONS = [
  { id: '6', label: 'Neuf avec étiquettes' },
  { id: '1', label: 'Neuf sans étiquettes' },
  { id: '2', label: 'Très bon état' },
  { id: '3', label: 'Bon état' },
  { id: '4', label: 'Satisfaisant' },
]

const INTERVALS = [
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '1min' },
  { value: 120, label: '2min' },
]

interface VintedItem {
  id: number
  title: string
  price: string
  currency: string
  brand: string
  size: string
  condition: string
  photo: string | null
  seller: string
  url: string
  createdAt: number
  isNew?: boolean
}

interface Filters {
  search_text: string
  price_from: string
  price_to: string
  catalog_ids: string
  status_ids: string[]
}

export default function BotPage() {
  const [filters, setFilters] = useState<Filters>({
    search_text: '',
    price_from: '',
    price_to: '',
    catalog_ids: '',
    status_ids: [],
  })
  const [items, setItems] = useState<VintedItem[]>([])
  const [running, setRunning] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [interval, setInterval_] = useState(30)
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [newCount, setNewCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const seenIds = useRef<Set<number>>(new Set())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioCtx = useRef<AudioContext | null>(null)

  function playBeep() {
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext()
      const ctx = audioCtx.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams()
    if (filters.search_text) params.set('search_text', filters.search_text)
    if (filters.price_from) params.set('price_from', filters.price_from)
    if (filters.price_to) params.set('price_to', filters.price_to)
    if (filters.catalog_ids) params.append('catalog_ids[]', filters.catalog_ids)
    filters.status_ids.forEach((id) => params.append('status_ids[]', id))
    return `/api/bot/search?${params.toString()}`
  }, [filters])

  const fetchItems = useCallback(async (isFirst = false) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(buildUrl())
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return
      }
      const fetched: VintedItem[] = data.items || []

      if (isFirst) {
        seenIds.current = new Set(fetched.map((i) => i.id))
        setItems(fetched.map((i) => ({ ...i, isNew: false })))
        setNewCount(0)
      } else {
        const newItems = fetched.filter((i) => !seenIds.current.has(i.id))
        if (newItems.length > 0) {
          newItems.forEach((i) => seenIds.current.add(i.id))
          if (soundOn) playBeep()
          setNewCount((c) => c + newItems.length)
          setItems((prev) => [
            ...newItems.map((i) => ({ ...i, isNew: true })),
            ...prev.slice(0, 80),
          ])
        }
      }
      setLastRefresh(new Date())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [buildUrl, soundOn])

  // Start/stop monitoring
  useEffect(() => {
    if (running) {
      fetchItems(false)
      timerRef.current = setInterval(fetchItems as any, interval * 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [running, interval, fetchItems])

  function handleStart() {
    setItems([])
    seenIds.current = new Set()
    setNewCount(0)
    fetchItems(true).then(() => setRunning(true))
  }

  function handleStop() {
    setRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function toggleCondition(id: string) {
    setFilters((f) => ({
      ...f,
      status_ids: f.status_ids.includes(id)
        ? f.status_ids.filter((s) => s !== id)
        : [...f.status_ids, id],
    }))
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Bot Vinted</h1>
          <p className="text-gray-400 mt-1">Surveillance en temps réel des nouvelles annonces</p>
        </div>
        <div className="flex items-center gap-2">
          {newCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
              +{newCount} nouvelles
            </span>
          )}
          <button
            onClick={() => setSoundOn((s) => !s)}
            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            title={soundOn ? 'Couper le son' : 'Activer le son'}
          >
            {soundOn ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Recherche (ex: Nike Air Force, Pull Ralph Lauren...)"
                value={filters.search_text}
                onChange={(e) => setFilters((f) => ({ ...f, search_text: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <select
              value={filters.catalog_ids}
              onChange={(e) => setFilters((f) => ({ ...f, catalog_ids: e.target.value }))}
              className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-gray-900">{c.label}</option>
              ))}
            </select>
          </div>

          {/* Row 2 — Price */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Prix min (€)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.price_from}
                onChange={(e) => setFilters((f) => ({ ...f, price_from: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Prix max (€)</label>
              <input
                type="number"
                placeholder="∞"
                value={filters.price_to}
                onChange={(e) => setFilters((f) => ({ ...f, price_to: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Intervalle de surveillance</label>
              <div className="flex gap-1">
                {INTERVALS.map((iv) => (
                  <button
                    key={iv.value}
                    onClick={() => setInterval_(iv.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border ${
                      interval === iv.value
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {iv.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3 — Conditions */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">État</label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleCondition(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    filters.status_ids.includes(c.id)
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start/Stop */}
          <div className="flex items-center gap-3 pt-1">
            {!running ? (
              <Button
                onClick={handleStart}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Play className="w-4 h-4" />
                Démarrer la surveillance
              </Button>
            ) : (
              <Button
                onClick={handleStop}
                variant="outline"
                className="border-red-500/40 text-red-400 hover:bg-red-500/10 gap-2"
              >
                <Square className="w-4 h-4" />
                Arrêter
              </Button>
            )}
            {running && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-gray-400">
                  Surveillance active · refresh toutes les {interval}s
                </span>
              </div>
            )}
            {loading && !running && (
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          Erreur : {error}
        </div>
      )}

      {/* Results */}
      {items.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400">
              {items.length} annonce(s) affichée(s)
              {lastRefresh && (
                <span className="ml-2 text-gray-600">
                  · Dernière MAJ {lastRefresh.toLocaleTimeString('fr-FR')}
                </span>
              )}
            </p>
            {loading && (
              <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative rounded-xl overflow-hidden border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                  item.isNew
                    ? 'border-emerald-500/60 shadow-emerald-500/10 shadow-md'
                    : 'border-white/8 hover:border-white/20'
                }`}
              >
                {item.isNew && (
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
                    NEW
                  </div>
                )}
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                    <ExternalLink className="w-3 h-3 text-white" />
                  </div>
                </div>

                {/* Photo */}
                <div className="aspect-square bg-white/5 overflow-hidden">
                  {item.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.photo}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                      Pas de photo
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5 bg-white/3">
                  <p className="text-white text-xs font-medium line-clamp-2 leading-tight mb-1">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold text-sm">
                      {parseFloat(item.price).toFixed(2)} €
                    </span>
                    {item.size && (
                      <span className="text-gray-500 text-[10px]">{item.size}</span>
                    )}
                  </div>
                  {item.brand && (
                    <p className="text-gray-500 text-[10px] mt-0.5 truncate">{item.brand}</p>
                  )}
                  {item.condition && (
                    <p className="text-gray-600 text-[10px] truncate">{item.condition}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && !loading && !error && (
        <div className="text-center py-16 text-gray-600">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Configure tes filtres et démarre la surveillance</p>
        </div>
      )}
    </div>
  )
}
