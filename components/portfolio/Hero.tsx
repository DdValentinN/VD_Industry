'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Github, ChevronDown, MapPin, Mail } from 'lucide-react'

const ROLES = ['Data Analyst', 'Étudiant Ingénieur', 'Développeur Web', 'Entrepreneur']
const NAME_1 = 'Valentin'
const NAME_2 = 'Delattre'

export function Hero() {
  const [roleIdx, setRoleIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setRoleIdx((i) => (i + 1) % ROLES.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <motion.div
          className="absolute top-1/3 right-[15%] w-[500px] h-[500px] rounded-full bg-emerald-500/7 blur-[130px]"
          animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-[8%] w-[320px] h-[320px] rounded-full bg-sky-500/5 blur-[100px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 w-full">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs tracking-wider uppercase mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Disponible · Alternance 2026
          <span className="w-px h-3 bg-emerald-500/30" />
          <MapPin className="w-3 h-3 text-emerald-500/60" />
          <span className="text-emerald-500/70">Lille</span>
        </motion.div>

        {/* Two-column layout: text left, photo right */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          {/* Left — name + content */}
          <div className="flex-1 min-w-0">
            {/* Name — staggered per letter */}
            <div className="overflow-hidden mb-1">
              <motion.h1 className="text-[clamp(3.2rem,10vw,8rem)] font-black tracking-tighter leading-[0.88] text-white select-none">
                {NAME_1.split('').map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: '105%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.048, type: 'spring', stiffness: 130, damping: 18 }}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-8">
              <motion.h1 className="text-[clamp(3.2rem,10vw,8rem)] font-black tracking-tighter leading-[0.88] text-emerald-400 select-none">
                {NAME_2.split('').map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: '105%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.048, type: 'spring', stiffness: 130, damping: 18 }}
                    className="inline-block"
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.h1>
            </div>

            {/* Rotating role */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="block w-10 h-px bg-emerald-400/50" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={roleIdx}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="text-lg md:text-xl text-emerald-400 font-light tracking-wide"
                >
                  {ROLES[roleIdx]}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05, duration: 0.6 }}
              className="text-gray-400 text-base md:text-lg max-w-lg leading-relaxed mb-10"
            >
              Ingénieur en formation à l&apos;<span className="text-white font-medium">ISEN Lille</span>,
              en alternance chez{' '}
              <span className="text-orange-400 font-medium">Orange</span> en tant que Data Analyst.
              Passionné par la data, le développement et l&apos;entrepreneuriat.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/applications"
                className="group flex items-center gap-2.5 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 text-sm"
              >
                Mes Applications
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <a
                href="https://github.com/DdValentinN"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-3 border border-white/12 hover:border-white/25 bg-white/3 hover:bg-white/6 text-gray-300 hover:text-white rounded-xl transition-all duration-200 text-sm"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="mailto:delattre.v@outlook.fr"
                className="flex items-center gap-2.5 px-5 py-3 border border-white/12 hover:border-white/25 bg-white/3 hover:bg-white/6 text-gray-300 hover:text-white rounded-xl transition-all duration-200 text-sm"
              >
                <Mail className="w-4 h-4" />
                Contact
              </a>
            </motion.div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.35, duration: 0.5 }}
              className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-white/6"
            >
              {[
                { value: '4ème', label: 'Année ingénieur' },
                { value: '4', label: 'Stages & alternances' },
                { value: '2+', label: "Ans d'alternance" },
                { value: 'B2', label: 'Anglais Cambridge' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + i * 0.07 }}
                  className="flex flex-col"
                >
                  <span className="text-xl md:text-2xl font-black text-white tracking-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs text-gray-600 mt-0.5">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right — photo */}
          <motion.div
            className="flex-shrink-0 flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-3 rounded-3xl bg-emerald-500/10 blur-2xl" />
              {/* Photo */}
              <div className="relative w-64 h-80 md:w-72 md:h-96 lg:w-80 lg:h-[26rem] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src="/me.jpg"
                  alt="Valentin Delattre"
                  fill
                  className="object-cover object-[center_15%]"
                  priority
                  onError={() => {}}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* Name card overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">Valentin Delattre</p>
                      <p className="text-[10px] text-emerald-400 truncate">Data Analyst · Orange</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="text-[10px] text-gray-700 tracking-[0.2em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4 text-gray-700" />
        </motion.div>
      </motion.div>
    </section>
  )
}
