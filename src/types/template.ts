// === Tipos do Template ===
export type TipoTemplate = 'WHATSAPP' | 'EMAIL'

export type CategoriaTemplate =
  | 'CONFIRMACAO'
  | 'LEMBRETE'
  | 'BEM_VINDO'
  | 'RESET_SENHA'
  | 'COBRANCA_AVISO'
  | 'COBRANCA_LEMBRETE'

// === Variável disponível no template ===
export interface VariavelTemplate {
  nome: string
  descricao: string
  exemplo: string
}

// === Response completa (GET lista e GET por ID) ===
export interface TemplateBellory {
  id: number
  codigo: string
  nome: string
  descricao: string | null
  tipo: TipoTemplate
  categoria: CategoriaTemplate
  assunto: string | null
  conteudo: string
  variaveisDisponiveis: VariavelTemplate[]
  ativo: boolean
  padrao: boolean
  icone: string | null

  // Auditoria
  dtCriacao: string
  dtAtualizacao: string | null
  userCriacao: number | null
  userAtualizacao: number | null
}

// === Input de criação (POST) ===
export interface TemplateBelloryCreate {
  codigo: string
  nome: string
  descricao?: string
  tipo: TipoTemplate
  categoria: CategoriaTemplate
  assunto?: string
  conteudo: string
  variaveisDisponiveis?: VariavelTemplate[]
  icone?: string
}

// === Input de atualização (PUT) ===
export interface TemplateBelloryUpdate {
  codigo?: string
  nome?: string
  descricao?: string
  tipo?: TipoTemplate
  categoria?: CategoriaTemplate
  assunto?: string
  conteudo?: string
  variaveisDisponiveis?: VariavelTemplate[]
  icone?: string
}

// === Input para preview (POST /:id/preview) ===
export interface TemplatePreviewRequest {
  variaveis?: Record<string, string>
}

// === Labels para exibição ===
export const TIPO_LABELS: Record<TipoTemplate, string> = {
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
}

export const CATEGORIA_LABELS: Record<CategoriaTemplate, string> = {
  CONFIRMACAO: 'Confirmação',
  LEMBRETE: 'Lembrete',
  BEM_VINDO: 'Boas-vindas',
  RESET_SENHA: 'Reset de Senha',
  COBRANCA_AVISO: 'Cobrança - Aviso',
  COBRANCA_LEMBRETE: 'Cobrança - Lembrete',
}

// === Cores para badges de tipo ===
export const TIPO_COLORS: Record<TipoTemplate, { bg: string; darkBg: string; text: string; darkText: string }> = {
  WHATSAPP: { bg: 'bg-green-100', darkBg: 'dark:bg-green-900/30', text: 'text-green-700', darkText: 'dark:text-green-400' },
  EMAIL: { bg: 'bg-blue-100', darkBg: 'dark:bg-blue-900/30', text: 'text-blue-700', darkText: 'dark:text-blue-400' },
}

// === Templates seed (não devem ser deletados) ===
export const SEED_TEMPLATE_CODES = [
  'whatsapp-confirmacao',
  'whatsapp-lembrete',
  'email-bem-vindo',
  'email-reset-senha',
  'email-cobranca-aviso',
  'email-cobranca-lembrete',
]

// === Sugestões de variáveis por tipo ===
export const VARIAVEIS_SUGESTOES_WHATSAPP: VariavelTemplate[] = [
  { nome: 'nome_cliente', descricao: 'Nome do cliente', exemplo: 'João Silva' },
  { nome: 'data_agendamento', descricao: 'Data do agendamento', exemplo: '15/03/2026' },
  { nome: 'hora_agendamento', descricao: 'Horário do agendamento', exemplo: '14:30' },
  { nome: 'servico', descricao: 'Nome do serviço', exemplo: 'Corte Masculino' },
  { nome: 'profissional', descricao: 'Nome do profissional', exemplo: 'Maria Santos' },
  { nome: 'local', descricao: 'Endereço do estabelecimento', exemplo: 'Rua das Flores, 123' },
  { nome: 'valor', descricao: 'Valor do serviço', exemplo: 'R$ 50,00' },
  { nome: 'nome_empresa', descricao: 'Nome da empresa', exemplo: 'Barbearia Top' },
]

export const VARIAVEIS_SUGESTOES_EMAIL: VariavelTemplate[] = [
  { nome: 'nomeCliente', descricao: 'Nome do cliente', exemplo: 'João Silva' },
  { nome: 'nomeOrganizacao', descricao: 'Nome da organização', exemplo: 'Barbearia Top' },
  { nome: 'valorCobranca', descricao: 'Valor da cobrança', exemplo: 'R$ 150,00' },
  { nome: 'dataVencimento', descricao: 'Data de vencimento', exemplo: '15/04/2026' },
  { nome: 'descricaoCobranca', descricao: 'Descrição da cobrança', exemplo: 'Plano Premium - Mensal' },
  { nome: 'numeroCobranca', descricao: 'Número da cobrança', exemplo: 'COB-2026-001' },
  { nome: 'diasAtraso', descricao: 'Dias em atraso', exemplo: '5' },
]
