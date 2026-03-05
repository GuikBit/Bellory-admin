import { useOutletContext } from 'react-router-dom'
import { BarChartCard } from '../../components/charts/BarChart'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { useAnalyticsBehavior } from '../../queries/useAnalytics'
import { formatNumber, formatPercent } from '../../utils/format'

export function AnalyticsBehavior() {
  const { startDate, endDate } = useOutletContext<{ startDate: string; endDate: string }>()
  const { data, isLoading } = useAnalyticsBehavior(startDate, endDate)

  if (isLoading || !data) {
    return <BehaviorSkeleton />
  }

  const scrollLabels = ['25%', '50%', '75%', '100%']
  const scrollData = [data.scrollDepth['25'], data.scrollDepth['50'], data.scrollDepth['75'], data.scrollDepth['100']]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Top CTAs</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                  <th className="text-left py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Elemento</th>
                  <th className="text-left py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Seção</th>
                  <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Cliques</th>
                </tr>
              </thead>
              <tbody>
                {data.topCTAs.map((cta) => (
                  <tr key={cta.elementId} className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                    <td className="py-2.5">
                      <div className="text-[#2a2420] dark:text-[#F5F0EB]">{cta.label}</div>
                      <div className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{cta.elementId}</div>
                    </td>
                    <td className="py-2.5 text-[#6b5d57] dark:text-[#B8AEA4] capitalize">{cta.section}</td>
                    <td className="py-2.5 text-right font-medium text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(cta.clicks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard
          title="Scroll Depth"
          labels={scrollLabels}
          datasets={[{ label: '% dos usuários', data: scrollData, color: 'primary' }]}
        />
        <BarChartCard
          title="Visibilidade das Seções"
          labels={data.sectionVisibility.map((s) => s.section)}
          datasets={[{ label: 'View Rate (%)', data: data.sectionVisibility.map((s) => s.viewRate), color: 'secondary' }]}
        />
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Páginas de Saída</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                  <th className="text-left py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Página</th>
                  <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Saídas</th>
                  <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Exit Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.flows.exitPages.map((page) => (
                  <tr key={page.path} className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                    <td className="py-2.5 text-[#2a2420] dark:text-[#F5F0EB]">{page.path}</td>
                    <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(page.exits)}</td>
                    <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatPercent(page.exitRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BehaviorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-64 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
        <div className="h-80 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
      </div>
      <div className="h-48 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
    </div>
  )
}
