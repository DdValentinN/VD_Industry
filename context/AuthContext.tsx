'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextValue {
  isAdmin: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  isAdmin: false,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin ?? false))
      .catch(() => setIsAdmin(false))
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
        setIsAdmin(true)
        return { success: true }
      }
      return { success: false, error: data.error ?? 'Identifiants incorrects' }
    } catch {
      return { success: false, error: 'Erreur réseau' }
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
