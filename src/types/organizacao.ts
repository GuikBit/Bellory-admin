export interface OrganizacaoList {
  id: number
  nomeFantasia: string
  razaoSocial: string
  cnpj: string
  emailPrincipal: string
  telefone1: string
  slug: string
  ativo: boolean
  planoNome: string
  planoCodigo: string
  dtCadastro: string
  totalAgendamentos: number
  totalClientes: number
  totalFuncionarios: number
  totalServicos: number
  totalInstancias: number
}

export interface Plano {
  id: number
  codigo: string
  nome: string
  precoMensal: number
  precoAnual: number
}

export interface Limites {
  maxAgendamentosMes: number
  maxUsuarios: number
  maxClientes: number
  maxServicos: number
  maxUnidades: number
  permiteAgendamentoOnline: boolean
  permiteWhatsapp: boolean
  permiteSite: boolean
  permiteEcommerce: boolean
  permiteRelatoriosAvancados: boolean
  permiteApi: boolean
  permiteIntegracaoPersonalizada: boolean
  suportePrioritario: boolean
  suporte24x7: boolean
}

export interface OrgMetricas {
  totalAgendamentos: number
  agendamentosNoMes: number
  agendamentosConcluidos: number
  agendamentosCancelados: number
  agendamentosPendentes: number
  totalClientes: number
  clientesAtivos: number
  totalFuncionarios: number
  funcionariosAtivos: number
  totalServicos: number
  servicosAtivos: number
  faturamentoTotal: number
  faturamentoMes: number
  totalCobrancas: number
  cobrancasPagas: number
  cobrancasPendentes: number
  cobrancasVencidas: number
}

export interface Instancia {
  id: number
  instanceName: string
  instanceId: string
  status: string
  ativo: boolean
}

export interface OrganizacaoDetail {
  id: number
  nomeFantasia: string
  razaoSocial: string
  cnpj: string
  emailPrincipal: string
  telefone1: string
  telefone2: string
  whatsapp: string
  slug: string
  ativo: boolean
  dtCadastro: string
  dtAtualizacao: string
  responsavelNome: string
  responsavelEmail: string
  responsavelTelefone: string
  plano: Plano
  limites: Limites
  limitesPersonalizados: Limites | null
  metricas: OrgMetricas
  instancias: Instancia[]
}
