import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { cn } from '../../utils/cn'
import {
  Send,
  User,
  Bot,
  UserCheck,
  Info,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { useAtendimentoDetalhe, useEnviarRespostaHumana, useResolverAtendimento, usePollingMensagensAdmin } from '../../queries/useSuporte'
import { useAuth } from '../../contexts/AuthContext'
import type { Mensagem } from '../../types/suporte'

interface ChatAtendimentoProps {
  sessionId: string
  onClose: () => void
}

const autorConfig = {
  cliente: { label: 'Cliente', icon: User, color: 'text-[#6b5d57] dark:text-[#B8AEA4]', bg: 'bg-[#faf8f6] dark:bg-[#2D2925]', align: 'justify-start' },
  agente: { label: 'Agente IA', icon: Bot, color: 'text-white', bg: 'bg-[#db6f57] dark:bg-[#E07A62]', align: 'justify-end' },
  humano: { label: 'Atendente', icon: UserCheck, color: 'text-white', bg: 'bg-[#4f6f64] dark:bg-[#6B8F82]', align: 'justify-end' },
  sistema: { label: 'Sistema', icon: Info, color: '', bg: '', align: 'justify-center' },
}

export function ChatAtendimento({ sessionId, onClose }: ChatAtendimentoProps) {
  const { user } = useAuth()
  const { data, isLoading } = useAtendimentoDetalhe(sessionId)
  const enviarResposta = useEnviarRespostaHumana()
  const resolver = useResolverAtendimento()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Polling para mensagens novas do cliente
  const isTransferido = data?.sessao?.status === 'transferido'
  const { mensagens: novasMensagens, reset: resetPolling } = usePollingMensagensAdmin(
    sessionId,
    isTransferido
  )

  // Combinar mensagens do detalhe + polling
  const todasMensagens: Mensagem[] = [
    ...(data?.mensagens || []),
    ...novasMensagens.filter(nm =>
      !(data?.mensagens || []).some(m => m.id === nm.id)
    ),
  ].sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime())

  // Reset polling quando muda de sessão
  useEffect(() => {
    if (data?.mensagens) {
      resetPolling(data.mensagens)
    }
  }, [sessionId, data?.mensagens, resetPolling])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [todasMensagens.length])

  const handleEnviar = async () => {
    const texto = input.trim()
    if (!texto || enviarResposta.isPending) return

    setInput('')
    await enviarResposta.mutateAsync({
      sessionId,
      mensagem: texto,
      atendente: user?.nomeCompleto || 'Admin',
    })

    inputRef.current?.focus()
  }

  const handleResolver = () => {
    resolver.mutate(sessionId, {
      onSuccess: () => onClose(),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviar()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={24} className="animate-spin text-[#db6f57] dark:text-[#E07A62]" />
      </div>
    )
  }

  const sessao = data?.sessao

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#d8ccc4] dark:border-[#2D2925] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-[#2a2420] dark:text-[#F5F0EB]">
                {sessao?.usuario_nome || 'Cliente'}
              </h3>
              <Badge variant={sessao?.status === 'transferido' ? 'warning' : sessao?.status === 'resolvido' ? 'success' : 'info'}>
                {sessao?.status === 'transferido' ? 'Transferido' : sessao?.status === 'resolvido' ? 'Resolvido' : 'Ativo'}
              </Badge>
            </div>
            <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
              {sessao?.assunto || 'Atendimento'} · {sessao?.organizacao_nome || ''}
            </p>
          </div>
        </div>
        {sessao?.status === 'transferido' && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<CheckCircle size={14} />}
            onClick={handleResolver}
            isLoading={resolver.isPending}
          >
            Resolver
          </Button>
        )}
      </div>

      {/* Indicador de modo */}
      {sessao?.status === 'transferido' && (
        <div className="px-4 py-2 bg-[#4f6f64]/10 dark:bg-[#6B8F82]/10 border-b border-[#d8ccc4] dark:border-[#2D2925] shrink-0">
          <p className="text-xs text-[#4f6f64] dark:text-[#6B8F82] flex items-center gap-1.5">
            <UserCheck size={12} />
            Você está respondendo como atendente humano · Polling ativo
          </p>
        </div>
      )}

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {todasMensagens.map((msg) => {
          const config = autorConfig[msg.autor]

          if (msg.autor === 'sistema') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-[#faf8f6] dark:bg-[#2D2925]/50 rounded-lg px-4 py-2 max-w-md">
                  <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] italic text-center">{msg.conteudo}</p>
                  <p className="text-[10px] text-[#6b5d57]/60 dark:text-[#B8AEA4]/60 text-center mt-0.5">
                    {formatTime(msg.criado_em)}
                  </p>
                </div>
              </div>
            )
          }

          const Icon = config.icon
          const isRight = msg.autor === 'agente' || msg.autor === 'humano'

          return (
            <div key={msg.id} className={cn('flex gap-2', config.align)}>
              <div className={cn('rounded-2xl px-4 py-2.5 max-w-[75%]', config.bg, isRight ? 'rounded-br-md' : 'rounded-bl-md')}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} className={cn(isRight ? 'text-white/70' : 'text-[#6b5d57] dark:text-[#B8AEA4]')} />
                  <span className={cn('text-[10px] font-medium', isRight ? 'text-white/70' : 'text-[#6b5d57] dark:text-[#B8AEA4]')}>
                    {msg.autor === 'cliente' ? sessao?.usuario_nome : config.label} · {formatTime(msg.criado_em)}
                  </span>
                </div>
                {msg.imagens && msg.imagens.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {msg.imagens.map((img, i) => (
                      <img key={i} src={img} alt="" className="rounded-lg max-h-32 object-cover" />
                    ))}
                  </div>
                )}
                <p className={cn('text-sm whitespace-pre-wrap', config.color)}>
                  {msg.conteudo}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - apenas se transferido */}
      {sessao?.status === 'transferido' && (
        <div className="px-4 py-3 border-t border-[#d8ccc4] dark:border-[#2D2925] shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua resposta..."
              rows={1}
              className="flex-1 px-3 py-2 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm resize-none max-h-24 focus:outline-none focus:ring-2 focus:ring-[#4f6f64]/30"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleEnviar}
              disabled={!input.trim()}
              isLoading={enviarResposta.isPending}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Resolvido */}
      {sessao?.status === 'resolvido' && (
        <div className="px-4 py-3 border-t border-[#d8ccc4] dark:border-[#2D2925] shrink-0 text-center">
          <p className="text-sm text-[#4f6f64] dark:text-[#6B8F82] flex items-center justify-center gap-1.5">
            <CheckCircle size={14} />
            Atendimento resolvido
          </p>
        </div>
      )}
    </div>
  )
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
