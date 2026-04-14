'use client'

import { motion } from 'framer-motion'
import { Mail, Github, Linkedin, Instagram, ArrowUpRight, Phone } from 'lucide-react'

const SOCIALS = [
  {
    icon: Mail,
    label: 'Email',
    handle: 'delattre.v@outlook.fr',
    href: 'mailto:delattre.v@outlook.fr',
    color: 'hover:border-emerald-500/40 hover:bg-emerald-500/5',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Github,
    label: 'GitHub',
    handle: 'DdValentinN',
    href: 'https://github.com/DdValentinN',
    color: 'hover:border-white/20 hover:bg-white/5',
    iconColor: 'text-white',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    handle: '@valentin-delattre',
    href: 'https://linkedin.com/in/valentin-delattre',
    color: 'hover:border-sky-500/40 hover:bg-sky-500/5',
    iconColor: 'text-sky-400',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    handle: '_valo_u',
    href: 'https://instagram.com/_valo_u',
    color: 'hover:border-pink-500/40 hover:bg-pink-500/5',
    iconColor: 'text-pink-400',
  },
  {
    icon: Phone,
    label: 'Téléphone',
    handle: '06 38 92 95 64',
    href: 'tel:0638929564',
    color: 'hover:border-amber-500/40 hover:bg-amber-500/5',
    iconColor: 'text-amber-400',
  },
]

export function Contact() {
  return (
    <section id="contact" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-14"
        >
          <span className="text-[10px] text-emerald-400 tracking-[0.25em] uppercase font-medium">06</span>
          <span className="w-8 h-px bg-emerald-400/40" />
          <span className="text-[10px] text-gray-600 tracking-[0.25em] uppercase">Contact</span>
        </motion.div>

        {/* Big CTA text */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white leading-tight"
          >
            Travaillons
            <br />
            <span className="text-emerald-400">ensemble.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-gray-500 text-lg mt-4 max-w-lg"
          >
            Ouvert aux opportunités d&apos;alternance, de stage ou de collaboration
            sur des projets data &amp; développement. N&apos;hésitez pas à me contacter.
          </motion.p>
        </div>

        {/* Social grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SOCIALS.map((s, i) => (
            <motion.a
              key={s.label}
              href={s.href}
              target={s.href.startsWith('http') ? '_blank' : undefined}
              rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`group flex items-center gap-4 p-5 rounded-2xl border border-white/8 bg-white/2 transition-all duration-300 ${s.color}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${s.iconColor}`}>
                <s.icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-600 mb-0.5">{s.label}</p>
                <p className="text-sm text-gray-300 group-hover:text-white truncate transition-colors">{s.handle}</p>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 ml-auto flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </motion.a>
          ))}
        </div>

        {/* Availability note */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/8 bg-white/2"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-gray-400">
            Disponible pour alternance · <span className="text-white">Région Lilloise &amp; Remote</span>
          </span>
        </motion.div>
      </div>
    </section>
  )
}
