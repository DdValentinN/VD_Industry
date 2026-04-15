'use client'

import { useState } from 'react'
import { ExternalLink, Users, BarChart3, Activity, Calendar, Trophy, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const FEATURES = [
  { icon: Users, label: 'Effectif', desc: 'Gestion de l\'effectif par poste avec suivi des blessures et suspensions' },
  { icon: Activity, label: 'Live Match', desc: 'Suivi en temps réel avec événements, score et statistiques joueur' },
  { icon: BarChart3, label: 'Rapports', desc: 'Analyse post-match complète avec KPIs, radar et export PDF/CSV' },
  { icon: Trophy, label: 'Saison', desc: 'Tendances multi-matchs, classements et comparaisons de joueurs' },
  { icon: Calendar, label: 'Calendrier', desc: 'Vue calendrier des matchs et événements de l\'équipe' },
  { icon: Zap, label: 'Fitness', desc: 'Charge d\'entraînement, RPE, historique des blessures individuelles' },
]

export default function PerfTrackPage() {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00FF87]/5 blur-[120px] pointer-events-none" />

        <div className="relative p-6 sm:p-10 max-w-5xl mx-auto pt-8">
          {/* Back */}
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour aux applications
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#00FF87]/10 border border-[#00FF87]/25 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">⚽</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl sm:text-4xl font-black text-white">PerfTrack</h1>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#00FF87]/30 bg-[#00FF87]/10 text-[#00FF87] text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-gray-400">Dashboard analytics pour clubs de football amateurs</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['React 19', 'Vite', 'TypeScript', 'Supabase', 'Zustand', 'Recharts', 'Tailwind', 'Framer Motion'].map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-[#00FF87]/8 text-[#00FF87] border border-[#00FF87]/20">
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <a
            href="https://perftrack-ap4.netlify.app/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#00FF87] hover:bg-[#00FF87]/90 text-black font-bold text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00FF87]/25 mb-10"
          >
            <ExternalLink className="w-4 h-4" />
            Accéder au site
          </a>

          {/* Preview image */}
          <div className="relative mb-12 flex justify-center">
            {/* Glow background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full bg-[#00FF87]/10 blur-[80px]" />
            </div>

            {!imgError ? (
              <div className="relative group">
                {/* Neon border frame */}
                <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-b from-[#00FF87]/40 via-[#00FF87]/10 to-transparent blur-[2px]" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#00FF87]/10 border border-[#00FF87]/20 max-w-sm mx-auto">
                  <Image
                    src="/perftrack-preview.png"
                    alt="PerfTrack Preview"
                    width={400}
                    height={560}
                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    onError={() => setImgError(true)}
                  />
                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                  {/* Live badge on image */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-[#00FF87]/30 text-[#00FF87] text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse" />
                    PerfTrack Live
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <span className="text-5xl">⚽</span>
                <p className="text-gray-600 text-sm">Aperçu de l&apos;application</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-3">À propos</h2>
            <p className="text-gray-400 leading-relaxed max-w-2xl">
              PerfTrack est une application web développée en collaboration pour aider les staffs de clubs
              amateurs à analyser les performances de leur équipe. De la gestion de l&apos;effectif au suivi
              live des matchs, en passant par les rapports post-match détaillés et les statistiques de saison,
              PerfTrack centralise toutes les données sportives en un seul endroit.
            </p>
          </div>

          {/* Features grid */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-5">Fonctionnalités</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="rounded-xl border border-white/8 bg-white/2 p-4 hover:border-[#00FF87]/20 hover:bg-[#00FF87]/3 transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#00FF87]/10 border border-[#00FF87]/20 flex items-center justify-center">
                      <f.icon className="w-4 h-4 text-[#00FF87]" />
                    </div>
                    <p className="text-white font-semibold text-sm">{f.label}</p>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="rounded-2xl border border-[#00FF87]/15 bg-[#00FF87]/5 p-8 text-center">
            <p className="text-white font-semibold text-lg mb-2">Prêt à analyser tes performances ?</p>
            <p className="text-gray-500 text-sm mb-6">Accède à l&apos;application et connecte-toi avec ton compte.</p>
            <a
              href="https://perftrack-ap4.netlify.app/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3 rounded-xl bg-[#00FF87] hover:bg-[#00FF87]/90 text-black font-bold text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00FF87]/20"
            >
              <ExternalLink className="w-4 h-4" />
              Accéder au site
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
