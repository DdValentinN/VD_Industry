'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { UserId, UserRole } from '@/lib/auth'

interface AuthContextValue {
  isLoggedIn: boolean
  isAdmin: boolean
  userId: UserId | null
  role: UserRole | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  isAdmin: false,
  userId: null,
  role: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin]       = useState(false)
  const [userId, setUserId]         = useState<UserId | null>(null)
  const [role, setRole]             = useState<UserRole | null>(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        setIsLoggedIn(d.isLoggedIn ?? false)
        setIsAdmin(d.isAdmin ?? false)
        setUserId(d.userId ?? null)
        setRole(d.role ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function login(username: string, password: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setIsLoggedIn(true)
        setIsAdmin(data.role === 'admin')
        setUserId(data.userId)
        setRole(data.role)
        return { success: true }
      }
      return { success: false, error: data.error ?? 'Identifiants incorrects' }
    } catch {
      return { success: false, error: 'Erreur réseau' }
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setIsLoggedIn(false)
    setIsAdmin(false)
    setUserId(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, userId, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
