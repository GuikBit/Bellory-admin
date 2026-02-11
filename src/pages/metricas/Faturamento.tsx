import { useMetricasFaturamento } from '../../queries/useMetricas'
import { MetricCard } from '../../components/ui/MetricCard'
import { Card, CardContent } from '../../components/ui/Card'
import { MetricCardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton'
import { AreaChartCard } from '../../components/charts/AreaChart'
import { Badge } from '../../components/ui/Badge'
import { formatCurrency, formatNumber, formatMonthYear } from '../../utils/format'
import { DollarSign, TrendingUp, CreditCard, Receipt } from 'lucide-react'

export function Faturamento() {
  const { data, isLoading } = useMetricasFaturamento()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
        <ChartSkeleton />
      </div>
    )
  }

  if (!data) return null

  const planBadgeVariant: Record<string, 'default' | 'success' | 'info' | 'plan'> = {
    gratuito: 'default', basico: 'info', plus: 'plan', premium: 'success',
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Faturamento Total" value={formatCurrency(data.faturamentoTotalGeral)} icon={<DollarSign size={20} />} iconBg="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400" />
        <MetricCard title="Mês Atual" value={formatCurrency(data.faturamentoMesAtual)} trend={{ value: data.crescimentoPercentual }} subtitle="vs mês anterior" icon={<TrendingUp size={20} />} iconBg="bg-[#db6f57]/10 text-[#db6f57] dark:bg-[#E07A62]/10 dark:text-[#E07A62]" />
        <MetricCard title="Ticket Médio" value={formatCurrency(data.ticketMedio)} icon={<Receipt size={20} />} iconBg="bg-violet-500/10 text-violet-500" />
        <MetricCard title="Pagamentos" value={formatNumber(data.totalPagamentos)} subtitle={`${formatNumber(data.pagamentosConfirmados)} confirmados`} icon={<CreditCard size={20} />} iconBg="bg-[#4f6f64]/10 text-[#4f6f64] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]" />
      </div>

      {data.evolucaoMensal.length > 0 && (
        <AreaChartCard
          title="Evolução do Faturamento"
          labels={data.evolucaoMensal.map(e => formatMonthYear(e.mes))}
          datasets={[{ label: 'Faturamento (R$)', data: data.evolucaoMensal.map(e => e.valor), color: 'primary' }]}
        />
      )}

      {data.porOrganizacao.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-4">Faturamento por Organização</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                    <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Organização</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Plano</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Total</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Mês</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Pagas</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Pendentes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.porOrganizacao.map((o) => (
                    <tr key={o.organizacaoId} className="border-b border-[#d8ccc4]/30 dark:border-[#2D2925]/30 hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/30">
                      <td className="py-2.5 px-3 font-medium text-[#2a2420] dark:text-[#F5F0EB]">{o.nomeFantasia}</td>
                      <td className="py-2.5 px-3"><Badge variant={planBadgeVariant[o.planoCodigo] || 'default'}>{o.planoCodigo}</Badge></td>
                      <td className="py-2.5 px-3 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatCurrency(o.faturamentoTotal)}</td>
                      <td className="py-2.5 px-3 text-right text-[#4f6f64] dark:text-[#6B8F82]">{formatCurrency(o.faturamentoMes)}</td>
                      <td className="py-2.5 px-3 text-right">{formatNumber(o.cobrancasPagas)}</td>
                      <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400">{formatNumber(o.cobrancasPendentes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
