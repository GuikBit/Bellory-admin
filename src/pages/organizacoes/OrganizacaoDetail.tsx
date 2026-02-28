import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOrganizacao } from '../../queries/useOrganizacoes'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { MetricCard } from '../../components/ui/MetricCard'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { StatusIndicator } from '../../components/ui/StatusIndicator'
import { MetricCardSkeleton } from '../../components/ui/Skeleton'
import { formatCurrency, formatNumber, formatDate, formatPhone } from '../../utils/format'
import { cn } from '../../utils/cn'
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  User,
  CalendarCheck,
  Users,
  Scissors,
  DollarSign,
  CreditCard,
  Smartphone,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'

type Tab = 'info' | 'metricas' | 'plano' | 'instancias'

export function OrganizacaoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: org, isLoading, error } = useOrganizacao(Number(id))
  const [activeTab, setActiveTab] = useState<Tab>('info')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (error || !org) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-2">Organização não encontrada</h3>
        <Button variant="outline" onClick={() => navigate('/organizacoes')}>Voltar</Button>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: 'Informações' },
    { key: 'metricas', label: 'Métricas' },
    { key: 'plano', label: 'Plano' },
    { key: 'instancias', label: 'Instâncias' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/organizacoes')}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">{org.nomeFantasia}</h1>
            <Badge variant={org.ativo ? 'success' : 'danger'}>{org.ativo ? 'Ativo' : 'Inativo'}</Badge>
          </div>
          <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">{org.razaoSocial} - {org.cnpj}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#d8ccc4] dark:border-[#2D2925] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px',
              activeTab === tab.key
                ? 'border-[#db6f57] text-[#db6f57] dark:border-[#E07A62] dark:text-[#E07A62]'
                : 'border-transparent text-[#6b5d57] dark:text-[#7A716A] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent>
              <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-4 flex items-center gap-2">
                <Building2 size={16} /> Dados da Organização
              </h3>
              <dl className="space-y-3">
                {[
                  { label: 'Nome Fantasia', value: org.nomeFantasia },
                  { label: 'Razão Social', value: org.razaoSocial },
                  { label: 'CNPJ', value: org.cnpj },
                  { label: 'Email', value: org.emailPrincipal, icon: <Mail size={14} /> },
                  { label: 'Telefone', value: formatPhone(org.telefone1), icon: <Phone size={14} /> },
                  { label: 'WhatsApp', value: org.whatsapp ? formatPhone(org.whatsapp) : '-' },
                  { label: 'Slug', value: org.slug, icon: <Globe size={14} /> },
                  { label: 'Cadastro', value: formatDate(org.dtCadastro) },
                  { label: 'Última atualização', value: formatDate(org.dtAtualizacao) },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between py-1.5 border-b border-[#d8ccc4]/30 dark:border-[#2D2925]/30 last:border-0">
                    <dt className="text-xs text-[#6b5d57] dark:text-[#7A716A] flex items-center gap-1.5">
                      {item.icon} {item.label}
                    </dt>
                    <dd className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] text-right">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-4 flex items-center gap-2">
                <User size={16} /> Responsável
              </h3>
              <dl className="space-y-3">
                {[
                  { label: 'Nome', value: org.responsavelNome },
                  { label: 'Email', value: org.responsavelEmail },
                  { label: 'Telefone', value: org.responsavelTelefone ? formatPhone(org.responsavelTelefone) : '-' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between py-1.5 border-b border-[#d8ccc4]/30 dark:border-[#2D2925]/30 last:border-0">
                    <dt className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{item.label}</dt>
                    <dd className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'metricas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Agendamentos" value={formatNumber(org.metricas.totalAgendamentos)} subtitle={`${org.metricas.agendamentosNoMes} no mês`} icon={<CalendarCheck size={20} />} iconBg="bg-[#db6f57]/10 text-[#db6f57] dark:bg-[#E07A62]/10 dark:text-[#E07A62]" />
            <MetricCard title="Clientes" value={formatNumber(org.metricas.totalClientes)} subtitle={`${org.metricas.clientesAtivos} ativos`} icon={<Users size={20} />} iconBg="bg-[#4f6f64]/10 text-[#4f6f64] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]" />
            <MetricCard title="Funcionários" value={formatNumber(org.metricas.totalFuncionarios)} subtitle={`${org.metricas.funcionariosAtivos} ativos`} icon={<Users size={20} />} iconBg="bg-violet-500/10 text-violet-500" />
            <MetricCard title="Faturamento" value={formatCurrency(org.metricas.faturamentoTotal)} subtitle={`${formatCurrency(org.metricas.faturamentoMes)} no mês`} icon={<DollarSign size={20} />} iconBg="bg-emerald-500/10 text-emerald-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard title="Serviços" value={formatNumber(org.metricas.totalServicos)} subtitle={`${org.metricas.servicosAtivos} ativos`} icon={<Scissors size={20} />} />
            <MetricCard title="Cobranças Pagas" value={formatNumber(org.metricas.cobrancasPagas)} subtitle={`${org.metricas.cobrancasPendentes} pendentes`} icon={<CreditCard size={20} />} />
            <MetricCard title="Concluídos" value={formatNumber(org.metricas.agendamentosConcluidos)} subtitle={`${org.metricas.agendamentosCancelados} cancelados`} icon={<CalendarCheck size={20} />} iconBg="bg-[#4f6f64]/10 text-[#4f6f64] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]" />
          </div>

          {/* Usage bars */}
          {org.limites && (
            <Card>
              <CardContent>
                <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-4">Uso dos Limites</h3>
                <div className="space-y-4">
                  <ProgressBar label="Agendamentos no mês" value={org.metricas.agendamentosNoMes} max={org.limites.maxAgendamentosMes} />
                  <ProgressBar label="Usuários" value={org.metricas.totalFuncionarios} max={org.limites.maxUsuarios} color="primary" />
                  <ProgressBar label="Clientes" value={org.metricas.totalClientes} max={org.limites.maxClientes} color="primary" />
                  <ProgressBar label="Serviços" value={org.metricas.totalServicos} max={org.limites.maxServicos} color="primary" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'plano' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent>
              <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-4">Plano Atual</h3>
              <div className="flex items-center gap-3 mb-4 p-4 rounded-lg bg-[#db6f57]/5 dark:bg-[#E07A62]/5 border border-[#db6f57]/20 dark:border-[#E07A62]/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#db6f57] to-[#8b3d35] dark:from-[#E07A62] dark:to-[#A8524A] flex items-center justify-center">
                  <CreditCard size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#2a2420] dark:text-[#F5F0EB]">{org.plano.nome}</p>
                  <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                    {formatCurrency(org.plano.precoMensal)}/mês · {formatCurrency(org.plano.precoAnual)}/ano
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-4">Recursos do Plano</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Agendamento Online', enabled: org.limites.permiteAgendamentoOnline },
                  { label: 'WhatsApp', enabled: org.limites.permiteWhatsapp },
                  { label: 'Site', enabled: org.limites.permiteSite },
                  { label: 'E-commerce', enabled: org.limites.permiteEcommerce },
                  { label: 'Relatórios Avançados', enabled: org.limites.permiteRelatoriosAvancados },
                  { label: 'API', enabled: org.limites.permiteApi },
                  { label: 'Integração Personalizada', enabled: org.limites.permiteIntegracaoPersonalizada },
                  { label: 'Suporte Prioritário', enabled: org.limites.suportePrioritario },
                  { label: 'Suporte 24/7', enabled: org.limites.suporte24x7 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">{item.label}</span>
                    {item.enabled ? (
                      <Check size={16} className="text-[#4f6f64] dark:text-[#6B8F82]" />
                    ) : (
                      <X size={16} className="text-[#d8ccc4] dark:text-[#2D2925]" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'instancias' && (
        <div className="space-y-4">
          {org.instancias.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Smartphone size={40} className="mx-auto text-[#d8ccc4] dark:text-[#2D2925] mb-3" />
                <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">Nenhuma instância configurada</p>
              </div>
            </Card>
          ) : (
            org.instancias.map((inst) => (
              <Card key={inst.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#4f6f64]/10 dark:bg-[#6B8F82]/10 flex items-center justify-center">
                      <Smartphone size={18} className="text-[#4f6f64] dark:text-[#6B8F82]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{inst.instanceName}</p>
                      <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">ID: {inst.instanceId}</p>
                    </div>
                  </div>
                  <StatusIndicator
                    status={inst.status === 'CONNECTED' ? 'connected' : 'disconnected'}
                  />
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
