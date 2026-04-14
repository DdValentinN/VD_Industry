'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts'
import type { BeneficeParMois, RepartitionCategorie } from '@/types'

const PIE_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
]

export function MonthlyBarChart({ data }: { data: BeneficeParMois[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="mois"
          stroke="rgba(255,255,255,0.3)"
          tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          stroke="rgba(255,255,255,0.3)"
          tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}€`}
          width={48}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: 12,
          }}
          formatter={(v: number) => [`${v.toFixed(2)} €`, 'Bénéfice']}
        />
        <Bar dataKey="benefice" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Finances charts ───────────────────────────────────────────────────────────

interface FinancesLinePoint { nom: string; solde: number }
export function FinancesSoldeChart({ data, soldeDepart }: { data: FinancesLinePoint[]; soldeDepart: number }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
        <defs>
          <linearGradient id="soldeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="nom" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k€`} width={42} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: 12 }}
          formatter={(v: number) => [`${v.toFixed(2)} €`, 'Solde']}
        />
        <ReferenceLine y={soldeDepart} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
        <Area type="monotone" dataKey="solde" stroke="#10b981" strokeWidth={2} fill="url(#soldeGrad)" dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface FinancesBarPoint { nom: string; revenus: number; charges: number }
export function FinancesRevenusChart({ data }: { data: FinancesBarPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="nom" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
        <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}€`} width={52} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: 12 }}
          formatter={(v: number, name: string) => [`${v.toFixed(2)} €`, name === 'revenus' ? 'Revenus' : 'Charges']}
        />
        <Bar dataKey="revenus" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={32} name="revenus" />
        <Bar dataKey="charges" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={32} name="charges" opacity={0.7} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface ChargePiePoint { nom: string; montant: number }
export function FinancesChargesPie({ data }: { data: ChargePiePoint[] }) {
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316']
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="montant" nameKey="nom" cx="50%" cy="45%" outerRadius={70} innerRadius={35} strokeWidth={2} stroke="#0a0a0a">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Legend formatter={(v: string) => <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{v}</span>} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: 12 }}
          formatter={(v: number, name: string) => [`${v.toFixed(2)} €/mois`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export function CategoryPieChart({ data }: { data: RepartitionCategorie[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="categorie"
          cx="50%"
          cy="45%"
          outerRadius={75}
          strokeWidth={2}
          stroke="#0a0a0a"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Legend
          formatter={(v: string) => (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{v}</span>
          )}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: 12,
          }}
          formatter={(v: number, name: string) => [`${v} article(s)`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
