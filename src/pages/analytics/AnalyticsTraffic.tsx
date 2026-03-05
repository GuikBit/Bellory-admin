import { useOutletContext } from 'react-router-dom'
import { DoughnutChartCard } from '../../components/charts/DoughnutChart'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { useAnalyticsTraffic } from '../../queries/useAnalytics'
import { formatNumber, formatPercent } from '../../utils/format'

export function AnalyticsTraffic() {
  const { startDate, endDate } = useOutletContext<{ startDate: string; endDate: string }>()
  const { data, isLoading } = useAnalyticsTraffic(startDate, endDate)

  if (isLoading || !data) {
    return <TrafficSkeleton />
  }

  return (
    <div className="space-y-6">
      <DoughnutChartCard
        title="Fontes de Tráfego"
        labels={data.sources.map((s) => s.source)}
        data={data.sources.map((s) => s.visitors)}
      />

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Fontes de Tráfego - Detalhes</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                  <th className="text-left py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Fonte</th>
                  <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Visitantes</th>
                  <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Sessões</th>
                  <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Conv. Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.sources.map((s) => (
                  <tr key={s.source} className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                    <td className="py-2.5 text-[#2a2420] dark:text-[#F5F0EB] capitalize">{s.source}</td>
                    <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(s.visitors)}</td>
                    <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(s.sessions)}</td>
                    <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatPercent(s.conversionRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {data.campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Campanhas UTM</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                    <th className="text-left py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Campanha</th>
                    <th className="text-left py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Fonte</th>
                    <th className="text-left py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Meio</th>
                    <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Visitantes</th>
                    <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Conversões</th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((c) => (
                    <tr key={c.campaign} className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                      <td className="py-2.5 text-[#2a2420] dark:text-[#F5F0EB]">{c.campaign}</td>
                      <td className="py-2.5 text-[#6b5d57] dark:text-[#B8AEA4]">{c.source}</td>
                      <td className="py-2.5 text-[#6b5d57] dark:text-[#B8AEA4]">{c.medium}</td>
                      <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(c.visitors)}</td>
                      <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(c.conversions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {data.topReferrers.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Top Referrers</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                    <th className="text-left py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Referrer</th>
                    <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Visitantes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topReferrers.map((r) => (
                    <tr key={r.referrer} className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                      <td className="py-2.5 text-[#2a2420] dark:text-[#F5F0EB]">{r.referrer}</td>
                      <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(r.visitors)}</td>
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

function TrafficSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-64 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
      ))}
    </div>
  )
}
