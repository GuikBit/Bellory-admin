import { api } from './api'
import type {
  CupomDesconto,
  CupomDescontoCreate,
  CupomDescontoUpdate,
  CupomUtilizacao,
} from '../types/cupom'

const BASE = '/admin/cupons'

export async function listarCupons(): Promise<CupomDesconto[]> {
  const { data } = await api.get(BASE)
  return data.dados
}

export async function listarCuponsVigentes(): Promise<CupomDesconto[]> {
  const { data } = await api.get(`${BASE}/vigentes`)
  return data.dados
}

export async function buscarCupom(id: number): Promise<CupomDesconto> {
  const { data } = await api.get(`${BASE}/${id}`)
  return data.dados
}

export async function criarCupom(dto: CupomDescontoCreate): Promise<CupomDesconto> {
  const { data } = await api.post(BASE, dto)
  return data.dados
}

export async function atualizarCupom(id: number, dto: CupomDescontoUpdate): Promise<CupomDesconto> {
  const { data } = await api.put(`${BASE}/${id}`, dto)
  return data.dados
}

export async function desativarCupom(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}

export async function ativarCupom(id: number): Promise<CupomDesconto> {
  const { data } = await api.patch(`${BASE}/${id}/ativar`)
  return data.dados
}

export async function listarUtilizacoes(id: number): Promise<CupomUtilizacao[]> {
  const { data } = await api.get(`${BASE}/${id}/utilizacoes`)
  return data.dados
}
