'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BarChart3, ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react'

export function Apps() {
  const features = [
    { icon: TrendingUp, label: 'Suivi en temps réel' },
    { icon: BarChart3, label: 'Graphiques & KPIs' },
    { icon: Shield, label: 'Données locales, privées' },
    { icon: Zap, label: 'Interface ultra-rapide' },
  ]

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-emerald-500 text-sm font-medium tracking-widest uppercase">
            Application
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mt-3">
            Mon outil de gestion
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Link
            href="/app"
            className="group block max-w-2xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-emerald-500/5 p-10 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_60px_rgba(16,185,129,0.1)]"
          >
            <div className="flex items-start gap-6 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                <BarChart3 className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Suivi Vinted Pro</h3>
                <p className="text-gray-400">
                  Reproduction améliorée de mon fichier Excel — gestion complète des
                  articles, calcul automatique des marges, visualisations avancées.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-2.5 text-gray-400 text-sm">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  {f.label}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Dashboard · Ventes · Paramètres</span>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold group-hover:gap-3 transition-all">
                Ouvrir l&apos;app
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
