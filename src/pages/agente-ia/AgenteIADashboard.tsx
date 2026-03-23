import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useDashboardSuporte } from '../../queries/useSuporte'
import {
  MessageSquare,
  UserCheck,
  Clock,
  ArrowUpRight,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  TrendingUp,
  Bot,
  Zap,
  Loader2,
} from 'lucide-react'

// Extrai valor numérico de um campo que pode ser number ou objeto {percentual, positivo, total}
function toNumber(val: unknown, fallback = 0): number {
  if (typeof val === 'number') return val
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>
    if (typeof obj.percentual === 'number') return obj.percentual
    if (typeof obj.total === 'number') return obj.total
    if (typeof obj.positivo === 'number') return obj.positivo
  }
  if (typeof val === 'string') return parseFloat(val) || fallback
  return fallback
}

export function AgenteIADashboard() {
  const { data: rawData, isLoading, error } = useDashboardSuporte()

  // Normaliza os dados para garantir que são valores renderizáveis
  const data = rawData ? {
    ...rawData,
    satisfacao: toNumber(rawData.satisfacao),
    taxaResolucao: toNumber(rawData.taxaResolucao),
    contagemPositivas: toNumber(rawData.contagemPositivas),
    contagemNegativas: toNumber(rawData.contagemNegativas),
    totalAtendimentos: toNumber(rawData.totalAtendimentos),
    atendimentosHoje: toNumber(rawData.atendimentosHoje),
    resolvidosPeloAgente: toNumber(rawData.resolvidosPeloAgente),
    transferidosParaHumano: toNumber(rawData.transferidosParaHumano),
    atendimentosEmAndamento: toNumber(rawData.atendimentosEmAndamento),
  } : null

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
        {/* Status do Agente */}
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
      {/* Status do Agente */}
      <AgentStatusCard />

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={MessageSquare}
          label="Atendimentos Hoje"
          value={data.atendimentosHoje}
          subtext={`${data.totalAtendimentos} total`}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-100 dark:bg-blue-900/30"
        />
        <MetricCard
          icon={UserCheck}
          label="Resolvidos pelo Agente"
          value={`${data.taxaResolucao}%`}
          subtext={`${data.resolvidosPeloAgente} atendimentos`}
          color="text-green-600 dark:text-green-400"
          bgColor="bg-green-100 dark:bg-green-900/30"
        />
        <MetricCard
          icon={Clock}
          label="Tempo Médio Resposta"
          value={data.tempoMedioResposta}
          subtext="Média últimas 24h"
          color="text-purple-600 dark:text-purple-400"
          bgColor="bg-purple-100 dark:bg-purple-900/30"
        />
        <MetricCard
          icon={ArrowUpRight}
          label="Transferidos"
          value={data.transferidosParaHumano}
          subtext={`${data.atendimentosEmAndamento} em andamento`}
          color="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-100 dark:bg-amber-900/30"
        />
      </div>

      {/* Satisfação + Top Perguntas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Satisfação */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ThumbsUp size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Satisfação do Cliente</h3>
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
                      strokeDasharray={`${data.satisfacao}, 100`}
                      className="text-green-500 dark:text-green-400"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">{data.satisfacao}%</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">Avaliações positivas</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ThumbsUp size={14} className="text-green-500" />
                  <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">{data.contagemPositivas} positivas</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown size={14} className="text-red-500" />
                  <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">{data.contagemNegativas} negativas</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">{data.transferidosParaHumano} transferidos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Perguntas */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Perguntas Mais Frequentes</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topPerguntas?.length > 0 ? data.topPerguntas.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-[#db6f57] dark:text-[#E07A62] w-5 shrink-0">#{i + 1}</span>
                    <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB] truncate">{item.pergunta}</span>
                  </div>
                  <Badge variant="default" className="shrink-0 ml-2">{item.quantidade}x</Badge>
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
                  <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Assunto</th>
                  <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Modo</th>
                  <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8ccc4] dark:divide-[#2D2925]">
                {data.atendimentosRecentes?.length > 0 ? data.atendimentosRecentes?.map((a) => (
                  <tr key={a.id} className="hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/50 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{a.usuario_nome || '-'}</td>
                    <td className="px-6 py-3 text-sm text-[#6b5d57] dark:text-[#B8AEA4] max-w-[200px] truncate">{a.assunto || '-'}</td>
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
