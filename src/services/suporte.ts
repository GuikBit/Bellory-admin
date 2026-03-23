import axios from 'axios'
import { api } from './api'
import type {
  DashboardSuporte,
  AtendimentosResponse,
  AtendimentoDetalhe,
  DocumentoBase,
  Mensagem,
  AvaliacaoMensagem,
  SuporteImagem,
  SuportePasta,
  ResponseAPI,
} from '../types/suporte'

const N8N_BASE = 'https://auto.bellory.com.br'

const n8nApi = axios.create({
  baseURL: N8N_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Dashboard ──────────────────────────────────────────────────────

export async function getDashboardSuporte(): Promise<DashboardSuporte> {
  const { data } = await n8nApi.get('/webhook/suporte_dashboard')
  return data
}

// ── Atendimentos ───────────────────────────────────────────────────

export async function getAtendimentos(params?: {
  status?: string
  search?: string
}): Promise<AtendimentosResponse> {
  const { data } = await n8nApi.get('/webhook/suporte_atendimentos', { params })
  return data
}

export async function getAtendimentoDetalhe(sessionId: string): Promise<AtendimentoDetalhe> {
  const { data } = await n8nApi.get('/webhook/suporte_atendimento_detalhe', {
    params: { sessionId },
  })
  return data
}

export async function enviarRespostaHumana(payload: {
  sessionId: string
  mensagem: string
  atendente: string
}): Promise<void> {
  await n8nApi.post('/webhook/suporte_resposta_humana', payload)
}

export async function resolverAtendimento(sessionId: string): Promise<void> {
  await n8nApi.post('/webhook/suporte_resolver_atendimento', { sessionId })
}

export async function pollMensagensAdmin(
  sessionId: string,
  after: string
): Promise<{ mensagens: Mensagem[]; modo: string; status: string }> {
  const { data } = await n8nApi.get('/webhook/suporte_poll_admin', {
    params: { sessionId, after },
  })
  return data
}

// ── Base de Conhecimento ───────────────────────────────────────────

export async function getDocumentos(): Promise<DocumentoBase[]> {
  const { data } = await n8nApi.get('/webhook/suporte_documentos')
  return Array.isArray(data) ? data : data.documentos || []
}

export async function registrarDocumento(payload: {
  filename: string
  tipo: string
  tamanho: string
  categoria?: string
}): Promise<{ id: number }> {
  const { data } = await n8nApi.post('/webhook/suporte_registrar_documento', payload)
  return data
}

export async function uploadDocumento(file: File): Promise<{ status: string; documents_processed: number }> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await axios.post(
    `${N8N_BASE}/webhook/suporte_upload_base_conhecimento`,
    formData,
    {
      timeout: 120000,
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )
  return data
}

export async function atualizarDocumentoStatus(payload: {
  filename: string
  status: string
  chunks?: number
}): Promise<void> {
  await n8nApi.post('/webhook/suporte_atualizar_documento', payload)
}

export async function excluirDocumento(filename: string): Promise<void> {
  await n8nApi.post('/webhook/suporte_excluir_documento', { filename })
}

// ── Avaliação de Mensagens ────────────────────────────────────────

export async function avaliarMensagem(payload: {
  mensagemId: string
  sessionId: string
  avaliacao: 'positivo' | 'negativo' | null
}): Promise<void> {
  await n8nApi.post('/webhook/suporte_avaliar_mensagem', payload)
}

// ── Encerramento por Inatividade ──────────────────────────────────

export async function encerrarPorInatividade(sessionId: string): Promise<void> {
  await n8nApi.post('/webhook/suporte_encerrar_inatividade', { sessionId })
}

// ── Imagens da Base de Conhecimento ─────────────────────────────────

export async function uploadImagem(file: File, pasta?: string, nome?: string): Promise<ResponseAPI<SuporteImagem>> {
  const formData = new FormData()
  formData.append('file', file)
  if (pasta) formData.append('pasta', pasta)
  if (nome) formData.append('nome', nome)

  const { data } = await api.post<ResponseAPI<SuporteImagem>>(
    '/admin/suporte-imagens/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}

export async function listarImagens(pasta?: string): Promise<ResponseAPI<SuporteImagem[]>> {
  const params = pasta ? { pasta } : {}
  const { data } = await api.get<ResponseAPI<SuporteImagem[]>>(
    '/admin/suporte-imagens',
    { params }
  )
  return data
}

export async function deletarImagem(relativePath: string): Promise<ResponseAPI<void>> {
  const { data } = await api.delete<ResponseAPI<void>>(
    '/admin/suporte-imagens',
    { params: { relativePath } }
  )
  return data
}

export async function criarPasta(nome: string): Promise<ResponseAPI<SuportePasta>> {
  const { data } = await api.post<ResponseAPI<SuportePasta>>(
    '/admin/suporte-imagens/pastas',
    { nome }
  )
  return data
}

export async function listarPastas(): Promise<ResponseAPI<SuportePasta[]>> {
  const { data } = await api.get<ResponseAPI<SuportePasta[]>>(
    '/admin/suporte-imagens/pastas'
  )
  return data
}

export async function deletarPasta(nome: string): Promise<ResponseAPI<void>> {
  const { data } = await api.delete<ResponseAPI<void>>(
    '/admin/suporte-imagens/pastas',
    { params: { nome } }
  )
  return data
}
