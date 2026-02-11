import { useQuery } from '@tanstack/react-query'
import {
  getMetricasAgendamentos,
  getMetricasFaturamento,
  getMetricasServicos,
  getMetricasFuncionarios,
  getMetricasClientes,
  getMetricasInstancias,
  getMetricasPlanos,
} from '../services/metricas'

export function useMetricasAgendamentos() {
  return useQuery({
    queryKey: ['admin-metricas-agendamentos'],
    queryFn: getMetricasAgendamentos,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useMetricasFaturamento() {
  return useQuery({
    queryKey: ['admin-metricas-faturamento'],
    queryFn: getMetricasFaturamento,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useMetricasServicos() {
  return useQuery({
    queryKey: ['admin-metricas-servicos'],
    queryFn: getMetricasServicos,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useMetricasFuncionarios() {
  return useQuery({
    queryKey: ['admin-metricas-funcionarios'],
    queryFn: getMetricasFuncionarios,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useMetricasClientes() {
  return useQuery({
    queryKey: ['admin-metricas-clientes'],
    queryFn: getMetricasClientes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useMetricasInstancias() {
  return useQuery({
    queryKey: ['admin-metricas-instancias'],
    queryFn: getMetricasInstancias,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useMetricasPlanos() {
  return useQuery({
    queryKey: ['admin-metricas-planos'],
    queryFn: getMetricasPlanos,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
