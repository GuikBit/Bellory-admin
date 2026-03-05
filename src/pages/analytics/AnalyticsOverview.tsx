import { useOutletContext } from 'react-router-dom'
import { Users, Activity, Clock, TrendingDown, CheckCircle, Percent } from 'lucide-react'
import { MetricCard } from '../../components/ui/MetricCard'
import { DoughnutChartCard } from '../../components/charts/DoughnutChart'
import { BarChartCard } from '../../components/charts/BarChart'
import { useAnalyticsOverview } from '../../queries/useAnalytics'
import { formatNumber, formatPercent, formatDuration } from '../../utils/format'

export function AnalyticsOverview() {
  const { startDate, endDate } = useOutletContext<{ startDate: string; endDate: string }>()
  const { data, isLoading } = useAnalyticsOverview(startDate, endDate)

  if (isLoading || !data) {
    return <OverviewSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Visitantes"
          value={formatNumber(data.visitors.total)}
          subtitle={`${formatNumber(data.visitors.newVisitors)} novos`}
          icon={<Users size={20} />}
        />
        <MetricCard
          title="Sessões"
          value={formatNumber(data.sessions.total)}
          subtitle={`${data.sessions.averagePages.toFixed(1)} pág/sessão`}
          icon={<Activity size={20} />}
          iconBg="bg-[#4f6f64]/10 text-[#4f6f64] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]"
        />
        <MetricCard
          title="Duração Média"
          value={formatDuration(data.sessions.averageDuration)}
          icon={<Clock size={20} />}
          iconBg="bg-[#8B6F47]/10 text-[#8B6F47] dark:bg-[#A8875A]/10 dark:text-[#A8875A]"
        />
        <MetricCard
          title="Bounce Rate"
          value={formatPercent(data.sessions.bounceRate)}
          icon={<TrendingDown size={20} />}
          iconBg="bg-[#5B7BA5]/10 text-[#5B7BA5] dark:bg-[#7A9BC5]/10 dark:text-[#7A9BC5]"
        />
        <MetricCard
          title="Conversões"
          value={formatNumber(data.conversions.cadastroCompleted)}
          subtitle={`${formatNumber(data.conversions.cadastroStarted)} iniciados`}
          icon={<CheckCircle size={20} />}
          iconBg="bg-[#4f6f64]/10 text-[#4f6f64] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]"
        />
        <MetricCard
          title="Taxa de Conversão"
          value={formatPercent(data.conversions.conversionRate)}
          icon={<Percent size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChartCard
          title="Novos vs Recorrentes"
          labels={['Novos', 'Recorrentes']}
          data={[data.visitors.newVisitors, data.visitors.returning]}
        />
        <BarChartCard
          title="Páginas Mais Visitadas"
          labels={data.topPages.map((p) => p.path)}
          datasets={[{
            label: 'Visualizações',
            data: data.topPages.map((p) => p.views),
            color: 'primary',
          }]}
        />
      </div>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
        <div className="h-80 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
      </div>
    </div>
  )
}
