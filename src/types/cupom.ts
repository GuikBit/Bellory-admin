export type TipoDesconto = 'PERCENTUAL' | 'VALOR_FIXO'

export type CicloCobranca = 'MENSAL' | 'ANUAL'

export interface CupomDesconto {
  id: number
  codigo: string
  descricao: string | null
  tipoDesconto: TipoDesconto
  valorDesconto: number
  dtInicio: string | null
  dtFim: string | null
  maxUtilizacoes: number | null
  maxUtilizacoesPorOrg: number | null
  totalUtilizado: number
  planosPermitidos: string[] | null
  segmentosPermitidos: string[] | null
  organizacoesPermitidas: number[] | null
  cicloCobranca: string | null
  ativo: boolean
  vigente: boolean
  dtCriacao: string
  dtAtualizacao: string | null
}

export interface CupomDescontoCreate {
  codigo: string
  descricao?: string
  tipoDesconto: TipoDesconto
  valorDesconto: number
  dtInicio?: string
  dtFim?: string
  maxUtilizacoes?: number
  maxUtilizacoesPorOrg?: number
  planosPermitidos?: string[]
  segmentosPermitidos?: string[]
  organizacoesPermitidas?: number[]
  cicloCobranca?: CicloCobranca
}

export interface CupomDescontoUpdate {
  codigo?: string
  descricao?: string
  tipoDesconto?: TipoDesconto
  valorDesconto?: number
  dtInicio?: string
  dtFim?: string
  maxUtilizacoes?: number
  maxUtilizacoesPorOrg?: number
  planosPermitidos?: string[]
  segmentosPermitidos?: string[]
  organizacoesPermitidas?: number[]
  cicloCobranca?: CicloCobranca
}

export interface CupomUtilizacao {
  id: number
  cupomId: number
  cupomCodigo: string
  organizacaoId: number
  assinaturaId: number | null
  cobrancaId: number | null
  valorOriginal: number
  valorDesconto: number
  valorFinal: number
  planoCodigo: string | null
  cicloCobranca: string | null
  dtUtilizacao: string
}
