'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BarChart3, ArrowRight, TrendingUp, Package, Percent,
  LineChart, Lock, Clock, Layers, Users, Euro, PiggyBank, Gamepad2, Trophy, Zap, Star,
} from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface VintedStats {
  total: number
  nbVendus: number
  beneficeTotal: number
  margeMoyenne: number
}

interface FinancesStats {
  revenuAnnuel: number
  epargnAnnuelle: number
  tauxEpargne: number
  soldeFin: number
}

interface InvestStats {
  nbETFs: number
  coutTotal: number
}

interface FitnessStats {
  nbSeances: number
  nbJoursActifs: number
}

interface AppsGridProps {
  vintedStats: VintedStats
  financesStats: FinancesStats
  investStats: InvestStats
  fitnessStats: FitnessStats
}

const COMING_SOON: Array<{ icon: React.ElementType; name: string; desc: string; tags: string[]; color: string }> = []

const COLOR_MAP: Record<string, { border: string; icon: string; tag: string; glow: string }> = {
  violet: {
    border: 'border-violet-500/20 hover:border-violet-500/40',
    icon: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    tag: 'bg-violet-500/8 text-violet-400 border-violet-500/20',
    glow: 'hover:shadow-violet-500/10',
  },
  amber: {
    border: 'border-amber-500/20 hover:border-amber-500/40',
    icon: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    tag: 'bg-amber-500/8 text-amber-400 border-amber-500/20',
    glow: 'hover:shadow-amber-500/10',
  },
}

export function AppsGrid({ vintedStats, financesStats, investStats, fitnessStats }: AppsGridProps) {
  return (
    <main className="min-h-screen pt-28 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10px] text-emerald-400 tracking-[0.25em] uppercase font-medium">Apps</span>
            <span className="w-8 h-px bg-emerald-400/40" />
            <span className="text-[10px] text-gray-600 tracking-[0.25em] uppercase">Projets live &amp; en cours</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Mes <span className="text-emerald-400">Applications</span>
          </h1>
          <p className="text-gray-500 mt-3 max-w-xl">
            Outils que j&apos;ai conçus et développés pour résoudre des problèmes concrets.
            Du suivi Vinted à la gestion financière personnelle.
          </p>
        </motion.div>

        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 mb-12 mt-8"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400">8 apps en production</span>
          </div>
        </motion.div>

        {/* Featured app — Vinted Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Link href="/app" className="group block">
            <div className="relative rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 via-white/2 to-transparent p-8 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              {/* Live pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live · En production
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                {/* Left */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <BarChart3 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Vinted Tracker Pro</h2>
                      <p className="text-emerald-400/70 text-sm">Outil de gestion achat-revente</p>
                    </div>
                  </div>

                  <p className="text-gray-400 leading-relaxed mb-5 max-w-lg">
                    Application full-stack de suivi d&apos;articles Vinted — tableau de bord avec KPIs,
                    graphiques de performance mensuelle, gestion CRUD complète des articles,
                    upload de photos et paramétrage des seuils de rentabilité.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Next.js 14', 'Prisma', 'SQLite', 'Recharts', 'Tailwind', 'Framer Motion'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/8 text-emerald-400 border border-emerald-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                    Ouvrir l&apos;application
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 lg:w-72 flex-shrink-0">
                  {[
                    { icon: Package, label: 'Articles total', value: String(vintedStats.total) },
                    { icon: TrendingUp, label: 'Vendus', value: String(vintedStats.nbVendus) },
                    { icon: BarChart3, label: 'Bénéfice net', value: formatCurrency(vintedStats.beneficeTotal) },
                    { icon: Percent, label: 'Marge moy.', value: formatPercent(vintedStats.margeMoyenne) },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                      <s.icon className="w-4 h-4 text-emerald-400 mx-auto mb-2" />
                      <p className="text-lg font-black text-white tabular-nums">{s.value}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Finances Couple — Live app */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Link href="/app/finances" className="group block">
            <div className="relative rounded-3xl border border-sky-500/25 bg-gradient-to-br from-sky-500/5 via-white/2 to-transparent p-8 hover:border-sky-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-sky-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                Live · En production
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                      <Users className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Finances Couple</h2>
                      <p className="text-sky-400/70 text-sm">Tableau de bord budgétaire</p>
                    </div>
                  </div>

                  <p className="text-gray-400 leading-relaxed mb-5 max-w-lg">
                    Dashboard financier pour couple — suivi mensuel des revenus, charges fixes et variables,
                    épargne nette, solde cumulé, répartition des charges par personne et projection sur 5 ans.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Next.js 14', 'Prisma', 'SQLite', 'Recharts', 'Tailwind'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-sky-500/8 text-sky-400 border border-sky-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                    Ouvrir le dashboard
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 lg:w-72 flex-shrink-0">
                  {[
                    { icon: TrendingUp, label: 'Revenus annuels', value: formatCurrency(financesStats.revenuAnnuel) },
                    { icon: PiggyBank, label: 'Épargne nette', value: formatCurrency(financesStats.epargnAnnuelle) },
                    { icon: Euro, label: 'Taux d\'épargne', value: formatPercent(financesStats.tauxEpargne) },
                    { icon: Euro, label: 'Solde fin d\'année', value: formatCurrency(financesStats.soldeFin) },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                      <s.icon className="w-4 h-4 text-sky-400 mx-auto mb-2" />
                      <p className="text-lg font-black text-white tabular-nums">{s.value}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Tracker Investissements — Live app */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Link href="/app/investissements" className="group block">
            <div className="relative rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-500/5 via-white/2 to-transparent p-8 hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-violet-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Live · En production
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                      <LineChart className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Tracker Investissements</h2>
                      <p className="text-violet-400/70 text-sm">Suivi PEA en temps réel</p>
                    </div>
                  </div>

                  <p className="text-gray-400 leading-relaxed mb-5 max-w-lg">
                    Tableau de bord pour PEA — cours live via Yahoo Finance, historique graphique,
                    suivi des positions ETF, calcul des plus-values et plan d&apos;investissement hebdomadaire automatisé.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Next.js 14', 'Prisma', 'Yahoo Finance', 'Recharts', 'Tailwind'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-violet-500/8 text-violet-400 border border-violet-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                    Ouvrir le tracker
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 lg:w-72 flex-shrink-0">
                  {[
                    { icon: LineChart, label: 'ETFs suivis', value: String(investStats.nbETFs) },
                    { icon: TrendingUp, label: 'Investi total', value: formatCurrency(investStats.coutTotal) },
                    { icon: Euro, label: 'Données live', value: 'Yahoo' },
                    { icon: BarChart3, label: 'Plan auto', value: '4 semaines' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                      <s.icon className="w-4 h-4 text-violet-400 mx-auto mb-2" />
                      <p className="text-lg font-black text-white tabular-nums">{s.value}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Fitness Tracker — Live app */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6"
        >
          <Link href="/app/fitness" className="group block">
            <div className="relative rounded-3xl border border-orange-500/25 bg-gradient-to-br from-orange-500/5 via-white/2 to-transparent p-8 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-orange-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Live · En production
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/25 flex items-center justify-center group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-colors">
                      <span className="text-2xl">🔥</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Fitness Tracker</h2>
                      <p className="text-orange-400/70 text-sm">Musculation · Steps · Nutrition</p>
                    </div>
                  </div>

                  <p className="text-gray-400 leading-relaxed mb-5 max-w-lg">
                    Tableau de bord fitness complet — suivi des séances de musculation avec exercices et séries,
                    compteur de pas quotidien, journal nutritionnel avec macros, et graphiques de progression.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Next.js 14', 'Prisma', 'SQLite', 'Recharts', 'Tailwind'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-orange-500/8 text-orange-400 border border-orange-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                    Ouvrir le tracker
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 lg:w-72 flex-shrink-0">
                  {[
                    { icon: BarChart3, label: 'Séances', value: String(fitnessStats.nbSeances) },
                    { icon: TrendingUp, label: 'Jours actifs', value: String(fitnessStats.nbJoursActifs) },
                    { icon: Package, label: 'Groupes muscu', value: '9' },
                    { icon: Percent, label: 'Macros suivis', value: '4' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                      <s.icon className="w-4 h-4 text-orange-400 mx-auto mb-2" />
                      <p className="text-lg font-black text-white tabular-nums">{s.value}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* PerfTrack — external live app */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Link href="/app/perftrack" className="group block">
            <div className="relative rounded-3xl border border-[#00FF87]/20 bg-gradient-to-br from-[#00FF87]/5 via-white/2 to-transparent p-8 hover:border-[#00FF87]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00FF87]/8 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#00FF87]/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00FF87]/30 bg-[#00FF87]/10 text-[#00FF87] text-xs mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse" />
                Live · Netlify · Collab
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#00FF87]/10 border border-[#00FF87]/25 flex items-center justify-center group-hover:bg-[#00FF87]/20 transition-colors">
                      <span className="text-2xl">⚽</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">PerfTrack</h2>
                      <p className="text-[#00FF87]/70 text-sm">Analytics football · Dashboard coach</p>
                    </div>
                  </div>

                  <p className="text-gray-400 leading-relaxed mb-5 max-w-lg">
                    Dashboard analytics pour clubs de football amateurs — suivi de l&apos;effectif,
                    live match avec événements en temps réel, rapports post-match, statistiques individuelles
                    et analyse de saison. Développé en collaboration.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {['React 19', 'Vite', 'Supabase', 'Zustand', 'Recharts', 'Tailwind'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-[#00FF87]/8 text-[#00FF87] border border-[#00FF87]/20">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-[#00FF87] font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                    Voir l&apos;application
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 lg:w-72 flex-shrink-0">
                  {[
                    { icon: Users, label: 'Joueurs', value: '18' },
                    { icon: BarChart3, label: 'Matchs suivis', value: '10+' },
                    { icon: TrendingUp, label: 'Modules', value: '8' },
                    { icon: Clock, label: 'Live match', value: 'Temps réel' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                      <s.icon className="w-4 h-4 text-[#00FF87] mx-auto mb-2" />
                      <p className="text-lg font-black text-white tabular-nums">{s.value}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Arsenal FC App */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <Link href="/app/arsenal" className="group block">
            <div className="relative rounded-3xl border border-red-600/25 bg-gradient-to-br from-red-600/8 via-white/2 to-transparent p-8 hover:border-red-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-600/8 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-600/30 bg-red-600/10 text-red-400 text-xs mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live · Données en temps réel
              </div>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-600/25 flex items-center justify-center text-3xl group-hover:bg-red-600/20 transition-colors">
                      🔴
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Arsenal FC</h2>
                      <p className="text-red-400/70 text-sm">The Gunners · Since 1886</p>
                    </div>
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-5 max-w-lg">
                    Dashboard complet Arsenal — matchs live, calendrier PL, classement en temps réel,
                    effectif détaillé, histoire du club, légendes et galerie photos personnalisée.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Next.js', 'football-data.org', 'Live scores', 'Tailwind'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-red-600/8 text-red-400 border border-red-600/20">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-red-400 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                    Voir le dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:w-72 flex-shrink-0">
                  {[
                    { icon: Trophy, label: 'Titres PL',    value: '13' },
                    { icon: Star,   label: 'FA Cups',      value: '14' },
                    { icon: Users,  label: 'Invincibles',  value: '2003-04' },
                    { icon: Zap,    label: 'Live scores',  value: 'PL live' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                      <s.icon className="w-4 h-4 text-red-400 mx-auto mb-2" />
                      <p className="text-lg font-black text-white tabular-nums">{s.value}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Snake Game */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <Link href="/app/snake" className="group block">
            <div className="relative rounded-3xl border border-pink-500/25 bg-gradient-to-br from-pink-500/5 via-white/2 to-transparent p-8 hover:border-pink-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-pink-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-xs mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                Live · Accessible à tous
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/25 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                      <Gamepad2 className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Snake</h2>
                      <p className="text-pink-400/70 text-sm">Mini-jeu · Classique revisité</p>
                    </div>
                  </div>

                  <p className="text-gray-400 leading-relaxed mb-5 max-w-lg">
                    Le classique Snake entièrement développé en React — grille 20×20,
                    accélération progressive, high score sauvegardé, contrôles clavier (Flèches / ZQSD)
                    et swipe mobile.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {['React', 'Next.js', 'TypeScript', 'Tailwind', 'localStorage'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-pink-500/8 text-pink-400 border border-pink-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                    Jouer maintenant
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 lg:w-72 flex-shrink-0">
                  {[
                    { icon: Gamepad2, label: 'Grille',        value: '20×20' },
                    { icon: Zap,      label: 'Vitesse max',   value: '2.5×' },
                    { icon: Trophy,   label: 'High score',    value: 'Local' },
                    { icon: Star,     label: 'Contrôles',     value: 'ZQSD + ↑↓←→' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                      <s.icon className="w-4 h-4 text-pink-400 mx-auto mb-2" />
                      <p className="text-lg font-black text-white tabular-nums">{s.value}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Penalty Game */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Link href="/app/penalty" className="group block">
            <div className="relative rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/5 via-white/2 to-transparent p-8 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Live · Accessible à tous
              </div>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors text-2xl">
                      ⚽
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Penalty Shootout</h2>
                      <p className="text-amber-400/70 text-sm">Mini-jeu · Tirs au but</p>
                    </div>
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-5 max-w-lg">
                    Jeu de tirs au but — choisis ta zone de tir (6 zones), le gardien plonge aléatoirement.
                    Suivi du score en temps réel, précision, série de buts consécutifs.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['React', 'Next.js', 'CSS Animations', 'Tailwind'].map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-amber-500/8 text-amber-400 border border-amber-500/20">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                    Jouer maintenant <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:w-72 flex-shrink-0">
                  {[
                    { icon: Gamepad2, label: 'Zones de tir',   value: '6' },
                    { icon: Trophy,   label: 'Gardien',        value: 'Aléatoire' },
                    { icon: Zap,      label: 'Série max',      value: 'Illimitée' },
                    { icon: Star,     label: 'Précision',      value: 'Trackée' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                      <s.icon className="w-4 h-4 text-amber-400 mx-auto mb-2" />
                      <p className="text-lg font-black text-white tabular-nums">{s.value}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Coming soon cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {COMING_SOON.map((app, i) => {
            const c = COLOR_MAP[app.color]
            return (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`relative rounded-2xl border ${c.border} bg-white/2 p-6 hover:bg-white/4 transition-all duration-300 hover:shadow-xl ${c.glow} overflow-hidden`}
              >
                {/* Coming soon overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  <Lock className="w-3 h-3 text-gray-600" />
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider">Bientôt</span>
                </div>

                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 ${c.icon}`}>
                  <app.icon className="w-5 h-5" />
                </div>

                <h3 className="text-white font-semibold text-lg mb-2">{app.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{app.desc}</p>

                <div className="flex flex-wrap gap-1.5">
                  {app.tags.map((tag) => (
                    <span key={tag} className={`px-2.5 py-1 rounded-full text-[11px] border ${c.tag}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-300 transition-colors"
          >
            ← Retour au portfolio
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
