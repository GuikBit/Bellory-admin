import { useMetricasPlanos } from '../../queries/useMetricas'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { DoughnutChartCard } from '../../components/charts/DoughnutChart'
import { MetricCardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton'
import { formatCurrency, formatPercent, formatNumber } from '../../utils/format'
import { CreditCard, Star } from 'lucide-react'

export function Planos() {
  const { data, isLoading } = useMetricasPlanos()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChartCard
          title="Distribuição por Plano"
          labels={data.distribuicao.map(p => p.nome)}
          data={data.distribuicao.map(p => p.totalOrganizacoes)}
        />

        <div className="space-y-4">
          {data.distribuicao.map((plano) => (
            <Card key={plano.planoId} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#db6f57]/10 dark:bg-[#E07A62]/10 flex items-center justify-center">
                    <CreditCard size={18} className="text-[#db6f57] dark:text-[#E07A62]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">{plano.nome}</p>
                      {plano.popular && (
                        <Badge variant="plan"><Star size={10} className="mr-1" /> Popular</Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">
                      {formatCurrency(plano.precoMensal)}/mês
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(plano.totalOrganizacoes)}</p>
                  <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{formatPercent(plano.percentualDistribuicao)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
