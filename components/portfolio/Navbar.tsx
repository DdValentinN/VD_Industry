'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'À propos', href: '/#about' },
  { label: 'Compétences', href: '/#skills' },
  { label: 'Expériences', href: '/#experience' },
  { label: 'Formation', href: '/#education' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isApp = pathname.startsWith('/app')

  // All hooks must be called before any early return
  useEffect(() => {
    if (isApp) return
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isApp])

  // Hide navbar inside the /app tool (has its own sidebar)
  if (isApp) return null

  const handleNavClick = (href: string) => {
    setOpen(false)
    if (!isHome && href.startsWith('/#')) return
    if (href.startsWith('/#')) {
      const id = href.slice(2)
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'backdrop-blur-2xl bg-[#0a0a0a]/80 border-b border-white/8 shadow-2xl shadow-black/50'
          : 'bg-transparent',
      )}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/25 transition-all">
            <span className="text-emerald-400 font-black text-sm leading-none">VD</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-semibold text-sm tracking-tight">Valentin Delattre</span>
            <span className="text-gray-600 text-[10px] tracking-[0.15em] uppercase">Portfolio</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => handleNavClick(l.href)}
              className="text-sm text-gray-500 hover:text-white transition-colors duration-200 relative group"
            >
              {l.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-400 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/applications"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
              pathname === '/applications'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10',
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            Applications
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="backdrop-blur-2xl bg-[#0a0a0a]/95 border-b border-white/8 px-6 pb-6 pt-2 space-y-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => handleNavClick(l.href)}
              className="block text-sm text-gray-400 hover:text-white transition-colors py-1"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/applications"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-sm"
          >
            <Layers className="w-3.5 h-3.5" />
            Applications
          </Link>
        </div>
      </div>
    </header>
  )
}
