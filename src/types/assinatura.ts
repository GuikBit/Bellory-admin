// === Status da Assinatura ===
export type StatusAssinatura = 'TRIAL' | 'ATIVA' | 'VENCIDA' | 'CANCELADA' | 'SUSPENSA'

// === Ciclo de Cobrança ===
export type CicloCobranca = 'MENSAL' | 'ANUAL'

// === Status da Cobrança ===
export type StatusCobrancaPlataforma = 'PENDENTE' | 'PAGA' | 'VENCIDA' | 'CANCELADA' | 'ESTORNADA'

// === Forma de Pagamento ===
export type FormaPagamentoPlataforma = 'PIX' | 'BOLETO' | 'CARTAO_CREDITO'

// === Response completa da Assinatura (Admin) ===
export interface AssinaturaResponse {
  id: number
  organizacaoId: number
  organizacaoNome: string
  planoBelloryId: number
  planoNome: string
  planoCodigo: string
  status: StatusAssinatura
  cicloCobranca: CicloCobranca
  dtInicioTrial: string | null
  dtFimTrial: string | null
  dtInicio: string | null
  dtProximoVencimento: string | null
  dtCancelamento: string | null
  valorMensal: number | null
  valorAnual: number | null
  assasCustomerId: string | null
  assasSubscriptionId: string | null
  dtCriacao: string
}

// === Status leve retornado no login ===
export interface AssinaturaStatus {
  bloqueado: boolean
  statusAssinatura: string
  diasRestantesTrial: number | null
  mensagem: string
  planoCodigo: string | null
  planoNome: string | null
}

// === Cobrança da Plataforma ===
export interface CobrancaPlataforma {
  id: number
  valor: number
  dtVencimento: string
  dtPagamento: string | null
  status: StatusCobrancaPlataforma
  formaPagamento: FormaPagamentoPlataforma | null
  assasInvoiceUrl: string | null
  assasBankSlipUrl: string | null
  assasPixQrCode: string | null
  assasPixCopiaCola: string | null
  referenciaMes: number
  referenciaAno: number
  dtCriacao: string
}

// === Pagamento da Plataforma ===
export interface PagamentoPlataforma {
  id: number
  cobrancaId: number
  valor: number
  status: 'PENDENTE' | 'CONFIRMADO' | 'RECUSADO' | 'ESTORNADO'
  formaPagamento: FormaPagamentoPlataforma
  assasPaymentId: string | null
  dtPagamento: string | null
  dtCriacao: string
}

// === Input para escolher plano (self-service org) ===
export interface EscolherPlano {
  planoCodigo: string
  cicloCobranca: CicloCobranca
  formaPagamento: FormaPagamentoPlataforma
}

// === Dashboard de Billing (Admin) ===
export interface BillingDashboard {
  mrr: number
  totalAtivas: number
  totalTrial: number
  totalVencidas: number
  totalCanceladas: number
  totalSuspensas: number
  receitaMesAtual: number
}

// === Filtros Admin ===
export interface AssinaturaFiltro {
  status?: StatusAssinatura
  planoCodigo?: string
}
