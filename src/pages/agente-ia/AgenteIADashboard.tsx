import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useDashboardSuporte } from '../../queries/useSuporte'
import {
  MessageSquare,
  UserCheck,
  ArrowUpRight,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  TrendingUp,
  Bot,
  Zap,
  Loader2,
  Activity,
} from 'lucide-react'

export function AgenteIADashboard() {
  const { data, isLoading, error } = useDashboardSuporte()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#db6f57] dark:text-[#E07A62]" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <AgentStatusCard />
        <div className="text-center py-12">
          <Bot size={40} className="mx-auto text-[#d8ccc4] dark:text-[#2D2925] mb-3" />
          <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
            Não foi possível carregar os dados do dashboard.
          </p>
          <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mt-1">
            Verifique se os webhooks do n8n estão ativos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AgentStatusCard />

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={MessageSquare}
          label="Atendimentos Hoje"
          value={data.sessoes_hoje}
          subtext={`${data.total_sessoes} total`}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-100 dark:bg-blue-900/30"
        />
        <MetricCard
          icon={UserCheck}
          label="Resolvidos pelo Agente"
          value={`${data.taxa_resolucao}%`}
          subtext={`${data.resolvidas_ia} atendimentos`}
          color="text-green-600 dark:text-green-400"
          bgColor="bg-green-100 dark:bg-green-900/30"
        />
        <MetricCard
          icon={Activity}
          label="Em Andamento"
          value={data.ativas}
          subtext="Sessões ativas"
          color="text-purple-600 dark:text-purple-400"
          bgColor="bg-purple-100 dark:bg-purple-900/30"
        />
        <MetricCard
          icon={ArrowUpRight}
          label="Transferidos"
          value={data.transferidas}
          subtext={`${data.ativas} em andamento`}
          color="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-100 dark:bg-amber-900/30"
        />
      </div>

      {/* Satisfação + Top Assuntos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Satisfação */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ThumbsUp size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Avaliação das Respostas</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-[#d8ccc4]/30 dark:text-[#2D2925]"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${data.satisfacao.percentual}, 100`}
                      className="text-green-500 dark:text-green-400"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">{data.satisfacao.percentual}%</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">Avaliações positivas</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ThumbsUp size={14} className="text-green-500" />
                  <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">{data.satisfacao.positivo} positivas</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown size={14} className="text-red-500" />
                  <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">{data.satisfacao.negativo} negativas</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">{data.transferidas} transferidos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Assuntos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Assuntos Mais Frequentes</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.top_assuntos?.length > 0 ? data.top_assuntos.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-[#db6f57] dark:text-[#E07A62] w-5 shrink-0">#{i + 1}</span>
                    <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB] truncate">{item.assunto}</span>
                  </div>
                  <Badge variant="default" className="shrink-0 ml-2">{item.total}x</Badge>
                </div>
              )) : (
                <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4] text-center py-4">Sem dados ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atendimentos Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
            <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Atendimentos Recentes</h3>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                  <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Cliente</th>
                  <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Módulo</th>
                  <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Modo</th>
                  <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8ccc4] dark:divide-[#2D2925]">
                {data.sessoes_recentes?.length > 0 ? data.sessoes_recentes.map((a, i) => (
                  <tr key={`${a.id}-${i}`} className="hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/50 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{a.usuario_nome || a.organizacao_nome || '-'}</td>
                    <td className="px-6 py-3 text-sm text-[#6b5d57] dark:text-[#B8AEA4] max-w-[200px] truncate">{a.modulo || '-'}</td>
                    <td className="px-6 py-3">
                      <Badge variant={a.status === 'resolvido' ? 'success' : a.status === 'transferido' ? 'warning' : 'info'}>
                        {a.status === 'resolvido' ? 'Resolvido' : a.status === 'transferido' ? 'Transferido' : 'Ativo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                      {a.modo === 'ia' ? 'IA' : 'Humano'}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                      {new Date(a.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                      Nenhum atendimento ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AgentStatusCard() {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#db6f57] to-[#8b3d35] dark:from-[#E07A62] dark:to-[#A8524A] flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Agente Bellory</h3>
              <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">Suporte N1 · Gemini via n8n</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Online</span>
            <Badge variant="success">Ativo</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricCard({ icon: Icon, label, value, subtext, color, bgColor }: {
  icon: React.ElementType
  label: string
  value: string | number
  subtext: string
  color: string
  bgColor: string
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
            <Icon size={20} className={color} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mb-0.5">{label}</p>
            <p className="text-xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">{value}</p>
            <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mt-0.5">{subtext}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
