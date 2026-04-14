'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, Footprints, Dumbbell, Apple, TrendingUp, Plus, X, ChevronLeft, ChevronRight,
  Clock, Trash2, Target, Zap, Activity, Award, BarChart3, Edit3, Check,
  ChevronDown, ChevronUp, Scale, Bot, SendHorizontal, Loader2, Sparkles, Info,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import type {
  FitnessProfile, FitnessSeance, FitnessJour, FitnessRepas,
  FitnessExercice, MuscleGroup, SeanceType, MomentRepas,
} from '@/types'

// ── Constants ────────────────────────────────────────────────────────────────

const MUSCLE_COLORS: Record<string, string> = {
  pectoraux: '#f97316', dos: '#3b82f6', epaules: '#a78bfa',
  biceps: '#34d399', triceps: '#fb7185', jambes: '#fbbf24',
  abdos: '#22d3ee', fessiers: '#e879f9', cardio: '#f43f5e',
}
const MUSCLE_LABELS: Record<string, string> = {
  pectoraux: 'Pecs', dos: 'Dos', epaules: 'Épaules',
  biceps: 'Biceps', triceps: 'Triceps', jambes: 'Jambes',
  abdos: 'Abdos', fessiers: 'Fessiers', cardio: 'Cardio',
}
const MUSCLES = Object.keys(MUSCLE_COLORS) as MuscleGroup[]
const SEANCE_TYPES: { value: SeanceType; label: string; icon: string }[] = [
  { value: 'musculation', label: 'Musculation', icon: '🏋️' },
  { value: 'cardio', label: 'Cardio', icon: '🏃' },
  { value: 'full_body', label: 'Full Body', icon: '💪' },
  { value: 'hiit', label: 'HIIT', icon: '⚡' },
  { value: 'mobilite', label: 'Mobilité', icon: '🧘' },
]
const MOMENTS: { value: MomentRepas; label: string; emoji: string }[] = [
  { value: 'petit_dejeuner', label: 'Petit-déjeuner', emoji: '☀️' },
  { value: 'dejeuner', label: 'Déjeuner', emoji: '🌤️' },
  { value: 'diner', label: 'Dîner', emoji: '🌙' },
  { value: 'collation', label: 'Collation', emoji: '🍎' },
]
const TABS = ['Aujourd\'hui', 'Nutrition', 'IA Nutrition', 'Progression'] as const

// ── Protein calculator constants (personal stats) ────────────────────────────
const WHEY_G = 25   // g de poudre whey iso/jour
const CASEIN_G = 25 // g de poudre caséine/jour
const WHEY_PROTEIN_RATIO = 0.90   // whey iso ≈ 90% protéines
const CASEIN_PROTEIN_RATIO = 0.78 // caséine ≈ 78% protéines
const PROTEIN_PER_KG = 2.0        // objectif 2g/kg pour la prise de masse

function calcProteinFromSupplements() {
  return Math.round(WHEY_G * WHEY_PROTEIN_RATIO + CASEIN_G * CASEIN_PROTEIN_RATIO)
}

function calcTotalProteinTarget(poids: number) {
  return Math.round(poids * PROTEIN_PER_KG)
}

function calcProteinFromFood(poids: number) {
  return Math.max(0, calcTotalProteinTarget(poids) - calcProteinFromSupplements())
}

function calcCaloriesFromSteps(pas: number, poids: number, taille: number) {
  // Formule : distance(km) × poids(kg) × 1.036 avec foulée = 0.415 × taille
  const stride_m = taille * 0.415 / 100
  const distance_km = (pas * stride_m) / 1000
  return Math.round(distance_km * poids * 1.036)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toDateParam(d: Date) {
  return d.toISOString().split('T')[0]
}

function formatDate(d: Date) {
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatShort(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function totalVolume(seance: FitnessSeance) {
  return seance.exercices.reduce((acc, ex) =>
    acc + ex.series.reduce((a, s) => a + s.poids * s.repetitions, 0), 0)
}

function repasTotal(repas: FitnessRepas[]) {
  return repas.reduce(
    (acc, r) => ({
      calories: acc.calories + r.calories,
      proteines: acc.proteines + r.proteines,
      glucides: acc.glucides + r.glucides,
      lipides: acc.lipides + r.lipides,
    }),
    { calories: 0, proteines: 0, glucides: 0, lipides: 0 },
  )
}

// ── SVG Ring ─────────────────────────────────────────────────────────────────

function Ring({
  pct, color, size = 120, stroke = 10, label, value, unit, icon: Icon,
}: {
  pct: number; color: string; size?: number; stroke?: number
  label: string; value: string | number; unit?: string; icon?: React.ElementType
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const filled = Math.min(pct, 1) * circ
  const cx = size / 2
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle
            cx={cx} cy={cx} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {Icon && <Icon className="w-4 h-4 mb-0.5" style={{ color }} />}
          <span className="text-xl font-black text-white tabular-nums leading-none">{value}</span>
          {unit && <span className="text-[10px] text-gray-500 mt-0.5">{unit}</span>}
        </div>
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}

// ── Muscle Tag ───────────────────────────────────────────────────────────────

function MuscleTag({ muscle }: { muscle: string }) {
  const color = MUSCLE_COLORS[muscle] ?? '#9ca3af'
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ color, borderColor: `${color}40`, backgroundColor: `${color}15` }}
    >
      {MUSCLE_LABELS[muscle] ?? muscle}
    </span>
  )
}

// ── Seance Card ──────────────────────────────────────────────────────────────

function SeanceCard({
  seance, isAdmin, onDelete, onAddExercice,
}: {
  seance: FitnessSeance
  isAdmin: boolean
  onDelete: (id: number) => void
  onAddExercice: (seanceId: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const vol = totalVolume(seance)
  const muscles = [...new Set(seance.exercices.map(e => e.muscle))]
  const typeInfo = SEANCE_TYPES.find(t => t.value === seance.type) ?? SEANCE_TYPES[0]
  const date = new Date(seance.date)

  return (
    <motion.div
      layout
      className="rounded-2xl border border-white/8 bg-[#0f0f0f] overflow-hidden hover:border-orange-500/20 transition-colors"
    >
      <div
        className="p-4 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg flex-shrink-0">
              {typeInfo.icon}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">{seance.nom}</p>
              <p className="text-xs text-gray-600 mt-0.5">{formatDate(date)} · {seance.duree} min</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {vol > 0 && (
              <div className="text-right">
                <p className="text-sm font-bold text-orange-400">{(vol / 1000).toFixed(1)} t</p>
                <p className="text-[10px] text-gray-600">volume</p>
              </div>
            )}
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
          </div>
        </div>

        {muscles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {muscles.map(m => <MuscleTag key={m} muscle={m} />)}
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/6"
          >
            <div className="p-4 space-y-3">
              {seance.exercices.map(ex => (
                <div key={ex.id} className="rounded-xl bg-white/3 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MuscleTag muscle={ex.muscle} />
                      <span className="text-sm font-medium text-white">{ex.nom}</span>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={async () => {
                          await fetch(`/api/fitness/exercices/${ex.id}`, { method: 'DELETE' })
                        }}
                        className="text-red-500/50 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ex.series.map(s => (
                      <span key={s.id} className="px-2 py-1 rounded-lg bg-white/5 text-xs text-gray-400 font-mono">
                        {s.repetitions}×{s.poids > 0 ? `${s.poids}kg` : 'BW'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {seance.exercices.length === 0 && (
                <p className="text-sm text-gray-600 text-center py-2">Aucun exercice</p>
              )}

              {isAdmin && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onAddExercice(seance.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs hover:bg-orange-500/20 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Exercice
                  </button>
                  <button
                    onClick={() => onDelete(seance.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/8 border border-red-500/15 text-red-500 text-xs hover:bg-red-500/15 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Supprimer
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Repas Card ───────────────────────────────────────────────────────────────

function RepasCard({ repas, isAdmin, onDelete }: { repas: FitnessRepas; isAdmin: boolean; onDelete: (id: number) => void }) {
  const moment = MOMENTS.find(m => m.value === repas.moment) ?? MOMENTS[1]
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f0f0f] border border-white/6 hover:border-emerald-500/20 transition-colors">
      <span className="text-xl">{moment.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{repas.nom}</p>
        <div className="flex gap-3 mt-0.5">
          <span className="text-[10px] text-orange-400">{repas.calories} kcal</span>
          <span className="text-[10px] text-blue-400">P {repas.proteines}g</span>
          <span className="text-[10px] text-yellow-400">G {repas.glucides}g</span>
          <span className="text-[10px] text-pink-400">L {repas.lipides}g</span>
        </div>
      </div>
      {isAdmin && (
        <button onClick={() => onDelete(repas.id)} className="text-red-500/40 hover:text-red-400 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ── Modal: Nouvelle Séance ────────────────────────────────────────────────────

function SeanceModal({ onClose, onSave }: { onClose: () => void; onSave: (data: Partial<FitnessSeance>) => void }) {
  const [nom, setNom] = useState('')
  const [type, setType] = useState<SeanceType>('musculation')
  const [duree, setDuree] = useState('60')
  const [date, setDate] = useState(toDateParam(new Date()))
  const [notes, setNotes] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Nouvelle séance</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Nom de la séance</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder-gray-700"
              placeholder="ex : Push A, Leg Day, Cardio..."
              value={nom} onChange={e => setNom(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Type</label>
            <div className="grid grid-cols-5 gap-1.5">
              {SEANCE_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] transition-all ${
                    type === t.value
                      ? 'border-orange-500/50 bg-orange-500/15 text-orange-400'
                      : 'border-white/8 bg-white/3 text-gray-600 hover:border-white/15'
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Durée (min)</label>
              <input type="number" value={duree} onChange={e => setDuree(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Notes (optionnel)</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder-gray-700 resize-none"
              rows={2} placeholder="PR, sensations..." value={notes} onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors">Annuler</button>
          <button
            onClick={() => { if (nom.trim()) onSave({ nom, type, duree: parseInt(duree), date, notes: notes || undefined }) }}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition-colors disabled:opacity-40"
            disabled={!nom.trim()}
          >
            Créer
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Modal: Exercice ───────────────────────────────────────────────────────────

function ExerciceModal({ seanceId, onClose, onSave }: { seanceId: number; onClose: () => void; onSave: () => void }) {
  const [nom, setNom] = useState('')
  const [muscle, setMuscle] = useState<MuscleGroup>('pectoraux')
  const [series, setSeries] = useState([{ repetitions: '10', poids: '0' }])

  const addSerie = () => setSeries(s => [...s, { repetitions: '10', poids: s[s.length - 1]?.poids ?? '0' }])
  const removeSerie = (i: number) => setSeries(s => s.filter((_, idx) => idx !== i))

  async function handleSave() {
    if (!nom.trim()) return
    await fetch(`/api/fitness/seances/${seanceId}/exercices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, muscle, series }),
    })
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Ajouter un exercice</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Exercice</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder-gray-700"
              placeholder="ex : Développé couché, Squat..."
              value={nom} onChange={e => setNom(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Groupe musculaire</label>
            <div className="grid grid-cols-3 gap-1.5">
              {MUSCLES.map(m => (
                <button
                  key={m}
                  onClick={() => setMuscle(m)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                    muscle === m ? 'border-current' : 'border-white/8 text-gray-600 hover:border-white/15'
                  }`}
                  style={muscle === m ? { color: MUSCLE_COLORS[m], backgroundColor: `${MUSCLE_COLORS[m]}15`, borderColor: `${MUSCLE_COLORS[m]}50` } : {}}
                >
                  {MUSCLE_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">Séries</label>
              <button onClick={addSerie} className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {series.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-5 text-center">{i + 1}</span>
                  <input
                    type="number" placeholder="Rép" value={s.repetitions}
                    onChange={e => setSeries(prev => prev.map((x, idx) => idx === i ? { ...x, repetitions: e.target.value } : x))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-white text-sm text-center focus:outline-none focus:border-orange-500/50"
                  />
                  <span className="text-gray-600 text-xs">×</span>
                  <input
                    type="number" placeholder="kg" value={s.poids}
                    onChange={e => setSeries(prev => prev.map((x, idx) => idx === i ? { ...x, poids: e.target.value } : x))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-white text-sm text-center focus:outline-none focus:border-orange-500/50"
                  />
                  <span className="text-xs text-gray-600">kg</span>
                  {series.length > 1 && (
                    <button onClick={() => removeSerie(i)} className="text-red-500/50 hover:text-red-400"><X className="w-3 h-3" /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors">Annuler</button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition-colors disabled:opacity-40"
            disabled={!nom.trim()}
          >
            Ajouter
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Modal: Repas ─────────────────────────────────────────────────────────────

function RepasModal({ date, onClose, onSave }: { date: string; onClose: () => void; onSave: () => void }) {
  const [nom, setNom] = useState('')
  const [moment, setMoment] = useState<MomentRepas>('dejeuner')
  const [cal, setCal] = useState('')
  const [prot, setProt] = useState('')
  const [gluc, setGluc] = useState('')
  const [lip, setLip] = useState('')

  async function handleSave() {
    if (!nom.trim()) return
    await fetch('/api/fitness/repas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, moment, calories: cal, proteines: prot, glucides: gluc, lipides: lip, date }),
    })
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Ajouter un repas</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Nom du repas</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder-gray-700"
              placeholder="ex : Omelette 3 œufs, Riz blanc..."
              value={nom} onChange={e => setNom(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Moment</label>
            <div className="grid grid-cols-4 gap-1.5">
              {MOMENTS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMoment(m.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] transition-all ${
                    moment === m.value
                      ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                      : 'border-white/8 bg-white/3 text-gray-600 hover:border-white/15'
                  }`}
                >
                  <span className="text-base">{m.emoji}</span>
                  {m.label.split('-')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Calories (kcal)', val: cal, set: setCal, color: 'orange' },
              { label: 'Protéines (g)', val: prot, set: setProt, color: 'blue' },
              { label: 'Glucides (g)', val: gluc, set: setGluc, color: 'yellow' },
              { label: 'Lipides (g)', val: lip, set: setLip, color: 'pink' },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-gray-500 mb-1.5 block">{f.label}</label>
                <input
                  type="number" value={f.val} onChange={e => f.set(e.target.value)} placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors">Annuler</button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors disabled:opacity-40"
            disabled={!nom.trim()}
          >
            Ajouter
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] text-gray-500 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FitnessPage() {
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState<typeof TABS[number]>('Aujourd\'hui')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [profile, setProfile] = useState<FitnessProfile | null>(null)
  const [seances, setSeances] = useState<FitnessSeance[]>([])
  const [jour, setJour] = useState<FitnessJour | null>(null)
  const [historique, setHistorique] = useState<FitnessJour[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showSeanceModal, setShowSeanceModal] = useState(false)
  const [showRepasModal, setShowRepasModal] = useState(false)
  const [showExerciceModal, setShowExerciceModal] = useState<number | null>(null)

  // IA Nutrition state
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiHistory, setAiHistory] = useState<Array<{
    query: string
    result: {
      nom: string; calories: number; proteines: number; glucides: number; lipides: number; details: string
      ingredients?: Array<{ nom: string; quantite: number; cal: number; prot: number; gluc: number; lip: number }>
      unrecognized?: string[]
    }
    addedMoment?: string
  }>>([])

  async function analyzeWithAI() {
    if (!aiInput.trim() || aiLoading) return
    setAiLoading(true)
    setAiError(null)
    const query = aiInput.trim()
    setAiInput('')
    try {
      const res = await fetch('/api/fitness/ai-macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        setAiError(json.error ?? 'Erreur IA')
      } else {
        setAiHistory(h => [{ query, result: json.data }, ...h])
      }
    } catch {
      setAiError('Impossible de contacter l\'IA')
    } finally {
      setAiLoading(false)
    }
  }

  async function addAiMealToJournal(result: typeof aiHistory[0]['result'], moment: string, idx: number) {
    await fetch('/api/fitness/repas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...result, moment, date: toDateParam(selectedDate) }),
    })
    setAiHistory(h => h.map((x, i) => i === idx ? { ...x, addedMoment: moment } : x))
    fetchJour()
  }

  // Inline edit
  const [editPas, setEditPas] = useState(false)
  const [editPoids, setEditPoids] = useState(false)
  const [pasInput, setPasInput] = useState('')
  const [poidsInput, setPoidsInput] = useState('')

  const fetchAll = useCallback(async () => {
    const dateParam = toDateParam(selectedDate)
    const [profileRes, seancesRes, jourRes, histRes] = await Promise.all([
      fetch('/api/fitness/profile').then(r => r.json()),
      fetch('/api/fitness/seances').then(r => r.json()),
      fetch(`/api/fitness/jour?date=${dateParam}`).then(r => r.json()),
      fetch('/api/fitness/jour?days=30').then(r => r.json()),
    ])
    setProfile(profileRes.data)
    setSeances(seancesRes.data ?? [])
    setJour(jourRes.data)
    setHistorique(histRes.data ?? [])
    setLoading(false)
  }, [selectedDate])

  const fetchJour = useCallback(async () => {
    const dateParam = toDateParam(selectedDate)
    const res = await fetch(`/api/fitness/jour?date=${dateParam}`).then(r => r.json())
    setJour(res.data)
  }, [selectedDate])

  const fetchSeances = useCallback(async () => {
    const res = await fetch('/api/fitness/seances').then(r => r.json())
    setSeances(res.data ?? [])
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Computed
  const totals = useMemo(() => jour ? repasTotal(jour.repas) : { calories: 0, proteines: 0, glucides: 0, lipides: 0 }, [jour])
  const dernierePrise = useMemo(() => historique.filter(j => j.poids).slice(-1)[0]?.poids, [historique])

  async function savePas() {
    if (!jour) return
    await fetch('/api/fitness/jour', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: toDateParam(selectedDate), pas: pasInput }),
    })
    setEditPas(false)
    fetchJour()
  }

  async function savePoids() {
    await fetch('/api/fitness/jour', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: toDateParam(selectedDate), poids: poidsInput }),
    })
    setEditPoids(false)
    fetchJour()
  }

  async function deleteRepas(id: number) {
    await fetch(`/api/fitness/repas/${id}`, { method: 'DELETE' })
    fetchJour()
  }

  async function deleteSeance(id: number) {
    await fetch(`/api/fitness/seances/${id}`, { method: 'DELETE' })
    fetchSeances()
  }

  async function createSeance(data: Partial<FitnessSeance>) {
    await fetch('/api/fitness/seances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setShowSeanceModal(false)
    fetchSeances()
  }

  // Chart data
  const chartPas = useMemo(() =>
    historique.map(j => ({ date: formatShort(new Date(j.date)), pas: j.pas })), [historique])

  const chartPoids = useMemo(() =>
    historique.filter(j => j.poids).map(j => ({ date: formatShort(new Date(j.date)), poids: j.poids })), [historique])

  const chartCal = useMemo(() =>
    historique.map(j => ({
      date: formatShort(new Date(j.date)),
      cal: j.repas.reduce((s, r) => s + r.calories, 0),
    })), [historique])

  const chartVolume = useMemo(() => {
    const byDate: Record<string, number> = {}
    seances.slice(0, 10).forEach(s => {
      const d = formatShort(new Date(s.date))
      byDate[d] = (byDate[d] ?? 0) + totalVolume(s)
    })
    return Object.entries(byDate).map(([date, volume]) => ({ date, volume: Math.round(volume) })).reverse()
  }, [seances])

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/40 via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="absolute top-0 left-0 w-[600px] h-[300px] bg-orange-500/8 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/2" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/3" />

        <div className="relative px-6 pt-8 pb-6">
          {/* Title row */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Fitness Tracker</h1>
                <p className="text-orange-400/70 text-xs">Musculation · Steps · Nutrition</p>
              </div>
            </div>

            {/* Quick stats pills */}
            <div className="hidden md:flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs text-gray-400 flex items-center gap-1.5">
                <Scale className="w-3 h-3 text-orange-400" />
                {dernierePrise ? `${dernierePrise} kg` : '-- kg'}
              </div>
              <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs text-gray-400 flex items-center gap-1.5">
                <Dumbbell className="w-3 h-3 text-orange-400" />
                {seances.length} séances
              </div>
            </div>
          </motion.div>

          {/* Date nav */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-4">
            <button
              onClick={() => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n })}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex-1 text-center">
              <p className="text-white font-semibold capitalize">{formatDate(selectedDate)}</p>
            </div>
            <button
              onClick={() => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n })}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors"
              disabled={toDateParam(selectedDate) >= toDateParam(new Date())}
            >
              <ChevronRight className="w-4 h-4 text-gray-400 disabled:opacity-30" />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs hover:bg-orange-500/20 transition-colors"
            >
              Aujourd'hui
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="px-6 border-b border-white/6">
        <div className="flex gap-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === t
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-gray-600 hover:text-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="px-6 py-6 max-w-5xl mx-auto">

        {/* ══ TAB: AUJOURD'HUI ══════════════════════════════════════════════ */}
        {tab === 'Aujourd\'hui' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Rings row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 md:col-span-1 bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 flex items-center justify-center">
                <Ring
                  pct={jour ? jour.pas / profile.objectifPas : 0}
                  color="#f97316" size={130} stroke={12}
                  label="Pas" value={jour?.pas.toLocaleString('fr-FR') ?? 0}
                  icon={Footprints}
                />
              </div>
              <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 flex items-center justify-center">
                <Ring
                  pct={totals.calories / profile.objectifCal}
                  color="#ef4444" size={110} stroke={10}
                  label="Calories" value={totals.calories} unit="kcal"
                  icon={Flame}
                />
              </div>
              <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 flex items-center justify-center">
                <Ring
                  pct={totals.proteines / profile.objectifProteines}
                  color="#3b82f6" size={110} stroke={10}
                  label="Protéines" value={`${Math.round(totals.proteines)}`} unit="g"
                  icon={Zap}
                />
              </div>
              <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 flex items-center justify-center">
                <Ring
                  pct={(jour?.poids ?? dernierePrise ?? profile.poids) / 100}
                  color="#a78bfa" size={110} stroke={10}
                  label="Poids" value={jour?.poids ?? dernierePrise ?? profile.poids} unit="kg"
                  icon={Scale}
                />
              </div>
            </div>

            {/* Macros bar */}
            <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Objectifs du jour</h3>
                <span className="text-xs text-gray-600">{totals.calories} / {profile.objectifCal} kcal</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Glucides', val: totals.glucides, obj: profile.objectifGlucides, color: '#fbbf24' },
                  { label: 'Protéines', val: totals.proteines, obj: profile.objectifProteines, color: '#3b82f6' },
                  { label: 'Lipides', val: totals.lipides, obj: profile.objectifLipides, color: '#f472b6' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: m.color }}>{m.label}</span>
                      <span className="text-gray-600">{Math.round(m.val)}g / {m.obj}g</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (m.val / m.obj) * 100)}%`, backgroundColor: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions (admin) */}
            {isAdmin && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Edit pas */}
                <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Footprints className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-gray-500">Mes pas</span>
                  </div>
                  {editPas ? (
                    <div className="flex gap-1">
                      <input type="number" value={pasInput} onChange={e => setPasInput(e.target.value)}
                        className="flex-1 bg-white/5 border border-orange-500/30 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none" />
                      <button onClick={savePas} className="p-1.5 bg-orange-500/20 rounded-lg text-orange-400 hover:bg-orange-500/30 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setPasInput(String(jour?.pas ?? 0)); setEditPas(true) }}
                      className="flex items-center gap-2 text-sm font-bold text-white hover:text-orange-400 transition-colors"
                    >
                      {(jour?.pas ?? 0).toLocaleString('fr-FR')} <Edit3 className="w-3 h-3 text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Edit poids */}
                <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="w-4 h-4 text-violet-400" />
                    <span className="text-xs text-gray-500">Poids</span>
                  </div>
                  {editPoids ? (
                    <div className="flex gap-1">
                      <input type="number" step="0.1" value={poidsInput} onChange={e => setPoidsInput(e.target.value)}
                        className="flex-1 bg-white/5 border border-violet-500/30 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none" />
                      <button onClick={savePoids} className="p-1.5 bg-violet-500/20 rounded-lg text-violet-400 hover:bg-violet-500/30 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setPoidsInput(String(jour?.poids ?? profile.poids)); setEditPoids(true) }}
                      className="flex items-center gap-2 text-sm font-bold text-white hover:text-violet-400 transition-colors"
                    >
                      {jour?.poids ? `${jour.poids} kg` : '-- kg'} <Edit3 className="w-3 h-3 text-gray-600" />
                    </button>
                  )}
                </div>

<button
                  onClick={() => setShowRepasModal(true)}
                  className="bg-[#0f0f0f] border border-emerald-500/20 rounded-2xl p-4 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
                >
                  <Apple className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-white font-medium">Ajouter repas</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">Nutrition</p>
                </button>
              </div>
            )}

            {/* Calories brûlées estimées + protein du jour */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Footprints className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-gray-500">Calories brûlées (marche)</span>
                </div>
                <p className="text-2xl font-black text-white">
                  {calcCaloriesFromSteps(jour?.pas ?? 0, profile.poids, profile.taille)}
                  <span className="text-sm font-normal text-gray-600 ml-1">kcal</span>
                </p>
                <p className="text-[10px] text-gray-600 mt-1">
                  {jour?.pas?.toLocaleString('fr-FR') ?? 0} pas · {profile.poids}kg · {profile.taille}cm
                </p>
              </div>
              <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-500">Protéines alimentaires</span>
                </div>
                <p className="text-2xl font-black text-white">
                  {Math.round(totals.proteines)}
                  <span className="text-sm font-normal text-gray-600 ml-1">/ {calcProteinFromFood(profile.poids)}g</span>
                </p>
                <p className="text-[10px] text-gray-600 mt-1">
                  +{calcProteinFromSupplements()}g compléments · objectif {calcTotalProteinTarget(profile.poids)}g total
                </p>
              </div>
            </div>

          </motion.div>
        )}

        {/* ══ TAB: NUTRITION ═══════════════════════════════════════════════ */}
        {tab === 'Nutrition' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Nutrition · {formatDate(selectedDate)}</h2>
              {isAdmin && (
                <button
                  onClick={() => setShowRepasModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm hover:bg-emerald-500/20 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Repas
                </button>
              )}
            </div>

            {/* Macro rings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Calories', val: totals.calories, obj: profile.objectifCal, unit: 'kcal', color: '#f97316', icon: Flame },
                { label: 'Protéines', val: Math.round(totals.proteines), obj: profile.objectifProteines, unit: 'g', color: '#3b82f6', icon: Zap },
                { label: 'Glucides', val: Math.round(totals.glucides), obj: profile.objectifGlucides, unit: 'g', color: '#fbbf24', icon: Activity },
                { label: 'Lipides', val: Math.round(totals.lipides), obj: profile.objectifLipides, unit: 'g', color: '#f472b6', icon: Target },
              ].map(m => (
                <div key={m.label} className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-4 flex flex-col items-center">
                  <Ring pct={m.val / m.obj} color={m.color} size={100} stroke={9}
                    label={m.label} value={m.val} unit={m.unit} icon={m.icon} />
                  <p className="text-[10px] text-gray-600 mt-2">/ {m.obj} {m.unit}</p>
                </div>
              ))}
            </div>

            {/* Meals by moment */}
            {MOMENTS.map(m => {
              const repasMoment = jour?.repas.filter(r => r.moment === m.value) ?? []
              if (repasMoment.length === 0 && !isAdmin) return null
              return (
                <div key={m.value}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{m.emoji}</span>
                    <h3 className="text-sm font-semibold text-gray-400">{m.label}</h3>
                    {repasMoment.length > 0 && (
                      <span className="text-xs text-gray-600">
                        · {repasMoment.reduce((s, r) => s + r.calories, 0)} kcal
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {repasMoment.map(r => (
                      <RepasCard key={r.id} repas={r} isAdmin={isAdmin} onDelete={deleteRepas} />
                    ))}
                    {repasMoment.length === 0 && (
                      <div className="h-10 rounded-xl border border-dashed border-white/6 flex items-center justify-center">
                        <span className="text-xs text-gray-700">Rien ajouté</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {/* ══ TAB: IA NUTRITION ════════════════════════════════════════════ */}
        {tab === 'IA Nutrition' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Protein daily plan card */}
            <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Plan protéines journalier</h3>
                  <p className="text-[10px] text-gray-600">{profile.poids} kg · {profile.taille} cm · objectif {PROTEIN_PER_KG}g/kg</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Objectif total', value: `${calcTotalProteinTarget(profile.poids)}g`, color: '#60a5fa', sub: `${PROTEIN_PER_KG}g × ${profile.poids}kg` },
                  { label: 'Whey ISO (poudre)', value: `${Math.round(WHEY_G * WHEY_PROTEIN_RATIO)}g`, color: '#34d399', sub: `${WHEY_G}g poudre × ${(WHEY_PROTEIN_RATIO * 100).toFixed(0)}%` },
                  { label: 'Caséine (poudre)', value: `${Math.round(CASEIN_G * CASEIN_PROTEIN_RATIO)}g`, color: '#a78bfa', sub: `${CASEIN_G}g poudre × ${(CASEIN_PROTEIN_RATIO * 100).toFixed(0)}%` },
                  { label: 'Depuis alimentation', value: `${calcProteinFromFood(profile.poids)}g`, color: '#fb923c', sub: `Objectif − compléments` },
                ].map(s => (
                  <div key={s.label} className="bg-white/3 rounded-xl p-3 border border-white/6">
                    <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{s.label}</p>
                    <p className="text-[9px] text-gray-600 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Distribution suggestion */}
              <div className="bg-white/3 rounded-xl p-3 border border-white/6">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                  <Info className="w-3 h-3" /> Répartition suggérée sur la journée
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {MOMENTS.map(m => (
                    <div key={m.value} className="flex items-center gap-2">
                      <span>{m.emoji}</span>
                      <div>
                        <p className="text-xs text-white font-semibold">
                          ~{Math.round(calcProteinFromFood(profile.poids) / 4)}g
                        </p>
                        <p className="text-[10px] text-gray-600">{m.label.split('-')[0]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calories from steps */}
            <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
                  <Footprints className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Calories brûlées selon les pas</h3>
                  <p className="text-[10px] text-gray-600">Formule : distance × {profile.poids}kg × 1.036 (foulée {Math.round(profile.taille * 0.415)}cm)</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[3000, 5000, 8000, 10000, 12000, 15000, 18000, 20000].map(steps => (
                  <div
                    key={steps}
                    className={`rounded-xl p-3 border text-center transition-all ${
                      jour && jour.pas >= steps * 0.9 && jour.pas <= steps * 1.1
                        ? 'border-orange-500/50 bg-orange-500/15'
                        : 'border-white/6 bg-white/3'
                    }`}
                  >
                    <p className="text-sm font-black text-white">
                      {calcCaloriesFromSteps(steps, profile.poids, profile.taille)}
                      <span className="text-[10px] text-gray-600"> kcal</span>
                    </p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{steps.toLocaleString('fr-FR')} pas</p>
                  </div>
                ))}
              </div>
              {jour && jour.pas > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/25">
                  <p className="text-sm text-orange-300">
                    🔥 Aujourd'hui — {jour.pas.toLocaleString('fr-FR')} pas =&nbsp;
                    <span className="font-black text-white text-base">
                      {calcCaloriesFromSteps(jour.pas, profile.poids, profile.taille)} kcal
                    </span>
                    &nbsp;brûlées
                  </p>
                </div>
              )}
            </div>

            {/* AI Chatbot */}
            <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/25 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Calculateur IA · Macros instantanés</h3>
                  <p className="text-[10px] text-gray-600">100+ aliments · calcul instantané · aucune clé API requise</p>
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-2 mb-4">
                <textarea
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); analyzeWithAI() } }}
                  placeholder="Ex : 200g poulet + 150g riz blanc + 1 cuillère huile olive&#10;Ex : 3 oeufs + 2 tranches pain complet + 30g emmental&#10;Ex : 100g flocons avoine + 1 banane + 30g whey"
                  rows={2}
                  disabled={aiLoading}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-gray-700 resize-none disabled:opacity-50"
                />
                <button
                  onClick={analyzeWithAI}
                  disabled={aiLoading || !aiInput.trim()}
                  className="px-4 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:bg-violet-500/30 transition-colors disabled:opacity-40 flex items-center justify-center"
                >
                  {aiLoading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <SendHorizontal className="w-4 h-4" />
                  }
                </button>
              </div>

              {/* Error */}
              {aiError && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                  ⚠️ {aiError}
                </div>
              )}

              {/* Loading skeleton */}
              {aiLoading && (
                <div className="rounded-xl bg-white/3 border border-white/8 p-4 animate-pulse mb-3">
                  <div className="h-3 bg-white/10 rounded w-1/3 mb-3" />
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-white/5 rounded-lg" />)}
                  </div>
                </div>
              )}

              {/* Results history */}
              <div className="space-y-3">
                {aiHistory.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-[#0f0f0f] border border-white/8 overflow-hidden"
                  >
                    {/* Query */}
                    <div className="px-4 py-2.5 border-b border-white/6 bg-white/2">
                      <p className="text-xs text-gray-500 italic">"{item.query}"</p>
                    </div>

                    {/* Result */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-semibold text-white text-sm">{item.result.nom}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5">{item.result.details}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-black text-orange-400">{item.result.calories}</p>
                          <p className="text-[10px] text-gray-600">kcal</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {[
                          { label: 'Protéines', val: item.result.proteines, color: '#60a5fa', unit: 'g' },
                          { label: 'Glucides', val: item.result.glucides, color: '#fbbf24', unit: 'g' },
                          { label: 'Lipides', val: item.result.lipides, color: '#f472b6', unit: 'g' },
                        ].map(m => (
                          <div key={m.label} className="bg-white/3 rounded-lg p-2.5 text-center">
                            <p className="text-base font-black" style={{ color: m.color }}>{m.val}{m.unit}</p>
                            <p className="text-[10px] text-gray-600">{m.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Détail par ingrédient */}
                      {item.result.ingredients && item.result.ingredients.length > 0 && (
                        <div className="mb-3 space-y-1">
                          {item.result.ingredients.map((ing, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-white/3">
                              <span className="text-gray-400 capitalize">{ing.nom} <span className="text-gray-600">({ing.quantite}g)</span></span>
                              <div className="flex gap-2 text-gray-500">
                                <span className="text-orange-400">{ing.cal}kcal</span>
                                <span className="text-blue-400">P{ing.prot}g</span>
                                <span className="text-yellow-400">G{ing.gluc}g</span>
                                <span className="text-pink-400">L{ing.lip}g</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Non reconnus */}
                      {item.result.unrecognized && item.result.unrecognized.length > 0 && (
                        <div className="mb-3 flex items-center gap-1.5 text-[10px] text-amber-500/80">
                          <Info className="w-3 h-3" />
                          Non reconnus : {item.result.unrecognized.join(', ')}
                        </div>
                      )}

                      {/* Add to journal */}
                      {item.addedMoment ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-xs">
                          <Check className="w-3.5 h-3.5" />
                          Ajouté au journal ({MOMENTS.find(m => m.value === item.addedMoment)?.label})
                        </div>
                      ) : isAdmin ? (
                        <div className="flex gap-1.5 flex-wrap">
                          <span className="text-[10px] text-gray-600 self-center">Ajouter au journal :</span>
                          {MOMENTS.map(m => (
                            <button
                              key={m.value}
                              onClick={() => addAiMealToJournal(item.result, m.value, idx)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] hover:bg-emerald-500/20 transition-colors"
                            >
                              {m.emoji} {m.label.split('-')[0]}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))}

                {aiHistory.length === 0 && !aiLoading && !aiError && (
                  <div className="text-center py-8 text-gray-700">
                    <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Décris un repas ci-dessus pour obtenir ses macros</p>
                    <p className="text-xs mt-1 text-gray-600">Exemples : "150g steak haché 5% + 200g patate douce" · "bowl acai 400g"</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ TAB: PROGRESSION ════════════════════════════════════════════ */}
        {tab === 'Progression' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <h2 className="text-lg font-bold text-white">Progression · 30 derniers jours</h2>

            {/* Poids */}
            <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Évolution du poids</h3>
              </div>
              {chartPoids.length > 1 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartPoids}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="poids" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} name="Poids kg" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-700 text-sm">
                  Pas assez de données (note ton poids chaque jour)
                </div>
              )}
            </div>

            {/* Steps */}
            <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Footprints className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-white">Activité — Pas quotidiens</h3>
              </div>
              {chartPas.some(p => p.pas > 0) ? (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartPas}>
                    <defs>
                      <linearGradient id="gradPas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="pas" stroke="#f97316" fill="url(#gradPas)" strokeWidth={2} name="Pas" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-700 text-sm">Note tes pas chaque jour</div>
              )}
            </div>

            {/* Calories */}
            <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-semibold text-white">Apport calorique quotidien</h3>
                <div className="ml-auto text-[10px] text-gray-600">Objectif {profile.objectifCal} kcal</div>
              </div>
              {chartCal.some(c => c.cal > 0) ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartCal}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="cal" fill="#ef4444" radius={[3, 3, 0, 0]} name="Calories" opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-700 text-sm">Commence à logger tes repas</div>
              )}
            </div>

          </motion.div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {showRepasModal && (
        <RepasModal date={toDateParam(selectedDate)} onClose={() => setShowRepasModal(false)} onSave={fetchJour} />
      )}
    </div>
  )
}
