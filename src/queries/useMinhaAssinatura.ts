import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMinhaAssinaturaStatus,
  getMinhasCobrancas,
  escolherPlano,
} from '../services/minhaAssinatura'
import type { EscolherPlano } from '../types/assinatura'
import toast from 'react-hot-toast'

const STATUS_KEY = 'minha-assinatura-status'
const COBRANCAS_KEY = 'minhas-cobrancas'

export function useMinhaAssinaturaStatus() {
  return useQuery({
    queryKey: [STATUS_KEY],
    queryFn: getMinhaAssinaturaStatus,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useMinhasCobrancas(status?: string) {
  return useQuery({
    queryKey: [COBRANCAS_KEY, status],
    queryFn: () => getMinhasCobrancas(status),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useEscolherPlano() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EscolherPlano) => escolherPlano(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STATUS_KEY] })
      queryClient.invalidateQueries({ queryKey: [COBRANCAS_KEY] })
      toast.success('Plano ativado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao escolher plano')
    },
  })
}
