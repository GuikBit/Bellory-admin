import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEscolherPlano } from '../../queries/useMinhaAssinatura'
import { useMinhaAssinaturaStatus } from '../../queries/useMinhaAssinatura'
import { getPlanos } from '../../services/planos'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { MetricCardSkeleton } from '../../components/ui/Skeleton'
import { formatCurrency } from '../../utils/format'
import { cn } from '../../utils/cn'
import {
  Check,
  X,
  Crown,
  Sparkles,
  Zap,
  CreditCard,
  QrCode,
  FileText,
  ArrowLeft,
} from 'lucide-react'
import type { PlanoBellory } from '../../types/plano'
import type { CicloCobranca, FormaPagamentoPlataforma } from '../../types/assinatura'

const planoIcons: Record<string, React.ReactNode> = {
  gratuito: <Zap size={24} />,
  basico: <Sparkles size={24} />,
  plus: <Crown size={24} />,
  premium: <Crown size={24} />,
}

export function EscolherPlano() {
  const navigate = useNavigate()
  const { data: planos, isLoading } = useQuery({
    queryKey: ['admin-planos-publicos'],
    queryFn: getPlanos,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
  const { data: statusAssinatura } = useMinhaAssinaturaStatus()
  const escolherPlano = useEscolherPlano()

  const [ciclo, setCiclo] = useState<CicloCobranca>('MENSAL')
  const [selectedPlano, setSelectedPlano] = useState<PlanoBellory | null>(null)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoPlataforma>('PIX')

  const planosAtivos = planos?.filter((p) => p.ativo).sort((a, b) => (a.ordemExibicao ?? 0) - (b.ordemExibicao ?? 0)) ?? []

  const handleEscolher = () => {
    if (!selectedPlano) return
    escolherPlano.mutate(
      {
        planoCodigo: selectedPlano.codigo,
        cicloCobranca: ciclo,
        formaPagamento,
      },
      {
        onSuccess: () => {
          setSelectedPlano(null)
          navigate('/dashboard')
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Payment Modal */}
      {selectedPlano && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPlano(null)}>
          <Card className="max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#2a2420] dark:text-[#F5F0EB] mb-1">Forma de Pagamento</h3>
              <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4] mb-6">
                {selectedPlano.nome} — {ciclo === 'MENSAL'
                  ? formatCurrency(selectedPlano.precoMensal) + '/mês'
                  : formatCurrency(selectedPlano.precoAnual) + '/ano'}
              </p>

              <div className="space-y-2 mb-6">
                {([
                  { value: 'PIX' as const, label: 'PIX', desc: 'Pagamento instantâneo', icon: <QrCode size={20} /> },
                  { value: 'BOLETO' as const, label: 'Boleto Bancário', desc: 'Vencimento em 3 dias úteis', icon: <FileText size={20} /> },
                  { value: 'CARTAO_CREDITO' as const, label: 'Cartão de Crédito', desc: 'Cobrança recorrente', icon: <CreditCard size={20} /> },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormaPagamento(opt.value)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left',
                      formaPagamento === opt.value
                        ? 'border-[#db6f57] bg-[#db6f57]/5 dark:border-[#E07A62] dark:bg-[#E07A62]/5'
                        : 'border-[#d8ccc4] dark:border-[#2D2925] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/30'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                      formaPagamento === opt.value
                        ? 'bg-[#db6f57]/10 text-[#db6f57] dark:bg-[#E07A62]/10 dark:text-[#E07A62]'
                        : 'bg-[#d8ccc4]/30 text-[#6b5d57] dark:bg-[#2D2925] dark:text-[#7A716A]'
                    )}>
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{opt.label}</p>
                      <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{opt.desc}</p>
                    </div>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                      formaPagamento === opt.value
                        ? 'border-[#db6f57] dark:border-[#E07A62]'
                        : 'border-[#d8ccc4] dark:border-[#2D2925]'
                    )}>
                      {formaPagamento === opt.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#db6f57] dark:bg-[#E07A62]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setSelectedPlano(null)}>Cancelar</Button>
                <Button variant="primary" fullWidth onClick={handleEscolher} isLoading={escolherPlano.isPending}>
                  Confirmar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft size={18} className="mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold text-[#2a2420] dark:text-[#F5F0EB] mb-2">Escolha seu plano</h1>
        <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">Selecione o plano ideal para o seu negócio</p>
      </div>

      {/* Cycle Toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setCiclo('MENSAL')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            ciclo === 'MENSAL'
              ? 'bg-[#db6f57] text-white dark:bg-[#E07A62]'
              : 'bg-[#d8ccc4]/30 text-[#6b5d57] dark:bg-[#2D2925] dark:text-[#B8AEA4] hover:bg-[#d8ccc4]/50 dark:hover:bg-[#2D2925]/70'
          )}
        >
          Mensal
        </button>
        <button
          onClick={() => setCiclo('ANUAL')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors relative',
            ciclo === 'ANUAL'
              ? 'bg-[#db6f57] text-white dark:bg-[#E07A62]'
              : 'bg-[#d8ccc4]/30 text-[#6b5d57] dark:bg-[#2D2925] dark:text-[#B8AEA4] hover:bg-[#d8ccc4]/50 dark:hover:bg-[#2D2925]/70'
          )}
        >
          Anual
          {planosAtivos.some((p) => p.descontoPercentualAnual) && (
            <span className="absolute -top-2 -right-2 bg-[#4f6f64] dark:bg-[#6B8F82] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              Economize
            </span>
          )}
        </button>
      </div>

      {/* Plans Grid */}
      <div className={cn(
        'grid gap-6',
        planosAtivos.length <= 3
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      )}>
        {planosAtivos.map((plano) => {
          const isCurrentPlan = statusAssinatura?.planoCodigo === plano.codigo
          const price = ciclo === 'MENSAL' ? plano.precoMensal : plano.precoAnual
          const priceLabel = ciclo === 'MENSAL' ? '/mês' : '/ano'

          return (
            <Card
              key={plano.id}
              className={cn(
                'relative flex flex-col overflow-hidden',
                plano.popular && 'ring-2 ring-[#db6f57] dark:ring-[#E07A62]',
                isCurrentPlan && 'opacity-80'
              )}
            >
              {plano.popular && (
                <div className="bg-[#db6f57] dark:bg-[#E07A62] text-white text-xs font-semibold text-center py-1.5">
                  Mais popular
                </div>
              )}
              {isCurrentPlan && (
                <div className="bg-[#4f6f64] dark:bg-[#6B8F82] text-white text-xs font-semibold text-center py-1.5">
                  Plano atual
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    plano.popular
                      ? 'bg-[#db6f57]/10 text-[#db6f57] dark:bg-[#E07A62]/10 dark:text-[#E07A62]'
                      : 'bg-[#d8ccc4]/30 text-[#6b5d57] dark:bg-[#2D2925] dark:text-[#B8AEA4]'
                  )}>
                    {planoIcons[plano.codigo] || <Zap size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2a2420] dark:text-[#F5F0EB]">{plano.nome}</h3>
                    {plano.badge && <Badge variant="plan">{plano.badge}</Badge>}
                  </div>
                </div>

                {plano.tagline && (
                  <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4] mb-4">{plano.tagline}</p>
                )}

                <div className="mb-4">
                  <span className="text-3xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">
                    {formatCurrency(price)}
                  </span>
                  <span className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">{priceLabel}</span>
                  {ciclo === 'ANUAL' && plano.descontoPercentualAnual && (
                    <div className="mt-1">
                      <Badge variant="success">
                        {plano.descontoPercentualAnual}% de desconto
                      </Badge>
                    </div>
                  )}
                </div>

                {plano.features.length > 0 && (
                  <div className="space-y-2.5 mb-6 flex-1">
                    {plano.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        {feat.included ? (
                          <Check size={16} className="text-[#4f6f64] dark:text-[#6B8F82] shrink-0 mt-0.5" />
                        ) : (
                          <X size={16} className="text-[#d8ccc4] dark:text-[#2D2925] shrink-0 mt-0.5" />
                        )}
                        <span className={cn(
                          'text-sm',
                          feat.included
                            ? 'text-[#2a2420] dark:text-[#F5F0EB]'
                            : 'text-[#6b5d57] dark:text-[#7A716A] line-through'
                        )}>
                          {feat.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant={plano.popular ? 'primary' : 'outline'}
                  fullWidth
                  disabled={isCurrentPlan}
                  onClick={() => setSelectedPlano(plano)}
                >
                  {isCurrentPlan ? 'Plano atual' : plano.cta || 'Escolher plano'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default EscolherPlano
