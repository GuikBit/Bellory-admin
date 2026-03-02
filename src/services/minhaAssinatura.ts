import { api } from './api'
import type {
  AssinaturaStatus,
  AssinaturaResponse,
  CobrancaPlataforma,
  EscolherPlano,
} from '../types/assinatura'

export async function getMinhaAssinaturaStatus(): Promise<AssinaturaStatus> {
  const response = await api.get('/assinatura/status')
  return response.data.dados
}

export async function getMinhasCobrancas(status?: string): Promise<CobrancaPlataforma[]> {
  const params: Record<string, string> = {}
  if (status) params.status = status

  const response = await api.get('/assinatura/cobrancas', { params })
  return response.data.dados
}

export async function escolherPlano(data: EscolherPlano): Promise<AssinaturaResponse> {
  const response = await api.post('/assinatura/escolher-plano', data)
  return response.data.dados
}
