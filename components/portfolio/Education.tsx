'use client'

import { motion } from 'framer-motion'
import { GraduationCap, BookOpen } from 'lucide-react'

const DEGREES = [
  {
    school: 'ISEN Lille',
    degree: 'Cycle Ingénieur par Apprentissage',
    field: 'Informatique & Systèmes numériques',
    period: '2024 — Présent',
    level: '4ème année',
    highlight: true,
  },
  {
    school: 'Pôle Baudimont / ISEN',
    degree: 'BTS SIO — SLAM',
    field: 'Solutions Logicielles et Applications Métiers + Prépa ISEN',
    period: '2022 — 2024',
    level: 'Bac+2',
    highlight: false,
  },
  {
    school: 'Lycée Baudimont St-Charles',
    degree: 'Baccalauréat Général',
    field: 'Spécialité Mathématiques · NSI',
    period: '2019 — 2022',
    level: 'Bac',
    highlight: false,
  },
]

const MOOCS = [
  {
    title: 'MOOC OSINT — Corporate Recon',
    platform: 'HackTheBox',
    year: '2024',
    color: 'text-violet-400',
    bg: 'bg-violet-500/8 border-violet-500/20',
  },
  {
    title: 'Développeur Python — Formation Complète',
    platform: 'Udemy',
    year: '2020',
    color: 'text-sky-400',
    bg: 'bg-sky-500/8 border-sky-500/20',
  },
  {
    title: 'HTML5 / CSS3',
    platform: 'OpenClassrooms',
    year: '2021-2022',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8 border-emerald-500/20',
  },
  {
    title: 'Mathématiques — Terminale & Expert',
    platform: 'Acadomia',
    year: '2021-2022',
    color: 'text-amber-400',
    bg: 'bg-amber-500/8 border-amber-500/20',
  },
  {
    title: 'Certification Pix',
    platform: 'Pix',
    year: '2023',
    color: 'text-pink-400',
    bg: 'bg-pink-500/8 border-pink-500/20',
  },
]

export function Education() {
  return (
    <section id="education" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-14"
        >
          <span className="text-[10px] text-emerald-400 tracking-[0.25em] uppercase font-medium">05</span>
          <span className="w-8 h-px bg-emerald-400/40" />
          <span className="text-[10px] text-gray-600 tracking-[0.25em] uppercase">Formation</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-white mb-12"
        >
          Parcours <span className="text-emerald-400">académique</span>
        </motion.h2>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Degrees */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-400 font-medium">Diplômes</span>
            </div>
            <div className="space-y-4">
              {DEGREES.map((deg, i) => (
                <motion.div
                  key={deg.school}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl border p-5 transition-all duration-300 ${
                    deg.highlight
                      ? 'border-emerald-500/25 bg-emerald-500/4 hover:bg-emerald-500/7'
                      : 'border-white/8 bg-white/2 hover:bg-white/4'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          deg.highlight
                            ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                            : 'text-gray-500 bg-white/5 border-white/10'
                        }`}>
                          {deg.level}
                        </span>
                        {deg.highlight && (
                          <span className="text-[10px] text-emerald-400/70 animate-pulse">● En cours</span>
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-sm">{deg.degree}</h3>
                      <p className="text-emerald-400/80 text-xs mt-0.5">{deg.school}</p>
                      <p className="text-gray-600 text-xs mt-1">{deg.field}</p>
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">{deg.period}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* MOOCs & Certifications */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-400 font-medium">MOOCs &amp; Certifications</span>
            </div>
            <div className="space-y-3">
              {MOOCS.map((mooc, i) => (
                <motion.div
                  key={mooc.title}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 ${mooc.bg} transition-all duration-200 hover:opacity-90`}
                >
                  <div>
                    <p className={`text-sm font-medium ${mooc.color}`}>{mooc.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{mooc.platform}</p>
                  </div>
                  <span className="text-xs text-gray-700 whitespace-nowrap">{mooc.year}</span>
                </motion.div>
              ))}
            </div>

            {/* Language certs */}
            <div className="mt-6 rounded-2xl border border-white/8 bg-white/2 p-5">
              <p className="text-xs text-gray-600 tracking-[0.2em] uppercase mb-4">Certifications linguistiques</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🇬🇧</span>
                    <div>
                      <p className="text-sm text-white">Cambridge — B2</p>
                      <p className="text-xs text-gray-600">Certifié</p>
                    </div>
                  </div>
                  <div className="w-24 h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <motion.div
                      className="h-full bg-sky-400 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: '72%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🇺🇸</span>
                    <div>
                      <p className="text-sm text-white">TOEIC</p>
                      <p className="text-xs text-gray-600">En préparation B2</p>
                    </div>
                  </div>
                  <div className="w-24 h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-400 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: '60%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🇫🇷</span>
                    <div>
                      <p className="text-sm text-white">Français</p>
                      <p className="text-xs text-gray-600">Langue maternelle</p>
                    </div>
                  </div>
                  <div className="w-24 h-1.5 rounded-full bg-white/6 overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
