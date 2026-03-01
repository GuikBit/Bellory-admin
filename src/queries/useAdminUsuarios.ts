import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminUsuarios,
  getAdminUsuario,
  criarAdminUsuario,
  atualizarAdminUsuario,
  desativarAdminUsuario,
} from '../services/adminUsuarios'
import type { AdminUserCreate, AdminUserUpdate } from '../types/adminUser'
import toast from 'react-hot-toast'

const QUERY_KEY = 'admin-usuarios'

export function useAdminUsuarios() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getAdminUsuarios,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useAdminUsuario(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getAdminUsuario(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

export function useCriarAdminUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AdminUserCreate) => criarAdminUsuario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Usuário criado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar usuário')
    },
  })
}

export function useAtualizarAdminUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AdminUserUpdate }) => atualizarAdminUsuario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Usuário atualizado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar usuário')
    },
  })
}

export function useDesativarAdminUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => desativarAdminUsuario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Usuário desativado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao desativar usuário')
    },
  })
}
