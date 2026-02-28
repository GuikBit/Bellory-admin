import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPlanos,
  getPlano,
  criarPlano,
  atualizarPlano,
  desativarPlano,
  ativarPlano,
  reordenarPlanos,
} from '../services/planos'
import type { PlanoBelloryCreate, PlanoBelloryUpdate, ReordenarPlanos } from '../types/plano'
import toast from 'react-hot-toast'

const QUERY_KEY = 'admin-planos'

export function usePlanos() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getPlanos,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function usePlano(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getPlano(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

export function useCriarPlano() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlanoBelloryCreate) => criarPlano(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Plano criado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar plano')
    },
  })
}

export function useAtualizarPlano() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PlanoBelloryUpdate }) => atualizarPlano(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Plano atualizado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar plano')
    },
  })
}

export function useDesativarPlano() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => desativarPlano(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Plano desativado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao desativar plano')
    },
  })
}

export function useAtivarPlano() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ativarPlano(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Plano ativado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao ativar plano')
    },
  })
}

export function useReordenarPlanos() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ReordenarPlanos) => reordenarPlanos(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Planos reordenados com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao reordenar planos')
    },
  })
}
