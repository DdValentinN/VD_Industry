'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Settings, ArrowLeft,
  TrendingUp, Menu, X, LogIn, LogOut, Shield, Lock, Users, Flame, Bot, Gamepad2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

const ADMIN_NAV = [
  { href: '/app',                 icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/app/ventes',          icon: ShoppingBag,     label: 'Ventes' },
  { href: '/app/finances',        icon: Users,           label: 'Plan Épargne 1.1' },
  { href: '/app/investissements', icon: TrendingUp,      label: 'Investissements' },
  { href: '/app/fitness',         icon: Flame,           label: 'Fitness' },
  { href: '/app/bot',             icon: Bot,             label: 'Bot Vinted' },
  { href: '/app/perftrack',       icon: Users,           label: 'PerfTrack' },
  { href: '/app/arsenal',         icon: Shield,          label: 'Arsenal FC' },
  { href: '/app/snake',           icon: Gamepad2,        label: 'Snake' },
  { href: '/app/penalty',         icon: Gamepad2,        label: 'Penalty' },
  { href: '/app/parametres',      icon: Settings,        label: 'Paramètres' },
]

// loukasbrz: Dashboard + Ventes + Investissements
const USER_NAV = [
  { href: '/app',                 icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/app/ventes',          icon: ShoppingBag,     label: 'Ventes' },
  { href: '/app/investissements', icon: TrendingUp,      label: 'Investissements' },
]

// axelbg (and future ventes-only users): Dashboard + Ventes only
const VENTES_ONLY_NAV = [
  { href: '/app',        icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/app/ventes', icon: ShoppingBag,     label: 'Ventes' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAdmin, isLoggedIn, userId, loading, logout } = useAuth()

  const navItems = isAdmin ? ADMIN_NAV : userId === 'axelbg' ? VENTES_ONLY_NAV : USER_NAV

  async function handleLogout() {
    await logout()
    router.push('/app/login')
    setMobileOpen(false)
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">VD Industry</p>
            <p className="text-emerald-500 text-xs mt-0.5">Suivi Vinted</p>
          </div>
        </div>

        {/* Session badge */}
        {!loading && (
          <div className={cn(
            'mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium w-fit',
            isAdmin
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : isLoggedIn
                ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
                : 'bg-white/5 border border-white/10 text-gray-600',
          )}>
            {isAdmin
              ? <><Shield className="w-2.5 h-2.5" /> Valentin</>
              : isLoggedIn
                ? <><Shield className="w-2.5 h-2.5" /> {userId}</>
                : <><Lock className="w-2.5 h-2.5" /> Non connecté</>
            }
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5',
              )}
            >
              <item.icon className={cn('w-4 h-4', active && 'text-emerald-400')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/8 space-y-1">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        ) : (
          <Link
            href="/app/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/8 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Se connecter
          </Link>
        )}
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au portfolio
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0d0d0d] border-b border-white/8 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="text-white font-bold text-sm">VD Industry</span>
          {isAdmin && <span className="text-[10px] text-emerald-400 ml-1">Admin</span>}
          {isLoggedIn && !isAdmin && <span className="text-[10px] text-sky-400 ml-1">{userId}</span>}
        </div>
        <div className="flex items-center gap-2">
          {!isLoggedIn && (
            <Link href="/app/login" className="text-xs text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/25 hover:bg-emerald-500/10 transition-colors">
              Login
            </Link>
          )}
          {isLoggedIn && (
            <button onClick={handleLogout} className="text-xs text-red-400 px-2 py-1 rounded-lg border border-red-500/25 hover:bg-red-500/10 transition-colors">
              Logout
            </button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        'lg:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-[#0d0d0d] border-r border-white/8 flex flex-col transition-transform duration-200',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <NavContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-[#0d0d0d] border-r border-white/8 h-screen sticky top-0">
        <NavContent />
      </aside>
    </>
  )
}
