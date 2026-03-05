import { useNavigate, useParams } from 'react-router-dom'
import { useCupom, useCupomUtilizacoes, useDesativarCupom, useAtivarCupom } from '../../queries/useCupom'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '../../utils/format'
import { cn } from '../../utils/cn'
import {
  ArrowLeft,
  Pencil,
  Power,
  PowerOff,
  Ticket,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Building2,
  Tag,
  History,
  TrendingUp,
  Repeat,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react'
import { useState } from 'react'

export function CupomDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const cupomId = Number(id)

  const { data: cupom, isLoading, error } = useCupom(cupomId)
  const { data: utilizacoes, isLoading: isLoadingUtilizacoes } = useCupomUtilizacoes(cupomId)
  const desativarCupom = useDesativarCupom()
  const ativarCupom = useAtivarCupom()

  const [confirmAction, setConfirmAction] = useState<'desativar' | 'ativar' | null>(null)

  const handleConfirm = () => {
    if (confirmAction === 'desativar') {
      desativarCupom.mutate(cupomId)
    } else if (confirmAction === 'ativar') {
      ativarCupom.mutate(cupomId)
    }
    setConfirmAction(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !cupom) {
    return (
      <EmptyState
        icon={<Ticket size={48} />}
        title="Cupom nao encontrado"
        description="O cupom solicitado nao foi encontrado."
        action={
          <Button onClick={() => navigate('/cupons')}>Voltar para cupons</Button>
        }
      />
    )
  }

  const statusInfo = !cupom.ativo
    ? { label: 'Inativo', variant: 'default' as const }
    : cupom.vigente
      ? { label: 'Vigente', variant: 'success' as const }
      : { label: 'Expirado', variant: 'warning' as const }

  const progressPercent = cupom.maxUtilizacoes
    ? Math.min((cupom.totalUtilizado / cupom.maxUtilizacoes) * 100, 100)
    : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cupons')}
            className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#db6f57]/10 dark:bg-[#E07A62]/10 flex items-center justify-center">
              <Ticket size={20} className="text-[#db6f57] dark:text-[#E07A62]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <code className="text-lg font-bold font-mono text-[#2a2420] dark:text-[#F5F0EB]">
                  {cupom.codigo}
                </code>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
              {cupom.descricao && (
                <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">{cupom.descricao}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setConfirmAction(cupom.ativo ? 'desativar' : 'ativar')}
            leftIcon={cupom.ativo ? <PowerOff size={16} /> : <Power size={16} />}
          >
            <span className="hidden sm:inline">{cupom.ativo ? 'Desativar' : 'Ativar'}</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/cupons/${cupom.id}/editar`)}
            leftIcon={<Pencil size={16} />}
          >
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                {cupom.tipoDesconto === 'PERCENTUAL' ? (
                  <Percent size={14} className="text-[#db6f57] dark:text-[#E07A62]" />
                ) : (
                  <DollarSign size={14} className="text-[#db6f57] dark:text-[#E07A62]" />
                )}
                <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider">Desconto</p>
              </div>
              <p className="text-2xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">
                {cupom.tipoDesconto === 'PERCENTUAL'
                  ? `${cupom.valorDesconto}%`
                  : formatCurrency(cupom.valorDesconto)}
              </p>
              <p className="text-xs text-[#6b5d57] dark:text-[#7A716A] mt-0.5">
                {cupom.tipoDesconto === 'PERCENTUAL' ? 'Percentual' : 'Valor Fixo'}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-[#4f6f64] dark:text-[#6B8F82]" />
                <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider">Utilizacoes</p>
              </div>
              <p className="text-2xl font-bold text-[#4f6f64] dark:text-[#6B8F82]">
                {formatNumber(cupom.totalUtilizado)}
              </p>
              <p className="text-xs text-[#6b5d57] dark:text-[#7A716A] mt-0.5">
                de {cupom.maxUtilizacoes ?? '\u221E'}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-[#6b5d57] dark:text-[#B8AEA4]" />
                <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider">Inicio</p>
              </div>
              <p className="text-lg font-bold text-[#2a2420] dark:text-[#F5F0EB]">
                {cupom.dtInicio ? formatDate(cupom.dtInicio) : 'Imediato'}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-[#6b5d57] dark:text-[#B8AEA4]" />
                <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider">Fim</p>
              </div>
              <p className="text-lg font-bold text-[#2a2420] dark:text-[#F5F0EB]">
                {cupom.dtFim ? formatDate(cupom.dtFim) : 'Sem limite'}
              </p>
            </Card>
          </div>

          {/* Progress Bar */}
          {progressPercent !== null && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-[#6b5d57] dark:text-[#7A716A]" />
                  <span className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">Progresso de utilizacao</span>
                </div>
                <span className="text-sm font-medium text-[#6b5d57] dark:text-[#B8AEA4]">
                  {cupom.totalUtilizado} / {cupom.maxUtilizacoes}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#d8ccc4]/30 dark:bg-[#2D2925] overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    progressPercent >= 90
                      ? 'bg-red-500 dark:bg-red-400'
                      : progressPercent >= 70
                        ? 'bg-amber-500 dark:bg-amber-400'
                        : 'bg-[#4f6f64] dark:bg-[#6B8F82]'
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-[#6b5d57] dark:text-[#7A716A] mt-1">
                {Math.round(progressPercent)}% utilizado
              </p>
            </Card>
          )}

          {/* Utilizacoes Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-[#6b5d57] dark:text-[#7A716A]" />
                  <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
                    Historico de utilizacao ({utilizacoes?.length ?? 0})
                  </h2>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUtilizacoes ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : !utilizacoes || utilizacoes.length === 0 ? (
                <div className="text-center py-8">
                  <History size={32} className="mx-auto text-[#d8ccc4] dark:text-[#2D2925] mb-3" />
                  <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">Nenhuma utilizacao registrada</p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                          <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Org ID</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Plano</th>
                          <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Ciclo</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Original</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Desconto</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Final</th>
                          <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {utilizacoes.map((uso) => (
                          <tr
                            key={uso.id}
                            className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50 hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/30"
                          >
                            <td className="px-3 py-2.5">
                              <span className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">
                                #{uso.organizacaoId}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <Badge variant="plan" className="capitalize">{uso.planoCodigo || '-'}</Badge>
                            </td>
                            <td className="px-3 py-2.5">
                              <span className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                                {uso.cicloCobranca || '-'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span className="text-sm text-[#6b5d57] dark:text-[#B8AEA4] line-through">
                                {formatCurrency(uso.valorOriginal)}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span className="text-sm font-medium text-red-500 dark:text-red-400">
                                -{formatCurrency(uso.valorDesconto)}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span className="text-sm font-semibold text-[#4f6f64] dark:text-[#6B8F82]">
                                {formatCurrency(uso.valorFinal)}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span className="text-xs text-[#6b5d57] dark:text-[#7A716A]">
                                {formatDateTime(uso.dtUtilizacao)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="lg:hidden space-y-3">
                    {utilizacoes.map((uso) => (
                      <div
                        key={uso.id}
                        className="rounded-lg border border-[#d8ccc4]/50 dark:border-[#2D2925]/50 p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">
                              Org #{uso.organizacaoId}
                            </span>
                            <Badge variant="plan" className="capitalize">{uso.planoCodigo || '-'}</Badge>
                          </div>
                          <span className="text-xs text-[#6b5d57] dark:text-[#7A716A]">
                            {formatDate(uso.dtUtilizacao)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-[#6b5d57] dark:text-[#B8AEA4] line-through">
                            {formatCurrency(uso.valorOriginal)}
                          </span>
                          <span className="text-red-500 dark:text-red-400 font-medium">
                            -{formatCurrency(uso.valorDesconto)}
                          </span>
                          <span className="text-[#4f6f64] dark:text-[#6B8F82] font-semibold">
                            {formatCurrency(uso.valorFinal)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Restricoes Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[#6b5d57] dark:text-[#7A716A]" />
                <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Restricoes</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Planos */}
              <div>
                <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider mb-1.5">Planos</p>
                {cupom.planosPermitidos && cupom.planosPermitidos.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {cupom.planosPermitidos.map((p) => (
                      <Badge key={p} variant="plan" className="capitalize">{p}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">Todos os planos</p>
                )}
              </div>

              {/* Segmentos */}
              <div>
                <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider mb-1.5">Segmentos</p>
                {cupom.segmentosPermitidos && cupom.segmentosPermitidos.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {cupom.segmentosPermitidos.map((s) => (
                      <Badge key={s} variant="success">{s}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">Todos os segmentos</p>
                )}
              </div>

              {/* Organizacoes */}
              <div>
                <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider mb-1.5">Organizacoes</p>
                {cupom.organizacoesPermitidas && cupom.organizacoesPermitidas.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {cupom.organizacoesPermitidas.map((id) => (
                      <Badge key={id} variant="default">#{id}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">Todas</p>
                )}
              </div>

              {/* Ciclo */}
              <div>
                <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider mb-1.5">Ciclo</p>
                <p className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">
                  {cupom.cicloCobranca || 'Mensal e Anual'}
                </p>
              </div>

              {/* Tipo de aplicacao */}
              <div>
                <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider mb-1.5">Aplicacao</p>
                <div className="flex items-center gap-1.5">
                  <Repeat size={12} className={cupom.tipoAplicacao === 'RECORRENTE' ? 'text-[#4f6f64] dark:text-[#6B8F82]' : 'text-[#6b5d57] dark:text-[#B8AEA4]'} />
                  <Badge variant={cupom.tipoAplicacao === 'RECORRENTE' ? 'success' : 'info'}>
                    {cupom.tipoAplicacao === 'RECORRENTE' ? 'Todas as cobrancas' : 'Primeira cobranca'}
                  </Badge>
                </div>
              </div>

              {/* Max por org */}
              <div>
                <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider mb-1.5">Max por organizacao</p>
                <p className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">
                  {cupom.maxUtilizacoesPorOrg ?? 'Ilimitado'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dates Card */}
          <Card className="p-4">
            <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider mb-2">Datas</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6b5d57] dark:text-[#7A716A]">Criado em</span>
                <span className="text-[#2a2420] dark:text-[#F5F0EB]">{formatDateTime(cupom.dtCriacao)}</span>
              </div>
              {cupom.dtAtualizacao && (
                <div className="flex justify-between">
                  <span className="text-[#6b5d57] dark:text-[#7A716A]">Atualizado em</span>
                  <span className="text-[#2a2420] dark:text-[#F5F0EB]">{formatDateTime(cupom.dtAtualizacao)}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmAction(null)}>
          <Card className="w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                confirmAction === 'desativar'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-[#4f6f64]/15 dark:bg-[#6B8F82]/15'
              )}>
                {confirmAction === 'desativar' ? (
                  <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
                ) : (
                  <Power size={20} className="text-[#4f6f64] dark:text-[#6B8F82]" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
                  {confirmAction === 'desativar' ? 'Desativar cupom' : 'Ativar cupom'}
                </h3>
                <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                  {confirmAction === 'desativar'
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
                variant={confirmAction === 'desativar' ? 'danger' : 'secondary'}
                onClick={handleConfirm}
                leftIcon={confirmAction === 'desativar' ? <X size={16} /> : <Check size={16} />}
              >
                {confirmAction === 'desativar' ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
