import { useState } from 'react'
import { Card, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { cn } from '../../utils/cn'
import { useAtendimentos } from '../../queries/useSuporte'
import { ChatAtendimento } from './ChatAtendimento'
import {
  Search,
  MessageSquare,
  ArrowUpRight,
  CheckCircle,
  Clock,
  User,
  Bot,
  Mail,
  Loader2,
  UserCheck,
} from 'lucide-react'
import type { Sessao } from '../../types/suporte'

type StatusFilter = 'todos' | 'ativo' | 'resolvido' | 'transferido'

const statusConfig = {
  ativo: { label: 'Em andamento', variant: 'info' as const, icon: Clock },
  resolvido: { label: 'Resolvido', variant: 'success' as const, icon: CheckCircle },
  transferido: { label: 'Transferido', variant: 'warning' as const, icon: ArrowUpRight },
  expirado: { label: 'Expirado', variant: 'default' as const, icon: Clock },
}

export function Atendimentos() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const { data, isLoading } = useAtendimentos({
    status: statusFilter !== 'todos' ? statusFilter : undefined,
    search: search || undefined,
  })

  const sessoes = data?.sessoes || []
  const counts = data?.counts || { todos: 0, ativo: 0, resolvido: 0, transferido: 0 }

  // Se uma sessão está selecionada, mostrar o chat
  if (selectedSessionId) {
    return (
      <Card>
        <ChatAtendimento
          sessionId={selectedSessionId}
          onClose={() => setSelectedSessionId(null)}
        />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros de Status */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          { id: 'todos' as StatusFilter, label: 'Todos' },
          { id: 'ativo' as StatusFilter, label: 'Em Andamento' },
          { id: 'resolvido' as StatusFilter, label: 'Resolvidos' },
          { id: 'transferido' as StatusFilter, label: 'Transferidos' },
        ]).map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border',
              statusFilter === f.id
                ? 'bg-[#db6f57]/10 text-[#db6f57] border-[#db6f57]/30 dark:bg-[#E07A62]/10 dark:text-[#E07A62] dark:border-[#E07A62]/30'
                : 'bg-white dark:bg-[#1A1715] text-[#6b5d57] dark:text-[#B8AEA4] border-[#d8ccc4] dark:border-[#2D2925] hover:border-[#db6f57]/30'
            )}
          >
            {f.label}
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full',
              statusFilter === f.id
                ? 'bg-[#db6f57]/20 dark:bg-[#E07A62]/20'
                : 'bg-[#d8ccc4]/30 dark:bg-[#2D2925]'
            )}>
              {counts[f.id === 'todos' ? 'todos' : f.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="py-3">
          <Input
            placeholder="Buscar por cliente ou assunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#db6f57] dark:text-[#E07A62]" />
        </div>
      )}

      {/* Lista de Atendimentos */}
      {!isLoading && (
        <div className="space-y-3">
          {sessoes.map((sessao) => (
            <SessaoCard
              key={sessao.id}
              sessao={sessao}
              onClick={() => setSelectedSessionId(sessao.id)}
            />
          ))}
        </div>
      )}

      {!isLoading && sessoes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare size={40} className="mx-auto text-[#d8ccc4] dark:text-[#2D2925] mb-3" />
            <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">Nenhum atendimento encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SessaoCard({ sessao, onClick }: { sessao: Sessao; onClick: () => void }) {
  const config = statusConfig[sessao.status] || statusConfig.ativo
  const StatusIcon = config.icon

  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#4f6f64] dark:bg-[#6B8F82] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-medium">
                {sessao.usuario_nome?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm text-[#2a2420] dark:text-[#F5F0EB]">
                  {sessao.usuario_nome || 'Cliente'}
                </h4>
                <Badge variant={config.variant}>
                  <StatusIcon size={10} className="mr-1" />
                  {config.label}
                </Badge>
                {sessao.modo === 'humano' && (
                  <Badge variant="plan">
                    <UserCheck size={10} className="mr-1" />
                    Humano
                  </Badge>
                )}
              </div>
              <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4] mt-0.5 truncate">
                {sessao.assunto || 'Sem assunto'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(sessao.criado_em).toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                {sessao.total_mensagens != null && (
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {sessao.total_mensagens} msgs
                  </span>
                )}
                <span className="flex items-center gap-1">
                  {sessao.modo === 'ia' ? <Bot size={12} /> : <User size={12} />}
                  {sessao.modo === 'ia' ? 'IA' : 'Humano'}
                </span>
                {sessao.organizacao_nome && (
                  <span className="text-[#6b5d57]/60 dark:text-[#B8AEA4]/60">
                    {sessao.organizacao_nome}
                  </span>
                )}
              </div>
            </div>
          </div>
          {sessao.status === 'transferido' && (
            <div className="shrink-0">
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                <Mail size={12} />
                Aguardando
              </div>
            </div>
          )}
        </div>
        {sessao.motivo_transferencia && (
          <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Motivo:</strong> {sessao.motivo_transferencia}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
