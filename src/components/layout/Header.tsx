import { Moon, Sun, Menu, Bell } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLocation } from 'react-router-dom'

interface HeaderProps {
  onMenuClick: () => void
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/organizacoes': 'Organizações',
  '/metricas/agendamentos': 'Agendamentos',
  '/metricas/faturamento': 'Faturamento',
  '/metricas/servicos': 'Serviços',
  '/metricas/funcionarios': 'Funcionários',
  '/metricas/clientes': 'Clientes',
  '/metricas/instancias': 'Instâncias',
  '/metricas/planos': 'Planos',
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const getPageTitle = () => {
    if (location.pathname.startsWith('/organizacoes/')) return 'Detalhes da Organização'
    return pageTitles[location.pathname] || 'Admin'
  }

  const getBreadcrumb = () => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts.length === 0) return null
    return parts.map((part, i) => {
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
      const isLast = i === parts.length - 1
      return (
        <span key={i} className="flex items-center">
          {i > 0 && <span className="mx-1.5 text-[#d8ccc4] dark:text-[#2D2925]">/</span>}
          <span className={isLast ? 'text-[#2a2420] dark:text-[#F5F0EB] font-medium' : 'text-[#6b5d57] dark:text-[#7A716A]'}>
            {label}
          </span>
        </span>
      )
    })
  }

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 border-b border-[#d8ccc4] dark:border-[#2D2925] bg-white/80 dark:bg-[#0D0B0A]/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB] transition-colors"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
            {getPageTitle()}
          </h2>
          <div className="hidden md:flex items-center text-xs">
            {getBreadcrumb()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/50 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#db6f57] dark:bg-[#E07A62] rounded-full" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/50 transition-colors"
          title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  )
}
