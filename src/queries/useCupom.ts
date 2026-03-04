import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listarCupons,
  listarCuponsVigentes,
  buscarCupom,
  criarCupom,
  atualizarCupom,
  desativarCupom,
  ativarCupom,
  listarUtilizacoes,
} from '../services/cupomService'
import type { CupomDescontoCreate, CupomDescontoUpdate } from '../types/cupom'
import toast from 'react-hot-toast'

const QUERY_KEY = 'admin-cupons'

export function useCupons() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: listarCupons,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useCuponsVigentes() {
  return useQuery({
    queryKey: [QUERY_KEY, 'vigentes'],
    queryFn: listarCuponsVigentes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useCupom(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => buscarCupom(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

export function useCupomUtilizacoes(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id, 'utilizacoes'],
    queryFn: () => listarUtilizacoes(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

export function useCriarCupom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CupomDescontoCreate) => criarCupom(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Cupom criado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar cupom')
    },
  })
}

export function useAtualizarCupom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: CupomDescontoUpdate }) =>
      atualizarCupom(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Cupom atualizado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar cupom')
    },
  })
}

export function useDesativarCupom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => desativarCupom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Cupom desativado')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao desativar cupom')
    },
  })
}

export function useAtivarCupom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ativarCupom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Cupom ativado')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao ativar cupom')
    },
  })
}
