import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanos, useDesativarPlano, useAtivarPlano, useReordenarPlanos } from '../../queries/usePlanos'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatCurrency, formatNumber } from '../../utils/format'
import { cn } from '../../utils/cn'
import {
  Search,
  Plus,
  CreditCard,
  Filter,
  ChevronUp,
  ChevronDown,
  Pencil,
  Power,
  PowerOff,
  Star,
  Building2,
  AlertTriangle,
  Check,
  X,
  GripVertical,
  Save,
  Gift,
  Zap,
  Sparkles,
  Crown,
  Rocket,
  Heart,
  Shield,
  Gem,
  type LucideIcon,
} from 'lucide-react'
import type { PlanoBellory } from '../../types/plano'

type FilterStatus = 'all' | 'ativo' | 'inativo'

const ICON_MAP: Record<string, LucideIcon> = {
  Gift, Zap, Sparkles, Crown, Star, Rocket, Heart, Shield, Gem, CreditCard,
}

function PlanoIcon({ iconName, cor }: { iconName: string | null; cor: string | null }) {
  const Icon = iconName ? ICON_MAP[iconName] || CreditCard : CreditCard
  return <Icon size={20} style={cor ? { color: cor } : undefined} />
}

export function PlanosList() {
  const { data, isLoading, error } = usePlanos()
  const desativarPlano = useDesativarPlano()
  const ativarPlano = useAtivarPlano()
  const reordenarPlanos = useReordenarPlanos()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ id: number; type: 'desativar' | 'ativar' } | null>(null)
  const [reorderMode, setReorderMode] = useState(false)
  const [localOrder, setLocalOrder] = useState<PlanoBellory[]>([])

  const filtered = useMemo(() => {
    if (!data) return []
    let result = [...data].sort((a, b) => (a.ordemExibicao ?? 999) - (b.ordemExibicao ?? 999))

    if (search) {
      const term = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.nome.toLowerCase().includes(term) ||
          p.codigo.toLowerCase().includes(term)
      )
    }

    if (filterStatus === 'ativo') result = result.filter((p) => p.ativo)
    if (filterStatus === 'inativo') result = result.filter((p) => !p.ativo)

    return result
  }, [data, search, filterStatus])

  const displayList = reorderMode ? localOrder : filtered

  const handleStartReorder = () => {
    setLocalOrder([...filtered])
    setReorderMode(true)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...localOrder]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    setLocalOrder(updated)
  }

  const handleMoveDown = (index: number) => {
    if (index === localOrder.length - 1) return
    const updated = [...localOrder]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    setLocalOrder(updated)
  }

  const handleSaveOrder = () => {
    reordenarPlanos.mutate(
      {
        planos: localOrder.map((p, i) => ({ id: p.id, ordemExibicao: i + 1 })),
      },
      { onSuccess: () => setReorderMode(false) }
    )
  }

  const handleToggleStatus = (plano: PlanoBellory) => {
    if (plano.ativo) {
      if (plano.totalOrganizacoesUsando > 0) return
      setConfirmAction({ id: plano.id, type: 'desativar' })
    } else {
      setConfirmAction({ id: plano.id, type: 'ativar' })
    }
  }

  const handleConfirm = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'desativar') {
      desativarPlano.mutate(confirmAction.id)
    } else {
      ativarPlano.mutate(confirmAction.id)
    }
    setConfirmAction(null)
  }

  const stats = useMemo(() => {
    if (!data) return { total: 0, ativos: 0, inativos: 0, totalOrgs: 0 }
    return {
      total: data.length,
      ativos: data.filter((p) => p.ativo).length,
      inativos: data.filter((p) => !p.ativo).length,
      totalOrgs: data.reduce((acc, p) => acc + p.totalOrganizacoesUsando, 0),
    }
  }, [data])

  if (error) {
    return (
      <EmptyState
        icon={<CreditCard size={48} />}
        title="Erro ao carregar"
        description="Não foi possível carregar os planos."
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Stats cards */}
      {!isLoading && data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4">
            <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-[#2a2420] dark:text-[#F5F0EB] mt-1">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-[#4f6f64] dark:text-[#6B8F82] uppercase tracking-wider">Ativos</p>
            <p className="text-2xl font-bold text-[#4f6f64] dark:text-[#6B8F82] mt-1">{stats.ativos}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-red-500 dark:text-red-400 uppercase tracking-wider">Inativos</p>
            <p className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{stats.inativos}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-[#db6f57] dark:text-[#E07A62] uppercase tracking-wider">Organizações</p>
            <p className="text-2xl font-bold text-[#db6f57] dark:text-[#E07A62] mt-1">{formatNumber(stats.totalOrgs)}</p>
          </Card>
        </div>
      )}

      {/* Search, filters, and actions bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter size={16} />}
          >
            Filtros
          </Button>
          {!reorderMode ? (
            <Button
              variant="outline"
              onClick={handleStartReorder}
              leftIcon={<GripVertical size={16} />}
              disabled={isLoading || !data?.length}
            >
              <span className="hidden sm:inline">Reordenar</span>
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleSaveOrder}
                isLoading={reordenarPlanos.isPending}
                leftIcon={<Save size={16} />}
              >
                Salvar
              </Button>
              <Button
                variant="ghost"
                onClick={() => setReorderMode(false)}
              >
                Cancelar
              </Button>
            </div>
          )}
          <Button
            variant="primary"
            onClick={() => navigate('/planos/novo')}
            leftIcon={<Plus size={16} />}
          >
            <span className="hidden sm:inline">Novo Plano</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="h-9 px-3 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62]"
              >
                <option value="all">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">
          {isLoading ? 'Carregando...' : `${filtered.length} planos encontrados`}
        </p>
        {reorderMode && (
          <p className="text-sm text-[#db6f57] dark:text-[#E07A62] font-medium">
            Modo de reordenação ativo
          </p>
        )}
      </div>

      {isLoading ? (
        <Card className="p-6">
          <TableSkeleton rows={5} />
        </Card>
      ) : displayList.length === 0 ? (
        <EmptyState
          icon={<CreditCard size={48} />}
          title="Nenhum plano"
          description={search ? 'Nenhum resultado para sua busca.' : 'Nenhum plano cadastrado ainda.'}
          action={
            <Button onClick={() => navigate('/planos/novo')} leftIcon={<Plus size={16} />}>
              Criar primeiro plano
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                    {reorderMode && (
                      <th className="w-20 px-3 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A] text-center">Ordem</th>
                    )}
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Plano</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Código</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Mensal</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Anual</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Orgs</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {displayList.map((plano, index) => (
                    <tr
                      key={plano.id}
                      className={cn(
                        'border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50 transition-colors',
                        !reorderMode && 'hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/30 cursor-pointer',
                        !plano.ativo && 'opacity-60'
                      )}
                      onClick={() => !reorderMode && navigate(`/planos/${plano.id}`)}
                    >
                      {reorderMode && (
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className="p-1 rounded hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] disabled:opacity-30 text-[#6b5d57] dark:text-[#B8AEA4]"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <span className="text-xs text-[#6b5d57] dark:text-[#7A716A] min-w-[20px] text-center">{index + 1}</span>
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={index === displayList.length - 1}
                              className="p-1 rounded hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] disabled:opacity-30 text-[#6b5d57] dark:text-[#B8AEA4]"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: plano.cor ? `${plano.cor}15` : '#d8ccc415',
                              color: plano.cor || '#6b5d57',
                            }}
                          >
                            <PlanoIcon iconName={plano.icone} cor={plano.cor} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">{plano.nome}</p>
                              {plano.popular && (
                                <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                  <Star size={10} className="fill-current" />
                                  Popular
                                </span>
                              )}
                            </div>
                            {plano.tagline && (
                              <p className="text-xs text-[#6b5d57] dark:text-[#7A716A] truncate max-w-[200px]">{plano.tagline}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono px-2 py-1 rounded bg-[#faf8f6] dark:bg-[#2D2925] text-[#6b5d57] dark:text-[#B8AEA4]">
                          {plano.codigo}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={plano.ativo ? 'success' : 'danger'}>
                          {plano.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">
                        {formatCurrency(plano.precoMensal)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div>
                          <span className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">
                            {formatCurrency(plano.precoAnual)}
                          </span>
                          {plano.descontoPercentualAnual && (
                            <span className="ml-1.5 text-[10px] font-medium text-[#4f6f64] dark:text-[#6B8F82]">
                              -{plano.descontoPercentualAnual}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Building2 size={13} className="text-[#6b5d57] dark:text-[#7A716A]" />
                          <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">
                            {formatNumber(plano.totalOrganizacoesUsando)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/planos/${plano.id}`)}
                            className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] hover:text-[#db6f57] dark:hover:text-[#E07A62] transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(plano)}
                            disabled={plano.ativo && plano.totalOrganizacoesUsando > 0}
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              plano.ativo && plano.totalOrganizacoesUsando > 0
                                ? 'opacity-30 cursor-not-allowed text-[#6b5d57] dark:text-[#7A716A]'
                                : plano.ativo
                                  ? 'text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400'
                                  : 'text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#4f6f64]/10 hover:text-[#4f6f64] dark:hover:text-[#6B8F82]'
                            )}
                            title={
                              plano.ativo && plano.totalOrganizacoesUsando > 0
                                ? `Não pode desativar: ${plano.totalOrganizacoesUsando} organização(ões) usando`
                                : plano.ativo ? 'Desativar' : 'Ativar'
                            }
                          >
                            {plano.ativo ? <PowerOff size={15} /> : <Power size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {displayList.map((plano, index) => (
              <Card
                key={plano.id}
                hover={!reorderMode}
                className={cn('p-4', !reorderMode && 'cursor-pointer', !plano.ativo && 'opacity-60')}
                onClick={() => !reorderMode && navigate(`/planos/${plano.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {reorderMode && (
                      <div className="flex flex-col items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-0.5 disabled:opacity-30"><ChevronUp size={14} /></button>
                        <span className="text-[10px] text-[#6b5d57] dark:text-[#7A716A]">{index + 1}</span>
                        <button onClick={() => handleMoveDown(index)} disabled={index === displayList.length - 1} className="p-0.5 disabled:opacity-30"><ChevronDown size={14} /></button>
                      </div>
                    )}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: plano.cor ? `${plano.cor}15` : '#d8ccc415',
                        color: plano.cor || '#6b5d57',
                      }}
                    >
                      <PlanoIcon iconName={plano.icone} cor={plano.cor} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">{plano.nome}</h3>
                        {plano.popular && (
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <code className="text-[10px] font-mono text-[#6b5d57] dark:text-[#7A716A]">{plano.codigo}</code>
                    </div>
                  </div>
                  <Badge variant={plano.ativo ? 'success' : 'danger'}>
                    {plano.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                    <span className="font-medium text-[#2a2420] dark:text-[#F5F0EB]">{formatCurrency(plano.precoMensal)}/mês</span>
                    <span className="flex items-center gap-1"><Building2 size={12} /> {plano.totalOrganizacoesUsando}</span>
                  </div>
                  {!reorderMode && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/planos/${plano.id}`)}
                        className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#db6f57] dark:hover:text-[#E07A62]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(plano)}
                        disabled={plano.ativo && plano.totalOrganizacoesUsando > 0}
                        className={cn(
                          'p-2 rounded-lg',
                          plano.ativo && plano.totalOrganizacoesUsando > 0
                            ? 'opacity-30 cursor-not-allowed'
                            : plano.ativo
                              ? 'text-[#6b5d57] hover:text-red-500'
                              : 'text-[#6b5d57] hover:text-[#4f6f64]'
                        )}
                      >
                        {plano.ativo ? <PowerOff size={14} /> : <Power size={14} />}
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmAction(null)}>
          <Card className="w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                confirmAction.type === 'desativar'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-[#4f6f64]/15 dark:bg-[#6B8F82]/15'
              )}>
                {confirmAction.type === 'desativar' ? (
                  <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
                ) : (
                  <Power size={20} className="text-[#4f6f64] dark:text-[#6B8F82]" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
                  {confirmAction.type === 'desativar' ? 'Desativar plano' : 'Ativar plano'}
                </h3>
                <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                  {confirmAction.type === 'desativar'
                    ? 'Este plano será desativado e não aparecerá no site público.'
                    : 'Este plano será reativado e ficará disponível no site público.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setConfirmAction(null)}>
                Cancelar
              </Button>
              <Button
                variant={confirmAction.type === 'desativar' ? 'danger' : 'secondary'}
                onClick={handleConfirm}
                leftIcon={confirmAction.type === 'desativar' ? <X size={16} /> : <Check size={16} />}
              >
                {confirmAction.type === 'desativar' ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
