import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  DollarSign,
  Scissors,
  Users,
  UserCheck,
  Smartphone,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/organizacoes', icon: Building2, label: 'Organizações' },
  { path: '/planos', icon: CreditCard, label: 'Planos' },
  { path: '/templates', icon: FileText, label: 'Templates' },
  {
    label: 'Métricas',
    children: [
      { path: '/metricas/agendamentos', icon: CalendarCheck, label: 'Agendamentos' },
      { path: '/metricas/faturamento', icon: DollarSign, label: 'Faturamento' },
      { path: '/metricas/servicos', icon: Scissors, label: 'Serviços' },
      { path: '/metricas/funcionarios', icon: UserCheck, label: 'Funcionários' },
      { path: '/metricas/clientes', icon: Users, label: 'Clientes' },
      { path: '/metricas/instancias', icon: Smartphone, label: 'Instâncias' },
      { path: '/metricas/planos', icon: CreditCard, label: 'Planos' },
    ],
  },
]

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation()
  const { logout, user } = useAuth()
  const [metricasOpen, setMetricasOpen] = useState(
    location.pathname.startsWith('/metricas')
  )

  const isMetricasActive = location.pathname.startsWith('/metricas')

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full flex flex-col border-r transition-all duration-300',
          'bg-white border-[#d8ccc4] dark:bg-[#1A1715] dark:border-[#2D2925]',
          // Desktop
          'lg:relative lg:translate-x-0',
          collapsed ? 'lg:w-[72px]' : 'lg:w-64',
          // Mobile
          isOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72',
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-[#d8ccc4] dark:border-[#2D2925] shrink-0',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#db6f57] to-[#8b3d35] dark:from-[#E07A62] dark:to-[#A8524A] flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#2a2420] dark:text-[#F5F0EB]">Bellory</h1>
                <span className="text-[10px] text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider">Admin</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#db6f57] to-[#8b3d35] dark:from-[#E07A62] dark:to-[#A8524A] flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="lg:hidden text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map((item) => {
            if ('children' in item) {
              return (
                <div key={item.label} className="mb-1">
                  <button
                    onClick={() => {
                      if (collapsed) return
                      setMetricasOpen(!metricasOpen)
                    }}
                    className={cn(
                      'flex items-center w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isMetricasActive
                        ? 'text-[#db6f57] dark:text-[#E07A62]'
                        : 'text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/50',
                      collapsed && 'justify-center px-0'
                    )}
                  >
                    <LayoutDashboard size={18} className="shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="ml-3 flex-1 text-left">{item.label}</span>
                        <ChevronRight
                          size={14}
                          className={cn(
                            'transition-transform duration-200',
                            metricasOpen && 'rotate-90'
                          )}
                        />
                      </>
                    )}
                  </button>
                  {!collapsed && metricasOpen && item.children && (
                    <div className="ml-3 mt-1 space-y-0.5 border-l border-[#d8ccc4] dark:border-[#2D2925] pl-3">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={onClose}
                          className={({ isActive }) => cn(
                            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                            isActive
                              ? 'bg-[#db6f57]/10 text-[#db6f57] font-medium dark:bg-[#E07A62]/10 dark:text-[#E07A62]'
                              : 'text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/50'
                          )}
                        >
                          <child.icon size={16} />
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => cn(
                  'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-0.5',
                  isActive
                    ? 'bg-[#db6f57]/10 text-[#db6f57] dark:bg-[#E07A62]/10 dark:text-[#E07A62]'
                    : 'text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/50',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#d8ccc4] dark:border-[#2D2925] p-3 shrink-0">
          {/* Collapse toggle - desktop only */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-full rounded-lg px-3 py-2 text-sm text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/50 transition-colors mb-2"
          >
            {collapsed ? <ChevronRight size={18} /> : (
              <>
                <ChevronLeft size={18} />
                <span className="ml-2">Recolher</span>
              </>
            )}
          </button>

          {/* User info & logout */}
          <div className={cn(
            'flex items-center rounded-lg px-3 py-2',
            collapsed ? 'justify-center' : 'gap-3'
          )}>
            <div className="w-8 h-8 rounded-full bg-[#4f6f64] dark:bg-[#6B8F82] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-medium">
                {user?.nomeCompleto?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] truncate">
                  {user?.nomeCompleto || 'Admin'}
                </p>
                <p className="text-xs text-[#6b5d57] dark:text-[#7A716A] truncate">
                  {user?.email || 'admin@bellory.com'}
                </p>
              </div>
            )}
            <button
              onClick={logout}
              className="text-[#6b5d57] dark:text-[#7A716A] hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
