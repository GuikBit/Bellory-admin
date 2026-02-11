import { useMetricasAgendamentos } from '../../queries/useMetricas'
import { MetricCard } from '../../components/ui/MetricCard'
import { Card, CardContent } from '../../components/ui/Card'
import { MetricCardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton'
import { LineChartCard } from '../../components/charts/LineChart'
import { BarChartCard } from '../../components/charts/BarChart'
import { formatNumber, formatPercent, formatMonthYear } from '../../utils/format'
import { CalendarCheck, CheckCircle, XCircle, Clock, AlertTriangle, UserX } from 'lucide-react'

export function Agendamentos() {
  const { data, isLoading } = useMetricasAgendamentos()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard title="Total Geral" value={formatNumber(data.totalGeral)} subtitle={`${formatNumber(data.totalNoMes)} no mês`} icon={<CalendarCheck size={20} />} iconBg="bg-[#db6f57]/10 text-[#db6f57] dark:bg-[#E07A62]/10 dark:text-[#E07A62]" />
        <MetricCard title="Concluídos" value={formatNumber(data.concluidos)} subtitle={formatPercent(data.taxaConclusao)} icon={<CheckCircle size={20} />} iconBg="bg-[#4f6f64]/10 text-[#4f6f64] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]" />
        <MetricCard title="Cancelados" value={formatNumber(data.cancelados)} subtitle={formatPercent(data.taxaCancelamento)} icon={<XCircle size={20} />} iconBg="bg-red-500/10 text-red-500" />
        <MetricCard title="Pendentes" value={formatNumber(data.pendentes)} icon={<Clock size={20} />} iconBg="bg-amber-500/10 text-amber-600" />
        <MetricCard title="Não Compareceu" value={formatNumber(data.naoCompareceu)} subtitle={formatPercent(data.taxaNoShow)} icon={<UserX size={20} />} iconBg="bg-violet-500/10 text-violet-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.evolucaoMensal.length > 0 && (
          <LineChartCard
            title="Evolução Mensal"
            labels={data.evolucaoMensal.map(e => formatMonthYear(e.mes))}
            datasets={[
              { label: 'Total', data: data.evolucaoMensal.map(e => e.total), color: 'primary' },
              { label: 'Concluídos', data: data.evolucaoMensal.map(e => e.concluidos), color: 'secondary' },
            ]}
          />
        )}

        {data.porOrganizacao.length > 0 && (
          <BarChartCard
            title="Top Organizações"
            labels={data.porOrganizacao.slice(0, 10).map(o => o.nomeFantasia)}
            datasets={[
              { label: 'Concluídos', data: data.porOrganizacao.slice(0, 10).map(o => o.concluidos), color: 'secondary' },
              { label: 'Cancelados', data: data.porOrganizacao.slice(0, 10).map(o => o.cancelados), color: 'primary' },
            ]}
            stacked
          />
        )}
      </div>

      {/* Table */}
      {data.porOrganizacao.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-4">Por Organização</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                    <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Organização</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Total</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Concluídos</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Cancelados</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Pendentes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.porOrganizacao.map((o) => (
                    <tr key={o.organizacaoId} className="border-b border-[#d8ccc4]/30 dark:border-[#2D2925]/30 hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/30">
                      <td className="py-2.5 px-3 font-medium text-[#2a2420] dark:text-[#F5F0EB]">{o.nomeFantasia}</td>
                      <td className="py-2.5 px-3 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(o.total)}</td>
                      <td className="py-2.5 px-3 text-right text-[#4f6f64] dark:text-[#6B8F82]">{formatNumber(o.concluidos)}</td>
                      <td className="py-2.5 px-3 text-right text-red-500">{formatNumber(o.cancelados)}</td>
                      <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400">{formatNumber(o.pendentes)}</td>
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
