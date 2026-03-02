import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAssinaturas,
  getAssinatura,
  getCobrancasAssinatura,
  getAssinaturaByOrganizacao,
  getCobrancasOrganizacao,
  getPagamentosOrganizacao,
  getPagamentosCobranca,
  cancelarAssinatura,
  suspenderAssinatura,
  reativarAssinatura,
  getBillingDashboard,
} from '../services/assinaturas'
import type { AssinaturaFiltro } from '../types/assinatura'
import toast from 'react-hot-toast'

const QUERY_KEY = 'admin-assinaturas'
const DASHBOARD_KEY = 'admin-billing-dashboard'

// === Queries - Listagem Geral ===

export function useAssinaturas(filtro?: AssinaturaFiltro) {
  return useQuery({
    queryKey: [QUERY_KEY, filtro],
    queryFn: () => getAssinaturas(filtro),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useBillingDashboard() {
  return useQuery({
    queryKey: [DASHBOARD_KEY],
    queryFn: getBillingDashboard,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// === Queries - Por Assinatura ID ===

export function useAssinatura(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getAssinatura(id),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

export function useCobrancasAssinatura(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'cobrancas'],
    queryFn: () => getCobrancasAssinatura(id),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

// === Queries - Por Organizacao ID ===

export function useAssinaturaByOrganizacao(orgId: number) {
  return useQuery({
    queryKey: [QUERY_KEY, 'org', orgId],
    queryFn: () => getAssinaturaByOrganizacao(orgId),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!orgId,
  })
}

export function useCobrancasOrganizacao(orgId: number) {
  return useQuery({
    queryKey: [QUERY_KEY, 'org', orgId, 'cobrancas'],
    queryFn: () => getCobrancasOrganizacao(orgId),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!orgId,
  })
}

export function usePagamentosOrganizacao(orgId: number) {
  return useQuery({
    queryKey: [QUERY_KEY, 'org', orgId, 'pagamentos'],
    queryFn: () => getPagamentosOrganizacao(orgId),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!orgId,
  })
}

// === Queries - Pagamentos por Cobranca ===

export function usePagamentosCobranca(cobrancaId: number) {
  return useQuery({
    queryKey: [QUERY_KEY, 'cobranca', cobrancaId, 'pagamentos'],
    queryFn: () => getPagamentosCobranca(cobrancaId),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!cobrancaId,
  })
}

// === Mutations ===

export function useCancelarAssinatura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelarAssinatura(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_KEY] })
      toast.success('Assinatura cancelada com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao cancelar assinatura')
    },
  })
}

export function useSuspenderAssinatura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => suspenderAssinatura(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_KEY] })
      toast.success('Assinatura suspensa com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao suspender assinatura')
    },
  })
}

export function useReativarAssinatura() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => reativarAssinatura(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_KEY] })
      toast.success('Assinatura reativada com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao reativar assinatura')
    },
  })
}
