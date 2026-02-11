import { useDashboard } from '../queries/useDashboard'
import { MetricCard } from '../components/ui/MetricCard'
import { MetricCardSkeleton, ChartSkeleton } from '../components/ui/Skeleton'
import { DoughnutChartCard } from '../components/charts/DoughnutChart'
import { Card, CardContent } from '../components/ui/Card'
import { formatCurrency, formatNumber } from '../utils/format'
import {
  Building2,
  CalendarCheck,
  Users,
  UserCheck,
  Scissors,
  Smartphone,
  DollarSign,
  CreditCard,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react'

export function Dashboard() {
  const { data, isLoading, error } = useDashboard()

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-2">Erro ao carregar dados</h3>
        <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">Não foi possível carregar o dashboard. Tente novamente.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Main metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Organizações"
          value={formatNumber(data.totalOrganizacoes)}
          subtitle={`${data.organizacoesAtivas} ativas`}
          icon={<Building2 size={20} />}
          iconBg="bg-[#db6f57]/10 text-[#db6f57] dark:bg-[#E07A62]/10 dark:text-[#E07A62]"
        />
        <MetricCard
          title="Agendamentos"
          value={formatNumber(data.totalAgendamentos)}
          subtitle="Total geral"
          icon={<CalendarCheck size={20} />}
          iconBg="bg-[#4f6f64]/10 text-[#4f6f64] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]"
        />
        <MetricCard
          title="Clientes"
          value={formatNumber(data.totalClientes)}
          subtitle="Cadastrados"
          icon={<Users size={20} />}
          iconBg="bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400"
        />
        <MetricCard
          title="Faturamento"
          value={formatCurrency(data.faturamentoTotal)}
          subtitle="Acumulado"
          icon={<DollarSign size={20} />}
          iconBg="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Funcionários"
          value={formatNumber(data.totalFuncionarios)}
          subtitle="Total na plataforma"
          icon={<UserCheck size={20} />}
          iconBg="bg-violet-500/10 text-violet-500 dark:bg-violet-400/10 dark:text-violet-400"
        />
        <MetricCard
          title="Serviços"
          value={formatNumber(data.totalServicos)}
          subtitle="Cadastrados"
          icon={<Scissors size={20} />}
          iconBg="bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
        />
        <MetricCard
          title="Cobranças"
          value={formatNumber(data.totalCobrancas)}
          subtitle={`${data.cobrancasPendentes} pendentes`}
          icon={<CreditCard size={20} />}
          iconBg="bg-rose-500/10 text-rose-500 dark:bg-rose-400/10 dark:text-rose-400"
        />
        <MetricCard
          title="Instâncias"
          value={formatNumber(data.totalInstancias)}
          subtitle={`${data.instanciasConectadas} conectadas`}
          icon={<Smartphone size={20} />}
          iconBg="bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-400"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan distribution */}
        <DoughnutChartCard
          title="Distribuição por Plano"
          labels={['Gratuito', 'Básico', 'Plus', 'Premium']}
          data={[
            data.distribuicaoPlanos.gratuito,
            data.distribuicaoPlanos.basico,
            data.distribuicaoPlanos.plus,
            data.distribuicaoPlanos.premium,
          ]}
        />

        {/* Quick stats */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-6">Visão Rápida</h3>
            <div className="space-y-5">
              {/* Orgs status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#4f6f64]/10 dark:bg-[#6B8F82]/10 flex items-center justify-center">
                    <Building2 size={18} className="text-[#4f6f64] dark:text-[#6B8F82]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">Organizações Ativas</p>
                    <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">
                      {data.organizacoesInativas} inativas
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#4f6f64] dark:text-[#6B8F82]">
                  {data.organizacoesAtivas}
                </span>
              </div>

              {/* Instances */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Wifi size={18} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">Instâncias Conectadas</p>
                    <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">
                      WhatsApp/Bot online
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-emerald-500">
                  {data.instanciasConectadas}
                </span>
              </div>

              {/* Disconnected */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <WifiOff size={18} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">Instâncias Desconectadas</p>
                    <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">
                      Requerem atenção
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-red-500">
                  {data.instanciasDesconectadas}
                </span>
              </div>

              {/* Cobranças pagas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#db6f57]/10 dark:bg-[#E07A62]/10 flex items-center justify-center">
                    <CreditCard size={18} className="text-[#db6f57] dark:text-[#E07A62]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">Cobranças Pagas</p>
                    <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">
                      {data.cobrancasPendentes} pendentes
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-[#db6f57] dark:text-[#E07A62]">
                  {formatNumber(data.cobrancasPagas)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
