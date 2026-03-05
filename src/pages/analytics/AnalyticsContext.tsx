import { useOutletContext } from 'react-router-dom'
import { DoughnutChartCard } from '../../components/charts/DoughnutChart'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { useAnalyticsContext } from '../../queries/useAnalytics'
import { formatNumber, formatPercent } from '../../utils/format'
import { cn } from '../../utils/cn'
import { AlertTriangle } from 'lucide-react'

const WEB_VITALS_THRESHOLDS: Record<string, { good: number; poor: number; unit: string; label: string }> = {
  fcp:  { good: 1800, poor: 3000, unit: 'ms', label: 'FCP' },
  lcp:  { good: 2500, poor: 4000, unit: 'ms', label: 'LCP' },
  fid:  { good: 100,  poor: 300,  unit: 'ms', label: 'FID' },
  cls:  { good: 0.1,  poor: 0.25, unit: '',   label: 'CLS' },
  ttfb: { good: 800,  poor: 1800, unit: 'ms', label: 'TTFB' },
}

function getHealthColor(metric: string, value: number) {
  const t = WEB_VITALS_THRESHOLDS[metric]
  if (value <= t.good) return { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' }
  if (value <= t.poor) return { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', dot: 'bg-yellow-500' }
  return { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' }
}

export function AnalyticsContext() {
  const { startDate, endDate } = useOutletContext<{ startDate: string; endDate: string }>()
  const { data, isLoading } = useAnalyticsContext(startDate, endDate)

  if (isLoading || !data) {
    return <ContextSkeleton />
  }

  const deviceLabels = ['Desktop', 'Mobile', 'Tablet']
  const deviceData = [data.devices.desktop.visitors, data.devices.mobile?.visitors, data.devices.tablet?.visitors]
  const deviceRates = [data.devices.desktop, data.devices.mobile, data.devices.tablet]

  return (
    <div className="space-y-6">
      {/* Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChartCard
          title="Dispositivos"
          labels={deviceLabels}
          data={deviceData}
        />
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Conversão por Dispositivo</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceLabels.map((label, i) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">{label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                      {formatPercent(deviceRates[i]?.percentage)}
                    </span>
                    <span className="text-sm font-medium text-[#4f6f64] dark:text-[#6B8F82]">
                      {formatPercent(deviceRates[i]?.conversionRate)} conv.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Browsers & OS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Browsers</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                    <th className="text-left py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Browser</th>
                    <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Visitantes</th>
                    <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.browsers.map((b) => (
                    <tr key={b.browser} className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                      <td className="py-2.5 text-[#2a2420] dark:text-[#F5F0EB]">{b.browser}</td>
                      <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(b.visitors)}</td>
                      <td className="py-2.5 text-right text-[#6b5d57] dark:text-[#B8AEA4]">{formatPercent(b.percentage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Sistemas Operacionais</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                    <th className="text-left py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">SO</th>
                    <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Visitantes</th>
                    <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.osList.map((o) => (
                    <tr key={o.os} className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                      <td className="py-2.5 text-[#2a2420] dark:text-[#F5F0EB]">{o.os}</td>
                      <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(o.visitors)}</td>
                      <td className="py-2.5 text-right text-[#6b5d57] dark:text-[#B8AEA4]">{formatPercent(o.percentage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geo */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Geolocalização</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A] mb-3">Estados</h4>
              <table className="w-full text-sm">
                <tbody>
                  {data.geo.states.map((s) => (
                    <tr key={s.name} className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                      <td className="py-2 text-[#2a2420] dark:text-[#F5F0EB]">{s.name}</td>
                      <td className="py-2 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(s.visitors)}</td>
                      <td className="py-2 text-right text-[#6b5d57] dark:text-[#B8AEA4] w-16">{formatPercent(s.percentage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A] mb-3">Cidades</h4>
              <table className="w-full text-sm">
                <tbody>
                  {data.geo.cities.map((c) => (
                    <tr key={c.name} className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                      <td className="py-2 text-[#2a2420] dark:text-[#F5F0EB]">{c.name}</td>
                      <td className="py-2 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(c.visitors)}</td>
                      <td className="py-2 text-right text-[#6b5d57] dark:text-[#B8AEA4] w-16">{formatPercent(c.percentage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Web Vitals */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Core Web Vitals</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {Object.entries(WEB_VITALS_THRESHOLDS).map(([key, meta]) => {
              const value = data.performance.averages[key as keyof typeof data.performance.averages]
              const health = getHealthColor(key, value)
              return (
                <div key={key} className={cn('rounded-xl p-4 text-center', health.bg)}>
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <div className={cn('w-2 h-2 rounded-full', health.dot)} />
                    <span className="text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4]">{meta.label}</span>
                  </div>
                  <div className={cn('text-xl font-bold', health.text)}>
                    {key === 'cls' ? value.toFixed(2) : `${Math.round(value)}${meta.unit}`}
                  </div>
                </div>
              )
            })}
          </div>

          <h4 className="text-xs font-medium uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A] mb-3">Percentis</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                  <th className="text-left py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Percentil</th>
                  <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">LCP</th>
                  <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">FID</th>
                  <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">CLS</th>
                </tr>
              </thead>
              <tbody>
                {(['p50', 'p75', 'p95'] as const).map((p) => (
                  <tr key={p} className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                    <td className="py-2.5 font-medium text-[#2a2420] dark:text-[#F5F0EB] uppercase">{p}</td>
                    <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{data.performance.percentiles[p].lcp}ms</td>
                    <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{data.performance.percentiles[p].fid}ms</td>
                    <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{data.performance.percentiles[p].cls?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
              Erros ({formatNumber(data.errors.total)})
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          {data.errors.topErrors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                    <th className="text-left py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Mensagem</th>
                    <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Contagem</th>
                    <th className="text-right py-2 font-medium text-[#6b5d57] dark:text-[#7A716A]">Última Ocorrência</th>
                  </tr>
                </thead>
                <tbody>
                  {data.errors.topErrors.map((e, i) => (
                    <tr key={i} className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                      <td className="py-2.5 text-[#2a2420] dark:text-[#F5F0EB] max-w-xs truncate">{e.message}</td>
                      <td className="py-2.5 text-right text-[#2a2420] dark:text-[#F5F0EB]">{formatNumber(e.count)}</td>
                      <td className="py-2.5 text-right text-[#6b5d57] dark:text-[#B8AEA4]">
                        {new Date(e.lastOccurrence).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">Nenhum erro registrado no período.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ContextSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
        <div className="h-80 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-48 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
      ))}
    </div>
  )
}
