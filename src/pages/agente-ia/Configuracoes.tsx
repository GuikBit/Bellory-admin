import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import {
  Bot,
  Mail,
  Clock,
  MessageSquare,
  Save,
} from 'lucide-react'
import toast from 'react-hot-toast'

const STORAGE_KEY = 'bellory-suporte-config'

interface SuporteConfig {
  nomeAgente: string
  mensagemBoasVindas: string
  mensagemTransferencia: string
  mensagemEncerramento: string
  emailNotificacao: string
  tempoMaximoResposta: number
  maxMensagensSemResolucao: number
  horarioInicio: string
  horarioFim: string
  ativo: boolean
}

const defaultConfig: SuporteConfig = {
  nomeAgente: 'Bellory Assistente',
  mensagemBoasVindas: 'Olá! Sou o assistente virtual da Bellory. Como posso te ajudar hoje?',
  mensagemTransferencia: 'Entendo que você precisa de ajuda especializada. Vou transferir seu atendimento para nossa equipe. Um momento, por favor.',
  mensagemEncerramento: 'Obrigado pelo contato! Se precisar de mais alguma coisa, estou sempre por aqui.',
  emailNotificacao: 'guilhermeoliveira1998@gmail.com',
  tempoMaximoResposta: 30,
  maxMensagensSemResolucao: 3,
  horarioInicio: '08:00',
  horarioFim: '22:00',
  ativo: true,
}

function loadConfig(): SuporteConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...defaultConfig, ...JSON.parse(saved) }
  } catch { /* ignore */ }
  return defaultConfig
}

export function Configuracoes() {
  const [config, setConfig] = useState<SuporteConfig>(loadConfig)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    toast.success('Configurações salvas')
  }

  return (
    <div className="space-y-6">
      {/* Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
            <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Status do Agente</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#2a2420] dark:text-[#F5F0EB] font-medium">{config.nomeAgente}</p>
              <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">Atendimento automático N1 · Gemini via n8n</p>
            </div>
            <button
              onClick={() => setConfig(prev => ({ ...prev, ativo: !prev.ativo }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.ativo ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.ativo ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Mensagens */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
            <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Mensagens Padrão</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Nome do Agente</label>
            <Input
              value={config.nomeAgente}
              onChange={(e) => setConfig(prev => ({ ...prev, nomeAgente: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Mensagem de Boas-vindas</label>
            <textarea
              value={config.mensagemBoasVindas}
              onChange={(e) => setConfig(prev => ({ ...prev, mensagemBoasVindas: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#db6f57]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Mensagem de Transferência</label>
            <textarea
              value={config.mensagemTransferencia}
              onChange={(e) => setConfig(prev => ({ ...prev, mensagemTransferencia: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#db6f57]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Mensagem de Encerramento</label>
            <textarea
              value={config.mensagemEncerramento}
              onChange={(e) => setConfig(prev => ({ ...prev, mensagemEncerramento: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#db6f57]/30"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
            <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Notificações de Transferência</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">E-mail para notificação</label>
            <Input
              value={config.emailNotificacao}
              onChange={(e) => setConfig(prev => ({ ...prev, emailNotificacao: e.target.value }))}
              placeholder="email@empresa.com"
            />
            <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mt-1">
              E-mail que receberá notificação quando um atendimento for transferido para humano
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Limites */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
            <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Limites e Horários</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Tempo máximo de resposta (seg)</label>
              <Input
                type="number"
                value={config.tempoMaximoResposta}
                onChange={(e) => setConfig(prev => ({ ...prev, tempoMaximoResposta: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Tentativas antes de transferir</label>
              <Input
                type="number"
                value={config.maxMensagensSemResolucao}
                onChange={(e) => setConfig(prev => ({ ...prev, maxMensagensSemResolucao: Number(e.target.value) }))}
              />
              <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mt-1">
                Após N respostas sem resolução, transfere para humano
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Horário início</label>
              <Input
                type="time"
                value={config.horarioInicio}
                onChange={(e) => setConfig(prev => ({ ...prev, horarioInicio: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Horário fim</label>
              <Input
                type="time"
                value={config.horarioFim}
                onChange={(e) => setConfig(prev => ({ ...prev, horarioFim: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salvar */}
      <div className="flex justify-end">
        <Button leftIcon={<Save size={16} />} onClick={handleSave}>
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
