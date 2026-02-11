import { useState } from 'react'
import { useMetricasInstancias } from '../../queries/useMetricas'
import { MetricCard } from '../../components/ui/MetricCard'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { StatusIndicator } from '../../components/ui/StatusIndicator'
import { MetricCardSkeleton } from '../../components/ui/Skeleton'
import { formatNumber } from '../../utils/format'
import { Smartphone, Wifi, WifiOff, Trash2 } from 'lucide-react'

export function Instancias() {
  const { data, isLoading } = useMetricasInstancias()
  const [filter, setFilter] = useState<'all' | 'connected' | 'disconnected'>('all')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (!data) return null

  const filteredInstancias = data.todasInstancias.filter((inst) => {
    if (filter === 'connected') return inst.status === 'CONNECTED'
    if (filter === 'disconnected') return inst.status !== 'CONNECTED'
    return true
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Instâncias" value={formatNumber(data.totalInstancias)} icon={<Smartphone size={20} />} iconBg="bg-[#db6f57]/10 text-[#db6f57] dark:bg-[#E07A62]/10 dark:text-[#E07A62]" />
        <MetricCard title="Conectadas" value={formatNumber(data.instanciasConectadas)} icon={<Wifi size={20} />} iconBg="bg-emerald-500/10 text-emerald-500" />
        <MetricCard title="Desconectadas" value={formatNumber(data.instanciasDesconectadas)} icon={<WifiOff size={20} />} iconBg="bg-red-500/10 text-red-500" />
        <MetricCard title="Deletadas" value={formatNumber(data.instanciasDeletadas)} icon={<Trash2 size={20} />} iconBg="bg-gray-500/10 text-gray-500" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {([['all', 'Todas'], ['connected', 'Conectadas'], ['disconnected', 'Desconectadas']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === key
                ? 'bg-[#db6f57]/10 text-[#db6f57] dark:bg-[#E07A62]/10 dark:text-[#E07A62] font-medium'
                : 'text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Instances list */}
      <div className="space-y-3">
        {filteredInstancias.map((inst) => (
          <Card key={inst.id} className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  inst.status === 'CONNECTED' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                }`}>
                  <Smartphone size={18} className={inst.status === 'CONNECTED' ? 'text-emerald-500' : 'text-red-500'} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{inst.instanceName}</p>
                  <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{inst.nomeFantasiaOrganizacao}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default">{inst.integration}</Badge>
                <StatusIndicator status={inst.status === 'CONNECTED' ? 'connected' : 'disconnected'} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
