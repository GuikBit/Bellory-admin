import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../services/api'
import type { AssinaturaStatus } from '../types/assinatura'

interface User {
  id: number
  username: string
  nomeCompleto: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, senha: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  assinatura: AssinaturaStatus | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [assinatura, setAssinatura] = useState<AssinaturaStatus | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('bellory-admin-token')
    const storedUser = localStorage.getItem('bellory-admin-user')
    const storedAssinatura = localStorage.getItem('bellory-admin-assinatura')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        if (storedAssinatura) {
          setAssinatura(JSON.parse(storedAssinatura))
        }
      } catch {
        localStorage.removeItem('bellory-admin-token')
        localStorage.removeItem('bellory-admin-user')
        localStorage.removeItem('bellory-admin-assinatura')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, senha: string) => {
    const response = await api.post('/admin/auth/login', { username, password: senha })
    const token = response.data?.token;
    const user = response.data?.user;
    const assinaturaData = response.data?.organizacao?.assinatura ?? null

    setToken(token)
    setUser(user)
    setAssinatura(assinaturaData)
    localStorage.setItem('bellory-admin-token', token)
    localStorage.setItem('bellory-admin-user', JSON.stringify(user))
    if (assinaturaData) {
      localStorage.setItem('bellory-admin-assinatura', JSON.stringify(assinaturaData))
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setAssinatura(null)
    localStorage.removeItem('bellory-admin-token')
    localStorage.removeItem('bellory-admin-user')
    localStorage.removeItem('bellory-admin-assinatura')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!token && !!user,
      assinatura,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
