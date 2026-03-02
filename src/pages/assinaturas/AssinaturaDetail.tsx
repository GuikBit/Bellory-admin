import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useAssinatura,
  useCobrancasAssinatura,
  useCancelarAssinatura,
  useSuspenderAssinatura,
  useReativarAssinatura,
} from '../../queries/useAssinaturas'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { MetricCardSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format'
import { cn } from '../../utils/cn'
import {
  ArrowLeft,
  Receipt,
  Building2,
  CreditCard,
  Calendar,
  AlertCircle,
  ExternalLink,
  Ban,
  Pause,
  Play,
  X as XIcon,
  FileText,
} from 'lucide-react'
import type {
  StatusAssinatura,
  StatusCobrancaPlataforma,
  FormaPagamentoPlataforma,
} from '../../types/assinatura'

const statusConfig: Record<StatusAssinatura, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  TRIAL: { label: 'Trial', variant: 'info' },
  ATIVA: { label: 'Ativa', variant: 'success' },
  VENCIDA: { label: 'Vencida', variant: 'danger' },
  CANCELADA: { label: 'Cancelada', variant: 'default' },
  SUSPENSA: { label: 'Suspensa', variant: 'warning' },
}

const cobrancaStatusConfig: Record<StatusCobrancaPlataforma, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  PENDENTE: { label: 'Pendente', variant: 'warning' },
  PAGA: { label: 'Paga', variant: 'success' },
  VENCIDA: { label: 'Vencida', variant: 'danger' },
  CANCELADA: { label: 'Cancelada', variant: 'default' },
  ESTORNADA: { label: 'Estornada', variant: 'info' },
}

const formaPagamentoLabels: Record<FormaPagamentoPlataforma, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CARTAO_CREDITO: 'Cartão de Crédito',
}

function formatReferencia(mes: number, ano: number): string {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${meses[mes - 1]}/${ano}`
}

export function AssinaturaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const assinaturaId = Number(id)
  const { data: assinatura, isLoading, error } = useAssinatura(assinaturaId)
  const { data: cobrancas, isLoading: cobrancasLoading } = useCobrancasAssinatura(assinaturaId)

  const cancelar = useCancelarAssinatura()
  const suspender = useSuspenderAssinatura()
  const reativar = useReativarAssinatura()

  const [confirmAction, setConfirmAction] = useState<'cancelar' | 'suspender' | 'reativar' | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (error || !assinatura) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-2">Assinatura não encontrada</h3>
        <Button variant="outline" onClick={() => navigate('/assinaturas')}>Voltar</Button>
      </div>
    )
  }

  const cfg = statusConfig[assinatura.status]

  const canReativar = ['VENCIDA', 'CANCELADA', 'SUSPENSA'].includes(assinatura.status)
  const canSuspender = ['ATIVA', 'TRIAL'].includes(assinatura.status)
  const canCancelar = assinatura.status !== 'CANCELADA'

  const handleConfirm = () => {
    if (!confirmAction) return
    if (confirmAction === 'cancelar') cancelar.mutate(assinaturaId)
    if (confirmAction === 'suspender') suspender.mutate(assinaturaId)
    if (confirmAction === 'reativar') reativar.mutate(assinaturaId)
    setConfirmAction(null)
  }

  const confirmMessages: Record<string, string> = {
    cancelar: `Tem certeza que deseja cancelar a assinatura de ${assinatura.organizacaoNome}? Isso também cancelará a assinatura no gateway de pagamento.`,
    suspender: `Tem certeza que deseja suspender a assinatura de ${assinatura.organizacaoNome}? A organização perderá acesso ao sistema.`,
    reativar: `Deseja reativar a assinatura de ${assinatura.organizacaoNome}?`,
  }

  return (
    <div className="space-y-6">
      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmAction(null)}>
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardContent>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-1">Confirmar ação</h3>
                  <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                    {confirmMessages[confirmAction]}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" size="sm" onClick={() => setConfirmAction(null)}>Cancelar</Button>
                <Button
                  variant={confirmAction === 'reativar' ? 'primary' : 'danger'}
                  size="sm"
                  onClick={handleConfirm}
                  isLoading={cancelar.isPending || suspender.isPending || reativar.isPending}
                >
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/assinaturas')}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">
              Assinatura #{assinatura.id}
            </h1>
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
          <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">
            {assinatura.organizacaoNome} · {assinatura.planoNome}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canReativar && (
            <Button variant="primary" size="sm" leftIcon={<Play size={14} />} onClick={() => setConfirmAction('reativar')}>
              Reativar
            </Button>
          )}
          {canSuspender && (
            <Button variant="outline" size="sm" leftIcon={<Pause size={14} />} onClick={() => setConfirmAction('suspender')}>
              Suspender
            </Button>
          )}
          {canCancelar && (
            <Button variant="danger" size="sm" leftIcon={<Ban size={14} />} onClick={() => setConfirmAction('cancelar')}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-4 flex items-center gap-2">
              <Receipt size={16} /> Dados da Assinatura
            </h3>
            <dl className="space-y-3">
              {[
                { label: 'ID', value: `#${assinatura.id}` },
                { label: 'Organização', value: assinatura.organizacaoNome, link: `/organizacoes/${assinatura.organizacaoId}` },
                { label: 'Plano', value: `${assinatura.planoNome} (${assinatura.planoCodigo})` },
                { label: 'Ciclo', value: assinatura.cicloCobranca === 'MENSAL' ? 'Mensal' : 'Anual' },
                { label: 'Valor Mensal', value: assinatura.valorMensal != null ? formatCurrency(assinatura.valorMensal) : '—' },
                { label: 'Valor Anual', value: assinatura.valorAnual != null ? formatCurrency(assinatura.valorAnual) : '—' },
                { label: 'Criada em', value: formatDateTime(assinatura.dtCriacao) },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between py-1.5 border-b border-[#d8ccc4]/30 dark:border-[#2D2925]/30 last:border-0">
                  <dt className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{item.label}</dt>
                  <dd className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] text-right">
                    {'link' in item && item.link ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(item.link!) }}
                        className="text-[#db6f57] dark:text-[#E07A62] hover:underline"
                      >
                        {item.value}
                      </button>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-4 flex items-center gap-2">
              <Calendar size={16} /> Datas e Integração
            </h3>
            <dl className="space-y-3">
              {[
                { label: 'Início Trial', value: assinatura.dtInicioTrial ? formatDate(assinatura.dtInicioTrial) : '—' },
                { label: 'Fim Trial', value: assinatura.dtFimTrial ? formatDate(assinatura.dtFimTrial) : '—' },
                { label: 'Início Assinatura', value: assinatura.dtInicio ? formatDate(assinatura.dtInicio) : '—' },
                { label: 'Próximo Vencimento', value: assinatura.dtProximoVencimento ? formatDate(assinatura.dtProximoVencimento) : '—' },
                { label: 'Data Cancelamento', value: assinatura.dtCancelamento ? formatDate(assinatura.dtCancelamento) : '—' },
                { label: 'Assas Customer ID', value: assinatura.assasCustomerId || 'Não integrado', mono: !!assinatura.assasCustomerId },
                { label: 'Assas Subscription ID', value: assinatura.assasSubscriptionId || 'Não integrado', mono: !!assinatura.assasSubscriptionId },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between py-1.5 border-b border-[#d8ccc4]/30 dark:border-[#2D2925]/30 last:border-0">
                  <dt className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{item.label}</dt>
                  <dd className={cn(
                    'text-sm text-right',
                    'mono' in item && item.mono
                      ? 'font-mono text-xs text-[#2a2420] dark:text-[#F5F0EB]'
                      : item.value === '—' || item.value === 'Não integrado'
                        ? 'text-[#6b5d57] dark:text-[#7A716A]'
                        : 'font-medium text-[#2a2420] dark:text-[#F5F0EB]'
                  )}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardContent>
          <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-4 flex items-center gap-2">
            <CreditCard size={16} /> Histórico de Cobranças
          </h3>

          {cobrancasLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg animate-pulse bg-[#d8ccc4]/40 dark:bg-[#2D2925]" />
              ))}
            </div>
          ) : !cobrancas || cobrancas.length === 0 ? (
            <EmptyState
              icon={<FileText size={40} />}
              title="Nenhuma cobrança"
              description="Ainda não há cobranças registradas para esta assinatura."
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                      <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">#</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Referência</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Valor</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Vencimento</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Pagamento</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Status</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Forma</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cobrancas.map((c) => {
                      const cCfg = cobrancaStatusConfig[c.status]
                      return (
                        <tr key={c.id} className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                          <td className="px-3 py-2.5 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">{c.id}</td>
                          <td className="px-3 py-2.5 text-sm text-[#2a2420] dark:text-[#F5F0EB]">{formatReferencia(c.referenciaMes, c.referenciaAno)}</td>
                          <td className="px-3 py-2.5 text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{formatCurrency(c.valor)}</td>
                          <td className="px-3 py-2.5 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">{formatDate(c.dtVencimento)}</td>
                          <td className="px-3 py-2.5 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">{c.dtPagamento ? formatDate(c.dtPagamento) : '—'}</td>
                          <td className="px-3 py-2.5"><Badge variant={cCfg.variant}>{cCfg.label}</Badge></td>
                          <td className="px-3 py-2.5 text-sm text-[#2a2420] dark:text-[#F5F0EB]">
                            {c.formaPagamento ? formaPagamentoLabels[c.formaPagamento] : '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-2">
                              {c.assasInvoiceUrl && (
                                <a href={c.assasInvoiceUrl} target="_blank" rel="noopener noreferrer" title="Fatura" className="text-[#db6f57] dark:text-[#E07A62] hover:opacity-70">
                                  <ExternalLink size={14} />
                                </a>
                              )}
                              {c.assasBankSlipUrl && (
                                <a href={c.assasBankSlipUrl} target="_blank" rel="noopener noreferrer" title="Boleto" className="text-[#db6f57] dark:text-[#E07A62] hover:opacity-70">
                                  <FileText size={14} />
                                </a>
                              )}
                              {!c.assasInvoiceUrl && !c.assasBankSlipUrl && (
                                <span className="text-[#d8ccc4] dark:text-[#2D2925]">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden space-y-3">
                {cobrancas.map((c) => {
                  const cCfg = cobrancaStatusConfig[c.status]
                  return (
                    <div key={c.id} className="p-3 rounded-lg border border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">
                          {formatReferencia(c.referenciaMes, c.referenciaAno)}
                        </span>
                        <Badge variant={cCfg.variant}>{cCfg.label}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                        <span className="font-medium text-[#2a2420] dark:text-[#F5F0EB]">{formatCurrency(c.valor)}</span>
                        <span>Venc: {formatDate(c.dtVencimento)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                        <span>{c.formaPagamento ? formaPagamentoLabels[c.formaPagamento] : '—'}</span>
                        <div className="flex gap-2">
                          {c.assasInvoiceUrl && (
                            <a href={c.assasInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-[#db6f57] dark:text-[#E07A62]">
                              <ExternalLink size={12} />
                            </a>
                          )}
                          {c.assasBankSlipUrl && (
                            <a href={c.assasBankSlipUrl} target="_blank" rel="noopener noreferrer" className="text-[#db6f57] dark:text-[#E07A62]">
                              <FileText size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AssinaturaDetail
