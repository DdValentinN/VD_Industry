'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { Dumbbell, TrendingUp, Code2, ShoppingBag } from 'lucide-react'

interface AboutProps {
  nbVendus: number
  beneficeTotal: number
  margeMoyenne: number
}

function CountUp({ target, decimals = 0, prefix = '', suffix = '' }: { target: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<number | null>(null)
  const nodeRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(nodeRef, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1800
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(eased * target)
      if (progress < 1) ref.current = requestAnimationFrame(animate)
    }
    ref.current = requestAnimationFrame(animate)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [inView, target])

  return (
    <span ref={nodeRef}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  )
}

const INTERESTS = [
  { icon: Dumbbell, label: 'Musculation', desc: 'Discipline & rigueur au quotidien' },
  { icon: TrendingUp, label: 'Investissements', desc: 'Bourse & analyse financière' },
  { icon: ShoppingBag, label: 'Achat-revente', desc: 'Vinted — 85 articles gérés' },
  { icon: Code2, label: 'Développement', desc: 'Projets perso & outils data' },
]

export function About({ nbVendus, beneficeTotal, margeMoyenne }: AboutProps) {
  return (
    <section id="about" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-14"
        >
          <span className="text-[10px] text-emerald-400 tracking-[0.25em] uppercase font-medium">02</span>
          <span className="w-8 h-px bg-emerald-400/40" />
          <span className="text-[10px] text-gray-600 tracking-[0.25em] uppercase">À propos</span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — photo + bio */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Photo */}
            <div className="relative mb-8 inline-block">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 blur-md" />
              <div className="relative w-full max-w-xs rounded-2xl overflow-hidden border border-white/10 aspect-[4/5]">
                <Image
                  src="/me.jpg"
                  alt="Valentin Delattre"
                  fill
                  className="object-cover object-top"
                  priority
                  onError={() => {}}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-white">En alternance · Orange</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
              Curieux, analytique
              <br />
              <span className="text-emerald-400">&amp; orienté résultats.</span>
            </h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              <p>
                Étudiant en 4ème année d&apos;ingénieur à l&apos;<span className="text-white">ISEN Lille</span>,
                je suis en alternance chez <span className="text-orange-400">Orange</span> où je développe
                des outils d&apos;analyse sous Excel et Power BI pour piloter la performance
                des sous-traitants.
              </p>
              <p>
                Au-delà du parcours classique, je suis très investi dans la musculation —
                une discipline qui forge la rigueur — et je m&apos;intéresse activement à
                la bourse et aux investissements pour comprendre les enjeux financiers.
              </p>
              <p>
                En parallèle, je gère une activité d&apos;achat-revente sur Vinted,
                avec un outil de suivi que j&apos;ai conçu moi-même pour maximiser les marges
                et prendre de meilleures décisions.
              </p>
            </div>
          </motion.div>

          {/* Right — stats + interests */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Live Vinted stats */}
            <div className="rounded-2xl border border-white/8 bg-white/2 p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-gray-500 tracking-wider uppercase">Stats Vinted · Live</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Articles vendus', value: nbVendus, decimals: 0, suffix: '' },
                  { label: 'Bénéfice net', value: beneficeTotal, decimals: 0, prefix: '', suffix: '€' },
                  { label: 'Marge moy.', value: margeMoyenne * 100, decimals: 1, suffix: '%' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl font-black text-emerald-400 tabular-nums">
                      <CountUp target={s.value} decimals={s.decimals} prefix={s.prefix ?? ''} suffix={s.suffix} />
                    </div>
                    <div className="text-[11px] text-gray-600 mt-1 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <p className="text-xs text-gray-600 tracking-[0.2em] uppercase mb-4">Centres d&apos;intérêt</p>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 + 0.2 }}
                    className="group flex gap-3 p-4 rounded-xl border border-white/7 bg-white/2 hover:bg-white/4 hover:border-emerald-500/20 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                      <item.icon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-[11px] text-gray-600 leading-tight mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div className="rounded-2xl border border-white/8 bg-white/2 p-5 space-y-2.5">
              <p className="text-xs text-gray-600 tracking-[0.2em] uppercase mb-3">Contact</p>
              {[
                { label: 'Email', value: 'delattre.v@outlook.fr', href: 'mailto:delattre.v@outlook.fr' },
                { label: 'Tél.', value: '06 38 92 95 64', href: 'tel:0638929564' },
                { label: 'LinkedIn', value: '@valentin-delattre', href: 'https://linkedin.com/in/valentin-delattre' },
              ].map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-between group"
                >
                  <span className="text-xs text-gray-600">{c.label}</span>
                  <span className="text-sm text-gray-300 group-hover:text-emerald-400 transition-colors">{c.value}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
