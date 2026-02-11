import { useMetricasClientes } from '../../queries/useMetricas'
import { MetricCard } from '../../components/ui/MetricCard'
import { Card, CardContent } from '../../components/ui/Card'
import { MetricCardSkeleton, ChartSkeleton } from '../../components/ui/Skeleton'
import { LineChartCard } from '../../components/charts/LineChart'
import { formatNumber, formatMonthYear } from '../../utils/format'
import { Users, UserCheck, UserX, Building2 } from 'lucide-react'

export function Clientes() {
  const { data, isLoading } = useMetricasClientes()

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Clientes" value={formatNumber(data.totalClientesGeral)} icon={<Users size={20} />} iconBg="bg-[#db6f57]/10 text-[#db6f57] dark:bg-[#E07A62]/10 dark:text-[#E07A62]" />
        <MetricCard title="Ativos" value={formatNumber(data.clientesAtivos)} icon={<UserCheck size={20} />} iconBg="bg-[#4f6f64]/10 text-[#4f6f64] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]" />
        <MetricCard title="Inativos" value={formatNumber(data.clientesInativos)} icon={<UserX size={20} />} iconBg="bg-red-500/10 text-red-500" />
        <MetricCard title="Média por Org" value={data.mediaClientesPorOrganizacao.toFixed(1)} icon={<Building2 size={20} />} iconBg="bg-violet-500/10 text-violet-500" />
      </div>

      {data.evolucaoMensal.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChartCard
            title="Novos Clientes por Mês"
            labels={data.evolucaoMensal.map(e => formatMonthYear(e.mes))}
            datasets={[{ label: 'Novos Clientes', data: data.evolucaoMensal.map(e => e.novosClientes), color: 'primary' }]}
          />
          <LineChartCard
            title="Total Acumulado"
            labels={data.evolucaoMensal.map(e => formatMonthYear(e.mes))}
            datasets={[{ label: 'Total', data: data.evolucaoMensal.map(e => e.totalAcumulado), color: 'secondary' }]}
          />
        </div>
      )}

      {data.porOrganizacao.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-4">Clientes por Organização</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                    <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Organização</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Total</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Ativos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.porOrganizacao.map((o) => (
                    <tr key={o.organizacaoId} className="border-b border-[#d8ccc4]/30 dark:border-[#2D2925]/30 hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/30">
                      <td className="py-2.5 px-3 font-medium text-[#2a2420] dark:text-[#F5F0EB]">{o.nomeFantasia}</td>
                      <td className="py-2.5 px-3 text-right">{formatNumber(o.totalClientes)}</td>
                      <td className="py-2.5 px-3 text-right text-[#4f6f64] dark:text-[#6B8F82]">{formatNumber(o.clientesAtivos)}</td>
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
