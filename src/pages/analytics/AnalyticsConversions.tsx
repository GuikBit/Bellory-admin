import { useOutletContext } from 'react-router-dom'
import { DoughnutChartCard } from '../../components/charts/DoughnutChart'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { MetricCard } from '../../components/ui/MetricCard'
import { useAnalyticsConversions } from '../../queries/useAnalytics'
import { formatNumber, formatPercent, formatDays } from '../../utils/format'
import { Clock, CreditCard, Calendar } from 'lucide-react'

const funnelSteps = [
  { key: 'totalVisitors', label: 'Visitantes Totais' },
  { key: 'viewedPricing', label: 'Viram Preços' },
  { key: 'startedCadastro', label: 'Iniciaram Cadastro' },
  { key: 'completedStep0_empresa', label: 'Empresa' },
  { key: 'completedStep1_localizacao', label: 'Localização' },
  { key: 'completedStep2_acesso', label: 'Acesso' },
  { key: 'completedStep3_tema', label: 'Tema' },
  { key: 'completedStep4_plano', label: 'Plano' },
  { key: 'completedCadastro', label: 'Cadastro Completo' },
] as const

export function AnalyticsConversions() {
  const { startDate, endDate } = useOutletContext<{ startDate: string; endDate: string }>()
  const { data, isLoading } = useAnalyticsConversions(startDate, endDate)

  if (isLoading || !data) {
    return <ConversionsSkeleton />
  }

  const maxValue = data.funnel.totalVisitors || 1

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Funil de Conversão</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {funnelSteps.map((step, idx) => {
              const value = data.funnel[step.key]
              const prevValue = idx > 0 ? data.funnel[funnelSteps[idx - 1].key] : value
              const dropOff = idx > 0 && prevValue > 0 ? ((prevValue - value) / prevValue * 100) : 0
              const widthPercent = Math.max((value / maxValue) * 100, 4)

              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className="w-36 shrink-0 text-right">
                    <span className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">{step.label}</span>
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-8 bg-[#faf8f6] dark:bg-[#2D2925] rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-[#db6f57]/80 dark:bg-[#E07A62]/80 rounded-lg transition-all duration-500 flex items-center px-2"
                        style={{ width: `${widthPercent}%` }}
                      >
                        <span className="text-xs font-medium text-white whitespace-nowrap">
                          {formatNumber(value)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-20 shrink-0 text-right">
                    {idx > 0 && dropOff > 0 && (
                      <span className="text-xs text-red-500">-{formatPercent(dropOff)}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChartCard
          title="Distribuição por Plano"
          labels={data.planDistribution.map((p) => p.planName)}
          data={data.planDistribution.map((p) => p.count)}
        />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Mensal"
              value={formatNumber(data.billingPreference.monthly)}
              icon={<Calendar size={20} />}
              iconBg="bg-[#5B7BA5]/10 text-[#5B7BA5] dark:bg-[#7A9BC5]/10 dark:text-[#7A9BC5]"
            />
            <MetricCard
              title="Anual"
              value={formatNumber(data.billingPreference.annual)}
              subtitle={`${formatPercent(data.billingPreference.annualPercentage)} do total`}
              icon={<CreditCard size={20} />}
              iconBg="bg-[#4f6f64]/10 text-[#4f6f64] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]"
            />
          </div>
          <MetricCard
            title="Tempo Médio para Conversão"
            value={formatDays(data.averageTimeToConvert.fromFirstVisitMs)}
            subtitle={`~${data.averageTimeToConvert.averageSessions.toFixed(1)} sessões`}
            icon={<Clock size={20} />}
            iconBg="bg-[#8B6F47]/10 text-[#8B6F47] dark:bg-[#A8875A]/10 dark:text-[#A8875A]"
          />
        </div>
      </div>
    </div>
  )
}

function ConversionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-96 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
        <div className="h-80 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
      </div>
    </div>
  )
}
