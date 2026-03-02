import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssinaturas, useBillingDashboard } from '../../queries/useAssinaturas'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { MetricCard } from '../../components/ui/MetricCard'
import { MetricCardSkeleton, TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../../utils/format'
import { cn } from '../../utils/cn'
import {
  Search,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Pause,
  ChevronRight,
  Receipt,
  Filter,
  Check,
  X,
} from 'lucide-react'
import type { StatusAssinatura, AssinaturaResponse } from '../../types/assinatura'

const statusConfig: Record<StatusAssinatura, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  TRIAL: { label: 'Trial', variant: 'info' },
  ATIVA: { label: 'Ativa', variant: 'success' },
  VENCIDA: { label: 'Vencida', variant: 'danger' },
  CANCELADA: { label: 'Cancelada', variant: 'default' },
  SUSPENSA: { label: 'Suspensa', variant: 'warning' },
}

export function BillingDashboard() {
  const navigate = useNavigate()
  const { data: dashboard, isLoading: dashLoading } = useBillingDashboard()
  const [filterStatus, setFilterStatus] = useState<StatusAssinatura | 'ALL'>('ALL')
  const { data: assinaturas, isLoading: listLoading } = useAssinaturas(
    filterStatus !== 'ALL' ? { status: filterStatus } : undefined
  )
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    if (!assinaturas) return []
    if (!search) return assinaturas
    const term = search.toLowerCase()
    return assinaturas.filter(
      (a) =>
        a.organizacaoNome.toLowerCase().includes(term) ||
        a.planoNome.toLowerCase().includes(term)
    )
  }, [assinaturas, search])

  const getValor = (a: AssinaturaResponse) => {
    if (a.cicloCobranca === 'ANUAL' && a.valorAnual != null) return formatCurrency(a.valorAnual)
    if (a.valorMensal != null) return formatCurrency(a.valorMensal)
    return '—'
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      {dashLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      ) : dashboard ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="MRR"
              value={formatCurrency(dashboard.mrr)}
              subtitle="Receita recorrente mensal"
              icon={<DollarSign size={20} />}
              iconBg="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
            />
            <MetricCard
              title="Receita do Mês"
              value={formatCurrency(dashboard.receitaMesAtual)}
              subtitle="Mês atual"
              icon={<TrendingUp size={20} />}
              iconBg="bg-[#4f6f64]/10 text-[#4f6f64] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]"
            />
            <MetricCard
              title="Ativas"
              value={String(dashboard.totalAtivas)}
              subtitle="Assinaturas ativas"
              icon={<CheckCircle size={20} />}
              iconBg="bg-[#4f6f64]/10 text-[#4f6f64] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]"
            />
            <MetricCard
              title="Em Trial"
              value={String(dashboard.totalTrial)}
              subtitle="Período de teste"
              icon={<Clock size={20} />}
              iconBg="bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Vencidas"
              value={String(dashboard.totalVencidas)}
              subtitle="Pagamento em atraso"
              icon={<AlertTriangle size={20} />}
              iconBg="bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
            />
            <MetricCard
              title="Canceladas"
              value={String(dashboard.totalCanceladas)}
              icon={<XCircle size={20} />}
              iconBg="bg-[#d8ccc4]/30 text-[#6b5d57] dark:bg-[#2D2925] dark:text-[#7A716A]"
            />
            <MetricCard
              title="Suspensas"
              value={String(dashboard.totalSuspensas)}
              icon={<Pause size={20} />}
              iconBg="bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
            />
          </div>
        </>
      ) : null}

      {/* Subscription List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por organização ou plano..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter size={16} />}
          >
            Filtros
          </Button>
        </div>

        {showFilters && (
          <Card className="p-4">
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="block text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="h-9 px-3 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62]"
                >
                  <option value="ALL">Todos</option>
                  <option value="TRIAL">Trial</option>
                  <option value="ATIVA">Ativa</option>
                  <option value="VENCIDA">Vencida</option>
                  <option value="CANCELADA">Cancelada</option>
                  <option value="SUSPENSA">Suspensa</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">
            {listLoading ? 'Carregando...' : `${filtered.length} assinaturas encontradas`}
          </p>
        </div>

        {listLoading ? (
          <Card className="p-6">
            <TableSkeleton rows={8} />
          </Card>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Receipt size={48} />}
            title="Nenhuma assinatura"
            description={search ? 'Nenhum resultado para sua busca.' : 'Nenhuma assinatura cadastrada.'}
          />
        ) : (
          <>
            {/* Desktop table */}
            <Card className="hidden lg:block overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Organização</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Plano</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Ciclo</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Valor</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Próx. Venc.</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Assas</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => {
                      const cfg = statusConfig[a.status]
                      return (
                        <tr
                          key={a.id}
                          onClick={() => navigate(`/assinaturas/${a.id}`)}
                          className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50 hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/30 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{a.organizacaoNome}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="plan">{a.planoNome}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#2a2420] dark:text-[#F5F0EB]">
                            {a.cicloCobranca === 'MENSAL' ? 'Mensal' : 'Anual'}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#2a2420] dark:text-[#F5F0EB]">
                            {getValor(a)}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                            {a.status === 'TRIAL' && a.dtFimTrial
                              ? `Trial até ${formatDate(a.dtFimTrial)}`
                              : a.dtProximoVencimento
                                ? formatDate(a.dtProximoVencimento)
                                : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {a.assasSubscriptionId ? (
                              <Check size={16} className="text-[#4f6f64] dark:text-[#6B8F82] mx-auto" />
                            ) : (
                              <X size={16} className="text-[#d8ccc4] dark:text-[#2D2925] mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <ChevronRight size={16} className="text-[#d8ccc4] dark:text-[#2D2925]" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {filtered.map((a) => {
                const cfg = statusConfig[a.status]
                return (
                  <Card
                    key={a.id}
                    hover
                    className="p-4 cursor-pointer"
                    onClick={() => navigate(`/assinaturas/${a.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">{a.organizacaoNome}</h3>
                        <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{a.planoNome} · {a.cicloCobranca === 'MENSAL' ? 'Mensal' : 'Anual'}</p>
                      </div>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                      <span className="flex items-center gap-1"><DollarSign size={12} /> {getValor(a)}</span>
                      <span>
                        {a.status === 'TRIAL' && a.dtFimTrial
                          ? `Trial até ${formatDate(a.dtFimTrial)}`
                          : a.dtProximoVencimento
                            ? formatDate(a.dtProximoVencimento)
                            : '—'}
                      </span>
                      {a.assasSubscriptionId ? (
                        <Check size={12} className="text-[#4f6f64] dark:text-[#6B8F82]" />
                      ) : (
                        <X size={12} className="text-[#d8ccc4] dark:text-[#2D2925]" />
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BillingDashboard
