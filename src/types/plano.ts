// === Feature (item do array JSONB) ===
export interface PlanoFeature {
  text: string
  included: boolean
}

// === Limites do Plano ===
export interface PlanoLimites {
  maxAgendamentosMes: number | null
  maxUsuarios: number | null
  maxClientes: number | null
  maxServicos: number | null
  maxUnidades: number | null
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

// === Response completa (GET lista e GET por ID) ===
export interface PlanoBellory {
  id: number
  codigo: string
  nome: string
  tagline: string | null
  descricaoCompleta: string | null
  ativo: boolean
  popular: boolean

  // Visual/UI
  cta: string | null
  badge: string | null
  icone: string | null
  cor: string | null
  gradiente: string | null

  // Preços
  precoMensal: number
  precoAnual: number
  descontoPercentualAnual: number | null

  // Features e Limites
  features: PlanoFeature[]
  limites: PlanoLimites | null

  // Ordem
  ordemExibicao: number | null

  // Auditoria
  dtCriacao: string
  dtAtualizacao: string | null
  userCriacao: number | null
  userAtualizacao: number | null

  // Métricas
  totalOrganizacoesUsando: number
}

// === Input de criação (POST) ===
export interface PlanoBelloryCreate {
  codigo: string
  nome: string
  tagline?: string
  descricaoCompleta?: string
  popular?: boolean
  cta?: string
  badge?: string
  icone?: string
  cor?: string
  gradiente?: string
  precoMensal: number
  precoAnual: number
  descontoPercentualAnual?: number
  features?: PlanoFeature[]
  ordemExibicao?: number
  limites?: PlanoLimites
}

// === Input de atualização (PUT) ===
export interface PlanoBelloryUpdate {
  codigo?: string
  nome?: string
  tagline?: string
  descricaoCompleta?: string
  popular?: boolean
  cta?: string
  badge?: string
  icone?: string
  cor?: string
  gradiente?: string
  precoMensal?: number
  precoAnual?: number
  descontoPercentualAnual?: number
  features?: PlanoFeature[]
  ordemExibicao?: number
  limites?: PlanoLimites
}

// === Input de reordenação (PUT /reordenar) ===
export interface ReordenarPlanos {
  planos: PlanoOrdem[]
}

export interface PlanoOrdem {
  id: number
  ordemExibicao: number
}
