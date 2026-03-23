import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { AgenteIADashboard } from './AgenteIADashboard'
import { BaseConhecimento } from './BaseConhecimento'
import { Atendimentos } from './Atendimentos'
import { Configuracoes } from './Configuracoes'
import {
  LayoutDashboard,
  BookOpen,
  Headphones,
  Settings,
} from 'lucide-react'

type Tab = 'dashboard' | 'base-conhecimento' | 'atendimentos' | 'configuracoes'

const tabs = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'base-conhecimento' as Tab, label: 'Base de Conhecimento', icon: BookOpen },
  { id: 'atendimentos' as Tab, label: 'Atendimentos', icon: Headphones },
  { id: 'configuracoes' as Tab, label: 'Configurações', icon: Settings },
]

export function AgenteIALayout() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as Tab | null
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && tabs.some(t => t.id === tabParam) ? tabParam : 'dashboard'
  )

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">
          Agente IA - Suporte N1
        </h1>
        <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4] mt-1">
          Gerencie o agente de atendimento inteligente, base de conhecimento e monitore os atendimentos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#faf8f6] dark:bg-[#1A1715] p-1 rounded-xl border border-[#d8ccc4] dark:border-[#2D2925] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-white dark:bg-[#2D2925] text-[#db6f57] dark:text-[#E07A62] shadow-sm'
                : 'text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]'
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && <AgenteIADashboard />}
      {activeTab === 'base-conhecimento' && <BaseConhecimento />}
      {activeTab === 'atendimentos' && <Atendimentos />}
      {activeTab === 'configuracoes' && <Configuracoes />}
    </div>
  )
}
