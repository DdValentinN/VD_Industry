'use client'

import { motion } from 'framer-motion'
import { Briefcase, ExternalLink } from 'lucide-react'

const EXPERIENCES = [
  {
    company: 'Orange',
    role: 'Ingénieur Data Analyst — Alternance',
    period: 'Oct. 2024 — Présent',
    location: 'UCI Nord de France · DIST',
    color: 'orange',
    current: true,
    tags: ['Power BI', 'Excel', 'Data Analytics', 'Pilotage sous-traitants'],
    description:
      'Développement d\'outils Excel et Power BI pour l\'analyse des performances des sous-traitants au sein de la Direction de l\'Intervention Sous Traitée. Pilotage de la performance, accompagnement à la prise de décision.',
  },
  {
    company: 'Axians Cyberdéfense',
    role: 'Stagiaire Cybersécurité',
    period: 'Jan. 2024 — Fév. 2024',
    location: 'Stage 2ème année BTS',
    color: 'blue',
    current: false,
    tags: ['Python', 'OSINT', 'Kali Linux', 'Pentest'],
    description:
      'Réalisation d\'un script Python automatisant les méthodes OSINT passives dans le cadre d\'un processus de Pentest. Identification d\'informations publiques sur des systèmes cibles.',
  },
  {
    company: 'Opcommerce',
    role: 'Stagiaire Développement Informatique',
    period: 'Mai 2023 — Juil. 2023',
    location: 'Stage 1ère année BTS',
    color: 'emerald',
    current: false,
    tags: ['Power BI', 'SQL', 'BDD', 'Gouvernance des données'],
    description:
      'Mission de gouvernance des données : gestion de bases de données et développement de rapports Power BI pour visualiser et analyser les indicateurs métier.',
  },
  {
    company: 'SDIS 62',
    role: 'Stagiaire Programmation & Développement Web',
    period: 'Août 2021 & Août 2022',
    location: 'Stage lycée',
    color: 'red',
    current: false,
    tags: ['Développement web', 'Programmation'],
    description:
      'Double stage de découverte en programmation et développement web au sein du Service Départemental d\'Incendie et de Secours du Pas-de-Calais.',
  },
]

const COLOR_MAP: Record<string, { dot: string; line: string; badge: string; border: string }> = {
  orange: {
    dot: 'bg-orange-400 border-orange-400/30 shadow-orange-400/40',
    line: 'from-orange-400/40',
    badge: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
    border: 'border-orange-500/20',
  },
  blue: {
    dot: 'bg-sky-400 border-sky-400/30 shadow-sky-400/40',
    line: 'from-sky-400/40',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    border: 'border-sky-500/20',
  },
  emerald: {
    dot: 'bg-emerald-400 border-emerald-400/30 shadow-emerald-400/40',
    line: 'from-emerald-400/40',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    border: 'border-emerald-500/20',
  },
  red: {
    dot: 'bg-red-400 border-red-400/30 shadow-red-400/40',
    line: 'from-red-400/40',
    badge: 'bg-red-500/10 text-red-400 border-red-500/25',
    border: 'border-red-500/20',
  },
}

export function Experience() {
  return (
    <section id="experience" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-14"
        >
          <span className="text-[10px] text-emerald-400 tracking-[0.25em] uppercase font-medium">04</span>
          <span className="w-8 h-px bg-emerald-400/40" />
          <span className="text-[10px] text-gray-600 tracking-[0.25em] uppercase">Expériences</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-white mb-3"
        >
          Stages &amp; <span className="text-emerald-400">Alternance</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 mb-14 max-w-xl"
        >
          4 expériences en entreprise dans la data, la cybersécurité et le développement.
        </motion.p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-white/6" />

          <div className="space-y-8">
            {EXPERIENCES.map((exp, i) => {
              const c = COLOR_MAP[exp.color]
              return (
                <motion.div
                  key={exp.company}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative pl-14 md:pl-20"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-1.5 md:left-3.5 top-5 w-5 h-5 rounded-full border-2 ${c.dot} shadow-lg flex items-center justify-center`}>
                    {exp.current && (
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    )}
                  </div>

                  {/* Card */}
                  <div className={`rounded-2xl border ${c.border} bg-white/2 hover:bg-white/4 transition-all duration-300 p-6`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-xs text-gray-500">{exp.location}</span>
                          {exp.current && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-medium">
                              En cours
                            </span>
                          )}
                        </div>
                        <h3 className="text-white font-semibold text-base">{exp.company}</h3>
                        <p className="text-gray-400 text-sm mt-0.5">{exp.role}</p>
                      </div>
                      <span className="text-xs text-gray-600 whitespace-nowrap">{exp.period}</span>
                    </div>

                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{exp.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {exp.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2.5 py-1 rounded-full text-[11px] border ${c.badge}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
