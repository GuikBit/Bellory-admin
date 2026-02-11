export interface DashboardData {
  totalOrganizacoes: number
  organizacoesAtivas: number
  organizacoesInativas: number
  totalAgendamentos: number
  totalClientes: number
  totalFuncionarios: number
  totalServicos: number
  totalInstancias: number
  instanciasConectadas: number
  instanciasDesconectadas: number
  faturamentoTotal: number
  totalCobrancas: number
  cobrancasPendentes: number
  cobrancasPagas: number
  distribuicaoPlanos: {
    gratuito: number
    basico: number
    plus: number
    premium: number
  }
}
