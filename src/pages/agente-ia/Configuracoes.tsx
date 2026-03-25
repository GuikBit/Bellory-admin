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
  Loader2,
  Timer,
} from 'lucide-react'
import { useConfiguracaoAgente, useSalvarConfiguracaoAgente } from '../../queries/useSuporte'
import type { ConfiguracaoAgente } from '../../types/suporte'

const defaultConfig: ConfiguracaoAgente = {
  nome_agente: 'Bellory Assistente',
  mensagem_boas_vindas: 'Olá! Sou o assistente virtual da Bellory. Como posso te ajudar hoje?',
  mensagem_transferencia: 'Entendo que você precisa de ajuda especializada. Vou transferir seu atendimento para nossa equipe. Um momento, por favor.',
  mensagem_encerramento: 'Obrigado pelo contato! Se precisar de mais alguma coisa, estou sempre por aqui.',
  email_notificacao: '',
  tempo_maximo_resposta: 30,
  max_tentativas_sem_resolucao: 3,
  horario_inicio: '08:00',
  horario_fim: '22:00',
  ativo: true,
  duracao_sessao_minutos: 30,
}

export function Configuracoes() {
  const { data: configRemota, isLoading } = useConfiguracaoAgente()
  const { mutate: salvar, isPending: salvando } = useSalvarConfiguracaoAgente()

  const [config, setConfig] = useState<ConfiguracaoAgente>(defaultConfig)

  // Quando os dados do servidor carregam, preenche o formulário
  useEffect(() => {
    if (configRemota) {
      setConfig({ ...defaultConfig, ...configRemota })
    }
  }, [configRemota])

  const handleSave = () => {
    salvar(config)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#db6f57]" />
        <span className="ml-2 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">Carregando configurações...</span>
      </div>
    )
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
              <p className="text-sm text-[#2a2420] dark:text-[#F5F0EB] font-medium">{config.nome_agente}</p>
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
              value={config.nome_agente}
              onChange={(e) => setConfig(prev => ({ ...prev, nome_agente: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Mensagem de Boas-vindas</label>
            <textarea
              value={config.mensagem_boas_vindas}
              onChange={(e) => setConfig(prev => ({ ...prev, mensagem_boas_vindas: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#db6f57]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Mensagem de Transferência</label>
            <textarea
              value={config.mensagem_transferencia}
              onChange={(e) => setConfig(prev => ({ ...prev, mensagem_transferencia: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#db6f57]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Mensagem de Encerramento</label>
            <textarea
              value={config.mensagem_encerramento}
              onChange={(e) => setConfig(prev => ({ ...prev, mensagem_encerramento: e.target.value }))}
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
              value={config.email_notificacao}
              onChange={(e) => setConfig(prev => ({ ...prev, email_notificacao: e.target.value }))}
              placeholder="email@empresa.com"
            />
            <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mt-1">
              E-mail que receberá notificação quando um atendimento for transferido para humano
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sessão */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
            <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Duração da Sessão</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Tempo de sessão (minutos)</label>
            <Input
              type="number"
              min={5}
              max={480}
              value={config.duracao_sessao_minutos}
              onChange={(e) => setConfig(prev => ({ ...prev, duracao_sessao_minutos: Math.max(5, Number(e.target.value)) }))}
            />
            <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mt-1">
              Tempo de inatividade (sem mensagens) após o qual a sessão expira automaticamente.
              Cada mensagem enviada reseta o timer. Ao expirar, o próximo contato do cliente cria um novo atendimento.
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
                value={config.tempo_maximo_resposta}
                onChange={(e) => setConfig(prev => ({ ...prev, tempo_maximo_resposta: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Tentativas antes de transferir</label>
              <Input
                type="number"
                value={config.max_tentativas_sem_resolucao}
                onChange={(e) => setConfig(prev => ({ ...prev, max_tentativas_sem_resolucao: Number(e.target.value) }))}
              />
              <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mt-1">
                Após N respostas sem resolução, transfere para humano
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Horário início</label>
              <Input
                type="time"
                value={config.horario_inicio}
                onChange={(e) => setConfig(prev => ({ ...prev, horario_inicio: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Horário fim</label>
              <Input
                type="time"
                value={config.horario_fim}
                onChange={(e) => setConfig(prev => ({ ...prev, horario_fim: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salvar */}
      <div className="flex justify-end">
        <Button
          leftIcon={salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          onClick={handleSave}
          disabled={salvando}
        >
          {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  )
}
