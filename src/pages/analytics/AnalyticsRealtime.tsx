import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { MetricCard } from '../../components/ui/MetricCard'
import { useAnalyticsRealtime } from '../../queries/useAnalytics'
import { formatNumber, formatDateTime } from '../../utils/format'
import { Users, Eye, Zap, Radio } from 'lucide-react'

const eventLabels: Record<string, string> = {
  cadastro_completed: 'Cadastro completo',
  cadastro_started: 'Cadastro iniciado',
  click_cta: 'Clique CTA',
  click_button: 'Clique botão',
  click_plan: 'Clique plano',
  plan_viewed: 'Plano visualizado',
}

export function AnalyticsRealtime() {
  const { data, isLoading } = useAnalyticsRealtime()

  if (isLoading || !data) {
    return <RealtimeSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Active visitors - big number */}
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-green-500 animate-pulse" />
              <span className="text-sm font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider">
                Visitantes ativos agora
              </span>
            </div>
            <div className="text-6xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">
              {data.activeVisitors}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last 30 min cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Visitantes (30min)"
          value={formatNumber(data.last30Minutes.visitors)}
          icon={<Users size={20} />}
        />
        <MetricCard
          title="Page Views (30min)"
          value={formatNumber(data.last30Minutes.pageViews)}
          icon={<Eye size={20} />}
          iconBg="bg-[#4f6f64]/10 text-[#4f6f64] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]"
        />
        <MetricCard
          title="Conversões (30min)"
          value={formatNumber(data.last30Minutes.conversions)}
          icon={<Zap size={20} />}
          iconBg="bg-[#8B6F47]/10 text-[#8B6F47] dark:bg-[#A8875A]/10 dark:text-[#A8875A]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active pages */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Páginas Ativas</h3>
          </CardHeader>
          <CardContent>
            {data.activePages.length > 0 ? (
              <div className="space-y-3">
                {data.activePages.map((page) => (
                  <div key={page.path} className="flex items-center justify-between">
                    <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB] font-mono">{page.path}</span>
                    <span className="text-sm font-medium text-[#db6f57] dark:text-[#E07A62]">
                      {page.visitors} {page.visitors === 1 ? 'visitante' : 'visitantes'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">Nenhuma página ativa no momento.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent events */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Eventos Recentes</h3>
          </CardHeader>
          <CardContent>
            {data.recentEvents.length > 0 ? (
              <div className="space-y-3">
                {data.recentEvents.map((event, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50 last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-[#db6f57] dark:bg-[#E07A62] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">
                        {eventLabels[event.type] || event.type}
                        {event.planName && (
                          <span className="ml-1 text-[#4f6f64] dark:text-[#6B8F82]">— {event.planName}</span>
                        )}
                        {event.elementLabel && (
                          <span className="ml-1 text-[#6b5d57] dark:text-[#B8AEA4]">— {event.elementLabel}</span>
                        )}
                      </div>
                      <div className="text-xs text-[#6b5d57] dark:text-[#7A716A]">
                        {formatDateTime(event.occurredAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">Nenhum evento recente.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RealtimeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
        <div className="h-64 rounded-xl bg-[#faf8f6] dark:bg-[#2D2925] animate-pulse" />
      </div>
    </div>
  )
}
