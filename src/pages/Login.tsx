import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Mail, Lock, Moon, Sun, Eye, EyeOff } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !senha) {
      setError('Preencha todos os campos')
      return
    }

    setLoading(true)
    try {
      await login(email, senha)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(
        err.response?.status === 401
          ? 'Email ou senha incorretos'
          : err.response?.status === 403
          ? 'Acesso não autorizado. Apenas administradores podem acessar.'
          : 'Erro ao fazer login. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#faf8f6] to-white dark:from-[#0D0B0A] dark:to-[#141210] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#db6f57]/10 to-[#8b3d35]/10 dark:from-[#E07A62]/5 dark:to-[#A8524A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#4f6f64]/10 to-[#5a7a6e]/10 dark:from-[#6B8F82]/5 dark:to-[#4f6f64]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2.5 rounded-xl text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-white dark:hover:bg-[#1A1715] border border-transparent hover:border-[#d8ccc4] dark:hover:border-[#2D2925] transition-all"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="rounded-2xl border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715]/95 dark:backdrop-blur-md p-8 shadow-xl shadow-black/5 dark:shadow-black/20">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#db6f57] to-[#8b3d35] dark:from-[#E07A62] dark:to-[#A8524A] flex items-center justify-center mb-4 shadow-lg shadow-[#db6f57]/20 dark:shadow-[#E07A62]/20">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <h1 className="text-xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">Bellory Admin</h1>
            <p className="text-sm text-[#6b5d57] dark:text-[#7A716A] mt-1">Painel administrativo</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="text"
              placeholder="admin@bellory.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              autoComplete="email"
            />

            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              leftIcon={<Lock size={18} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-[#2a2420] dark:hover:text-[#F5F0EB] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button type="submit" fullWidth size="lg" isLoading={loading}>
              Entrar
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#6b5d57] dark:text-[#7A716A] mt-6">
          Bellory &copy; {new Date().getFullYear()} - Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
