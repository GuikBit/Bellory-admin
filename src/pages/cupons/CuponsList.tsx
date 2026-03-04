import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCupons, useDesativarCupom, useAtivarCupom } from '../../queries/useCupom'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatCurrency, formatDate, formatNumber } from '../../utils/format'
import { cn } from '../../utils/cn'
import {
  Search,
  Plus,
  Ticket,
  Filter,
  Pencil,
  Power,
  PowerOff,
  AlertTriangle,
  Check,
  X,
  Percent,
  DollarSign,
  Calendar,
  Eye,
  Users,
  Infinity,
} from 'lucide-react'
import type { CupomDesconto } from '../../types/cupom'

type FilterStatus = 'all' | 'vigentes' | 'inativos' | 'expirados'

function getStatusInfo(cupom: CupomDesconto): { label: string; variant: 'success' | 'danger' | 'default' | 'warning' } {
  if (!cupom.ativo) return { label: 'Inativo', variant: 'default' }
  if (cupom.vigente) return { label: 'Vigente', variant: 'success' }
  return { label: 'Expirado', variant: 'warning' }
}

export function CuponsList() {
  const { data, isLoading, error } = useCupons()
  const desativarCupom = useDesativarCupom()
  const ativarCupom = useAtivarCupom()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ id: number; type: 'desativar' | 'ativar' } | null>(null)

  const filtered = useMemo(() => {
    if (!data) return []
    let result = [...data]

    if (search) {
      const term = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.codigo.toLowerCase().includes(term) ||
          (c.descricao && c.descricao.toLowerCase().includes(term))
      )
    }

    if (filterStatus === 'vigentes') result = result.filter((c) => c.vigente && c.ativo)
    if (filterStatus === 'inativos') result = result.filter((c) => !c.ativo)
    if (filterStatus === 'expirados') result = result.filter((c) => c.ativo && !c.vigente)

    return result
  }, [data, search, filterStatus])

  const stats = useMemo(() => {
    if (!data) return { total: 0, vigentes: 0, inativos: 0, totalUsos: 0 }
    return {
      total: data.length,
      vigentes: data.filter((c) => c.vigente && c.ativo).length,
      inativos: data.filter((c) => !c.ativo).length,
      totalUsos: data.reduce((acc, c) => acc + c.totalUtilizado, 0),
    }
  }, [data])

  const handleToggleStatus = (cupom: CupomDesconto) => {
    setConfirmAction({ id: cupom.id, type: cupom.ativo ? 'desativar' : 'ativar' })
  }

  const handleConfirm = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'desativar') {
      desativarCupom.mutate(confirmAction.id)
    } else {
      ativarCupom.mutate(confirmAction.id)
    }
    setConfirmAction(null)
  }

  if (error) {
    return (
      <EmptyState
        icon={<Ticket size={48} />}
        title="Erro ao carregar"
        description="Nao foi possivel carregar os cupons."
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
            <p className="text-xs font-medium text-[#4f6f64] dark:text-[#6B8F82] uppercase tracking-wider">Vigentes</p>
            <p className="text-2xl font-bold text-[#4f6f64] dark:text-[#6B8F82] mt-1">{stats.vigentes}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-red-500 dark:text-red-400 uppercase tracking-wider">Inativos</p>
            <p className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{stats.inativos}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-[#db6f57] dark:text-[#E07A62] uppercase tracking-wider">Total Usos</p>
            <p className="text-2xl font-bold text-[#db6f57] dark:text-[#E07A62] mt-1">{formatNumber(stats.totalUsos)}</p>
          </Card>
        </div>
      )}

      {/* Search, filters, and actions bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por codigo ou descricao..."
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
          <Button
            variant="primary"
            onClick={() => navigate('/cupons/novo')}
            leftIcon={<Plus size={16} />}
          >
            <span className="hidden sm:inline">Novo Cupom</span>
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
                <option value="vigentes">Vigentes</option>
                <option value="inativos">Inativos</option>
                <option value="expirados">Expirados</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">
          {isLoading ? 'Carregando...' : `${filtered.length} cupons encontrados`}
        </p>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <TableSkeleton rows={5} />
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Ticket size={48} />}
          title="Nenhum cupom"
          description={search ? 'Nenhum resultado para sua busca.' : 'Nenhum cupom cadastrado ainda.'}
          action={
            <Button onClick={() => navigate('/cupons/novo')} leftIcon={<Plus size={16} />}>
              Criar primeiro cupom
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
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Cupom</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Desconto</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Usos</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Vigencia</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Restricoes</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cupom) => {
                    const status = getStatusInfo(cupom)
                    return (
                      <tr
                        key={cupom.id}
                        className={cn(
                          'border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50 transition-colors',
                          'hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/30 cursor-pointer',
                          !cupom.ativo && 'opacity-60'
                        )}
                        onClick={() => navigate(`/cupons/${cupom.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#db6f57]/10 dark:bg-[#E07A62]/10 flex items-center justify-center shrink-0">
                              <Ticket size={18} className="text-[#db6f57] dark:text-[#E07A62]" />
                            </div>
                            <div>
                              <code className="text-sm font-semibold font-mono px-2 py-0.5 rounded bg-[#faf8f6] dark:bg-[#2D2925] text-[#db6f57] dark:text-[#E07A62]">
                                {cupom.codigo}
                              </code>
                              {cupom.descricao && (
                                <p className="text-xs text-[#6b5d57] dark:text-[#7A716A] truncate max-w-[200px] mt-0.5">
                                  {cupom.descricao}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {cupom.tipoDesconto === 'PERCENTUAL' ? (
                              <Percent size={14} className="text-[#4f6f64] dark:text-[#6B8F82]" />
                            ) : (
                              <DollarSign size={14} className="text-[#4f6f64] dark:text-[#6B8F82]" />
                            )}
                            <span className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">
                              {cupom.tipoDesconto === 'PERCENTUAL'
                                ? `${cupom.valorDesconto}%`
                                : formatCurrency(cupom.valorDesconto)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users size={13} className="text-[#6b5d57] dark:text-[#7A716A]" />
                            <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">
                              {cupom.totalUtilizado}
                              <span className="text-[#6b5d57] dark:text-[#7A716A]">
                                /{cupom.maxUtilizacoes ?? '\u221E'}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                            <Calendar size={13} />
                            {cupom.dtInicio || cupom.dtFim ? (
                              <span>
                                {cupom.dtInicio ? formatDate(cupom.dtInicio) : 'Inicio livre'}
                                {' - '}
                                {cupom.dtFim ? formatDate(cupom.dtFim) : 'Sem fim'}
                              </span>
                            ) : (
                              <span>Sem limite</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {cupom.planosPermitidos && cupom.planosPermitidos.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                {cupom.planosPermitidos.length} plano(s)
                              </span>
                            )}
                            {cupom.cicloCobranca && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                {cupom.cicloCobranca}
                              </span>
                            )}
                            {cupom.segmentosPermitidos && cupom.segmentosPermitidos.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                {cupom.segmentosPermitidos.length} segmento(s)
                              </span>
                            )}
                            {cupom.organizacoesPermitidas && cupom.organizacoesPermitidas.length > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4f6f64]/10 dark:bg-[#6B8F82]/10 text-[#4f6f64] dark:text-[#6B8F82]">
                                {cupom.organizacoesPermitidas.length} org(s)
                              </span>
                            )}
                            {!cupom.planosPermitidos && !cupom.cicloCobranca && !cupom.segmentosPermitidos && !cupom.organizacoesPermitidas && (
                              <span className="text-[10px] text-[#6b5d57] dark:text-[#7A716A]">Nenhuma</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/cupons/${cupom.id}`)}
                              className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] hover:text-[#db6f57] dark:hover:text-[#E07A62] transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => navigate(`/cupons/${cupom.id}/editar`)}
                              className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] hover:text-[#db6f57] dark:hover:text-[#E07A62] transition-colors"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(cupom)}
                              className={cn(
                                'p-2 rounded-lg transition-colors',
                                cupom.ativo
                                  ? 'text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400'
                                  : 'text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#4f6f64]/10 hover:text-[#4f6f64] dark:hover:text-[#6B8F82]'
                              )}
                              title={cupom.ativo ? 'Desativar' : 'Ativar'}
                            >
                              {cupom.ativo ? <PowerOff size={15} /> : <Power size={15} />}
                            </button>
                          </div>
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
            {filtered.map((cupom) => {
              const status = getStatusInfo(cupom)
              return (
                <Card
                  key={cupom.id}
                  hover
                  className={cn('p-4 cursor-pointer', !cupom.ativo && 'opacity-60')}
                  onClick={() => navigate(`/cupons/${cupom.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#db6f57]/10 dark:bg-[#E07A62]/10 flex items-center justify-center shrink-0">
                        <Ticket size={20} className="text-[#db6f57] dark:text-[#E07A62]" />
                      </div>
                      <div>
                        <code className="text-sm font-semibold font-mono text-[#db6f57] dark:text-[#E07A62]">
                          {cupom.codigo}
                        </code>
                        {cupom.descricao && (
                          <p className="text-xs text-[#6b5d57] dark:text-[#7A716A] truncate max-w-[180px]">
                            {cupom.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                      <span className="font-medium text-[#2a2420] dark:text-[#F5F0EB]">
                        {cupom.tipoDesconto === 'PERCENTUAL'
                          ? `${cupom.valorDesconto}%`
                          : formatCurrency(cupom.valorDesconto)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {cupom.totalUtilizado}/{cupom.maxUtilizacoes ?? '\u221E'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/cupons/${cupom.id}/editar`)}
                        className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#db6f57] dark:hover:text-[#E07A62]"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(cupom)}
                        className={cn(
                          'p-2 rounded-lg',
                          cupom.ativo
                            ? 'text-[#6b5d57] hover:text-red-500'
                            : 'text-[#6b5d57] hover:text-[#4f6f64]'
                        )}
                      >
                        {cupom.ativo ? <PowerOff size={14} /> : <Power size={14} />}
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
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
                  {confirmAction.type === 'desativar' ? 'Desativar cupom' : 'Ativar cupom'}
                </h3>
                <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                  {confirmAction.type === 'desativar'
                    ? 'Este cupom sera desativado e nao podera mais ser utilizado.'
                    : 'Este cupom sera reativado e podera ser utilizado novamente.'}
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
