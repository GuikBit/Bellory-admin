import { api } from './api'
import type {
  PlanoBellory,
  PlanoBelloryCreate,
  PlanoBelloryUpdate,
  ReordenarPlanos,
} from '../types/plano'

export async function getPlanos(): Promise<PlanoBellory[]> {
  const response = await api.get('/admin/planos')
  return response.data.dados
}

export async function getPlano(id: number): Promise<PlanoBellory> {
  const response = await api.get(`/admin/planos/${id}`)
  return response.data.dados
}

export async function criarPlano(data: PlanoBelloryCreate): Promise<PlanoBellory> {
  const response = await api.post('/admin/planos', data)
  return response.data.dados
}

export async function atualizarPlano(id: number, data: PlanoBelloryUpdate): Promise<PlanoBellory> {
  const response = await api.put(`/admin/planos/${id}`, data)
  return response.data.dados
}

export async function desativarPlano(id: number): Promise<void> {
  await api.delete(`/admin/planos/${id}`)
}

export async function ativarPlano(id: number): Promise<PlanoBellory> {
  const response = await api.patch(`/admin/planos/${id}/ativar`)
  return response.data.dados
}

export async function reordenarPlanos(data: ReordenarPlanos): Promise<void> {
  await api.put('/admin/planos/reordenar', data)
}
