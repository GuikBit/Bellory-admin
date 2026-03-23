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

export interface Mensagem {
  id: string
  sessao_id: string
  autor: AutorMensagem
  conteudo: string
  imagens: string[] | null
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
  totalAtendimentos: number | unknown
  atendimentosHoje: number | unknown
  resolvidosPeloAgente: number | unknown
  transferidosParaHumano: number | unknown
  tempoMedioResposta: string
  satisfacao: number | unknown
  taxaResolucao: number | unknown
  atendimentosEmAndamento: number | unknown
  topPerguntas: Array<{ pergunta: string; quantidade: number }>
  atendimentosRecentes: Sessao[]
  contagemPositivas: number | unknown
  contagemNegativas: number | unknown
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
