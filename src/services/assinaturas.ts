import { api } from './api'
import type {
  AssinaturaResponse,
  CobrancaPlataforma,
  PagamentoPlataforma,
  BillingDashboard,
  AssinaturaFiltro,
} from '../types/assinatura'

// ==================== LISTAGEM GERAL ====================

export async function getAssinaturas(filtro?: AssinaturaFiltro): Promise<AssinaturaResponse[]> {
  const params: Record<string, string> = {}
  if (filtro?.status) params.status = filtro.status
  if (filtro?.planoCodigo) params.planoCodigo = filtro.planoCodigo

  const response = await api.get('/admin/assinaturas', { params })
  return response.data.dados
}

export async function getBillingDashboard(): Promise<BillingDashboard> {
  const response = await api.get('/admin/assinaturas/dashboard')
  return response.data.dados
}

// ==================== POR ASSINATURA ID ====================

export async function getAssinatura(id: number): Promise<AssinaturaResponse> {
  const response = await api.get(`/admin/assinaturas/${id}`)
  return response.data.dados
}

export async function getCobrancasAssinatura(id: number): Promise<CobrancaPlataforma[]> {
  const response = await api.get(`/admin/assinaturas/${id}/cobrancas`)
  return response.data.dados
}

// ==================== POR ORGANIZACAO ID ====================

export async function getAssinaturaByOrganizacao(orgId: number): Promise<AssinaturaResponse> {
  const response = await api.get(`/admin/assinaturas/organizacao/${orgId}`)
  return response.data.dados
}

export async function getCobrancasOrganizacao(orgId: number): Promise<CobrancaPlataforma[]> {
  const response = await api.get(`/admin/assinaturas/organizacao/${orgId}/cobrancas`)
  return response.data.dados
}

export async function getPagamentosOrganizacao(orgId: number): Promise<PagamentoPlataforma[]> {
  const response = await api.get(`/admin/assinaturas/organizacao/${orgId}/pagamentos`)
  return response.data.dados
}

// ==================== PAGAMENTOS POR COBRANCA ====================

export async function getPagamentosCobranca(cobrancaId: number): Promise<PagamentoPlataforma[]> {
  const response = await api.get(`/admin/assinaturas/cobrancas/${cobrancaId}/pagamentos`)
  return response.data.dados
}

// ==================== ACOES ====================

export async function cancelarAssinatura(id: number): Promise<AssinaturaResponse> {
  const response = await api.post(`/admin/assinaturas/${id}/cancelar`)
  return response.data.dados
}

export async function suspenderAssinatura(id: number): Promise<AssinaturaResponse> {
  const response = await api.post(`/admin/assinaturas/${id}/suspender`)
  return response.data.dados
}

export async function reativarAssinatura(id: number): Promise<AssinaturaResponse> {
  const response = await api.post(`/admin/assinaturas/${id}/reativar`)
  return response.data.dados
}
