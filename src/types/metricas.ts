export interface AgendamentoMetricas {
  totalGeral: number
  totalNoMes: number
  concluidos: number
  cancelados: number
  pendentes: number
  agendados: number
  naoCompareceu: number
  taxaConclusao: number
  taxaCancelamento: number
  taxaNoShow: number
  porOrganizacao: {
    organizacaoId: number
    nomeFantasia: string
    total: number
    concluidos: number
    cancelados: number
    pendentes: number
  }[]
  evolucaoMensal: {
    mes: string
    total: number
    concluidos: number
    cancelados: number
  }[]
}

export interface FaturamentoMetricas {
  faturamentoTotalGeral: number
  faturamentoMesAtual: number
  faturamentoMesAnterior: number
  crescimentoPercentual: number
  ticketMedio: number
  totalPagamentos: number
  pagamentosConfirmados: number
  porOrganizacao: {
    organizacaoId: number
    nomeFantasia: string
    planoCodigo: string
    faturamentoTotal: number
    faturamentoMes: number
    totalCobrancas: number
    cobrancasPagas: number
    cobrancasPendentes: number
  }[]
  evolucaoMensal: {
    mes: string
    valor: number
    quantidadePagamentos: number
  }[]
}

export interface ServicoMetricas {
  totalServicosGeral: number
  servicosAtivos: number
  servicosInativos: number
  precoMedio: number
  porOrganizacao: {
    organizacaoId: number
    nomeFantasia: string
    totalServicos: number
    servicosAtivos: number
  }[]
  maisAgendados: unknown[]
}

export interface FuncionarioMetricas {
  totalFuncionariosGeral: number
  funcionariosAtivos: number
  funcionariosInativos: number
  mediaFuncionariosPorOrganizacao: number
  porOrganizacao: {
    organizacaoId: number
    nomeFantasia: string
    totalFuncionarios: number
    funcionariosAtivos: number
    totalServicosVinculados: number
  }[]
}

export interface ClienteMetricas {
  totalClientesGeral: number
  clientesAtivos: number
  clientesInativos: number
  mediaClientesPorOrganizacao: number
  porOrganizacao: {
    organizacaoId: number
    nomeFantasia: string
    totalClientes: number
    clientesAtivos: number
  }[]
  evolucaoMensal: {
    mes: string
    novosClientes: number
    totalAcumulado: number
  }[]
}

export interface InstanciaMetricas {
  totalInstancias: number
  instanciasAtivas: number
  instanciasDeletadas: number
  instanciasConectadas: number
  instanciasDesconectadas: number
  porOrganizacao: {
    organizacaoId: number
    nomeFantasia: string
    totalInstancias: number
    instanciasAtivas: number
    instanciasConectadas: number
  }[]
  todasInstancias: {
    id: number
    instanceName: string
    instanceId: string
    integration: string
    status: string
    ativo: boolean
    organizacaoId: number
    nomeFantasiaOrganizacao: string
  }[]
}

export interface PlanoMetricas {
  totalPlanos: number
  planosAtivos: number
  distribuicao: {
    planoId: number
    codigo: string
    nome: string
    precoMensal: number
    precoAnual: number
    totalOrganizacoes: number
    percentualDistribuicao: number
    ativo: boolean
    popular: boolean
  }[]
}
