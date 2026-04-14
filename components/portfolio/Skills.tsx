'use client'

import { motion } from 'framer-motion'
import { BarChart3, Code2, Shield, Globe } from 'lucide-react'

const SKILL_GROUPS = [
  {
    icon: BarChart3,
    label: 'Data & Analytics',
    color: 'emerald',
    desc: 'Cœur de mon alternance chez Orange',
    skills: [
      { name: 'Power BI', level: 90 },
      { name: 'Excel avancé', level: 92 },
      { name: 'Python', level: 60 },
      { name: 'SQL', level: 45 },
    ],
  },
  {
    icon: Code2,
    label: 'Développement',
    color: 'sky',
    desc: 'Dev web & outils perso',
    skills: [
      { name: 'HTML5 / CSS3', level: 65 },
      { name: 'JavaScript', level: 45 },
      { name: 'Next.js / React', level: 40 },
      { name: 'Tailwind CSS', level: 50 },
    ],
  },
  {
    icon: Shield,
    label: 'Cybersécurité',
    color: 'violet',
    desc: 'Stage Axians Cyberdéfense',
    skills: [
      { name: 'Kali Linux', level: 55 },
      { name: 'OSINT passif', level: 65 },
      { name: 'Pentest basics', level: 50 },
      { name: 'Scripts Python', level: 60 },
    ],
  },
  {
    icon: Globe,
    label: 'Langues & Soft Skills',
    color: 'amber',
    desc: 'Communication & ouverture',
    skills: [
      { name: 'Français', level: 100 },
      { name: 'Anglais B2 (Cambridge)', level: 72 },
      { name: 'TOEIC en préparation', level: 65 },
      { name: 'Communication orale', level: 85 },
    ],
  },
]

const COLOR_MAP: Record<string, { bar: string; badge: string; icon: string; border: string }> = {
  emerald: {
    bar: 'bg-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    icon: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    border: 'border-emerald-500/15 hover:border-emerald-500/30',
  },
  sky: {
    bar: 'bg-sky-400',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    icon: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    border: 'border-sky-500/15 hover:border-sky-500/30',
  },
  violet: {
    bar: 'bg-violet-400',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
    icon: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    border: 'border-violet-500/15 hover:border-violet-500/30',
  },
  amber: {
    bar: 'bg-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    icon: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    border: 'border-amber-500/15 hover:border-amber-500/30',
  },
}

function SkillBar({ name, level, bar }: { name: string; level: number; bar: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-gray-300">{name}</span>
        <span className="text-xs text-gray-600 tabular-nums">{level}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${bar}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  )
}

export function Skills() {
  return (
    <section id="skills" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-14"
        >
          <span className="text-[10px] text-emerald-400 tracking-[0.25em] uppercase font-medium">03</span>
          <span className="w-8 h-px bg-emerald-400/40" />
          <span className="text-[10px] text-gray-600 tracking-[0.25em] uppercase">Compétences</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-white mb-3"
        >
          Stack technique &amp;{' '}
          <span className="text-emerald-400">savoir-faire</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 mb-12 max-w-xl"
        >
          Compétences acquises en formation, en alternance et sur des projets personnels.
          Les niveaux reflètent une auto-évaluation honnête.
        </motion.p>

        {/* Bento grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {SKILL_GROUPS.map((group, i) => {
            const c = COLOR_MAP[group.color]
            return (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-2xl border ${c.border} bg-white/2 p-6 transition-all duration-300 hover:bg-white/4`}
              >
                {/* Card header */}
                <div className="flex items-start gap-3 mb-6">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                    <group.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{group.label}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">{group.desc}</p>
                  </div>
                </div>

                {/* Skill bars */}
                <div className="space-y-3.5">
                  {group.skills.map((s) => (
                    <SkillBar key={s.name} name={s.name} level={s.level} bar={c.bar} />
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Tool tags */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {['Power BI', 'Excel', 'Python', 'SQL', 'HTML/CSS', 'JavaScript', 'Next.js', 'Prisma', 'Kali Linux', 'OSINT', 'Git', 'VS Code', 'Tailwind', 'Certification Pix'].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs text-gray-500 border border-white/8 bg-white/2 hover:border-white/15 hover:text-gray-300 transition-all cursor-default"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
