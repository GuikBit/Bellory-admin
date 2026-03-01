import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../services/api'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('bellory-admin-token')
    const storedUser = localStorage.getItem('bellory-admin-user')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('bellory-admin-token')
        localStorage.removeItem('bellory-admin-user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, senha: string) => {
    const response = await api.post('/admin/auth/login', { username, password: senha })
    // const { token: newToken, usuario } = response.data.dados || response.data
    const token = response.data?.token;
    const user = response.data?.user;

    setToken(token)
    setUser(user)
    localStorage.setItem('bellory-admin-token', token)
    localStorage.setItem('bellory-admin-user', JSON.stringify(user))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('bellory-admin-token')
    localStorage.removeItem('bellory-admin-user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!token && !!user,
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
