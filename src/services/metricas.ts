import { api } from './api'
import type {
  AgendamentoMetricas,
  FaturamentoMetricas,
  ServicoMetricas,
  FuncionarioMetricas,
  ClienteMetricas,
  InstanciaMetricas,
  PlanoMetricas,
} from '../types/metricas'

export async function getMetricasAgendamentos(): Promise<AgendamentoMetricas> {
  const response = await api.get('/admin/metricas/agendamentos')
  return response.data
}

export async function getMetricasFaturamento(): Promise<FaturamentoMetricas> {
  const response = await api.get('/admin/metricas/faturamento')
  return response.data
}

export async function getMetricasServicos(): Promise<ServicoMetricas> {
  const response = await api.get('/admin/metricas/servicos')
  return response.data
}

export async function getMetricasFuncionarios(): Promise<FuncionarioMetricas> {
  const response = await api.get('/admin/metricas/funcionarios')
  return response.data
}

export async function getMetricasClientes(): Promise<ClienteMetricas> {
  const response = await api.get('/admin/metricas/clientes')
  return response.data
}

export async function getMetricasInstancias(): Promise<InstanciaMetricas> {
  const response = await api.get('/admin/metricas/instancias')
  return response.data
}

export async function getMetricasPlanos(): Promise<PlanoMetricas> {
  const response = await api.get('/admin/metricas/planos')
  return response.data
}
