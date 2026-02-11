import { api } from './api'
import type { OrganizacaoList, OrganizacaoDetail } from '../types/organizacao'

export async function getOrganizacoes(): Promise<OrganizacaoList[]> {
  const response = await api.get('/admin/organizacoes')
  return response.data
}

export async function getOrganizacao(id: number): Promise<OrganizacaoDetail> {
  const response = await api.get(`/admin/organizacoes/${id}`)
  return response.data
}
