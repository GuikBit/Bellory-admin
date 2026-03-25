export type StatusSessao = 'ativo' | 'transferido' | 'resolvido' | 'expirado'
export type ModoSessao = 'ia' | 'humano'
export type AutorMensagem = 'cliente' | 'agente' | 'humano' | 'sistema'
export type StatusDocumento = 'processando' | 'processado' | 'erro'

export interface Sessao {
  id: string
  organizacao_id: number | null
  organizacao_nome: string | null
  organizacao_tenant: string | null
  usuario_id: number | null
  usuario_nome: string | null
  usuario_email: string | null
  modulo: string | null
  assunto: string | null
  status: StatusSessao
  modo: ModoSessao
  tentativas_falhas: number
  motivo_transferencia: string | null
  atendente_humano: string | null
  satisfacao: 'positivo' | 'negativo' | null
  criado_em: string
  atualizado_em: string
  ultima_mensagem_em: string
  encerrado_em: string | null
  // campos calculados retornados pelo webhook
  total_mensagens?: number
  ultima_mensagem?: string
}

export type AvaliacaoMensagem = 'positivo' | 'negativo' | null

export interface Mensagem {
  id: string
  sessao_id: string
  autor: AutorMensagem
  conteudo: string
  imagens: string[] | null
  avaliacao: AvaliacaoMensagem
  atendente_nome: string | null
  criado_em: string
}

export interface DocumentoBase {
  id: number
  filename: string
  tipo: string
  tamanho: string | null
  categoria: string
  status: StatusDocumento
  chunks: number
  criado_em: string
  atualizado_em: string
}

export interface DashboardSuporte {
  total_sessoes: number
  sessoes_hoje: number
  resolvidas_ia: number
  transferidas: number
  ativas: number
  taxa_resolucao: number
  satisfacao: {
    positivo: number
    negativo: number
    total: number
    percentual: number
  }
  top_assuntos: Array<{ assunto: string; total: number | string }>
  sessoes_recentes: Sessao[]
}

export interface AtendimentosResponse {
  sessoes: Sessao[]
  total: number
  counts: {
    todos: number
    ativo: number
    resolvido: number
    transferido: number
  }
}

export interface AtendimentoDetalhe {
  sessao: Sessao
  mensagens: Mensagem[]
}

// ── Imagens da Base de Conhecimento ──────────────────────────────────

export interface SuporteImagem {
  nome: string
  url: string
  relativePath: string
  pasta: string
  tamanho: number
}

export interface SuportePasta {
  nome: string
  caminho: string
  totalImagens: number
}

export interface ResponseAPI<T> {
  success: boolean
  message: string
  dados?: T
  errorCode?: number
  errors?: Record<string, string>
}

// ── Configuração do Agente IA ───────────────────────────────────────

export interface ConfiguracaoAgente {
  nome_agente: string
  mensagem_boas_vindas: string
  mensagem_transferencia: string
  mensagem_encerramento: string
  email_notificacao: string
  tempo_maximo_resposta: number
  max_tentativas_sem_resolucao: number
  horario_inicio: string
  horario_fim: string
  ativo: boolean
  duracao_sessao_minutos: number
}
