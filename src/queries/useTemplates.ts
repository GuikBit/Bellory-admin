import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTemplates,
  getTemplate,
  criarTemplate,
  atualizarTemplate,
  desativarTemplate,
  ativarTemplate,
  marcarPadrao,
  previewTemplate,
} from '../services/templates'
import type {
  TemplateBelloryCreate,
  TemplateBelloryUpdate,
  TemplatePreviewRequest,
  TipoTemplate,
  CategoriaTemplate,
} from '../types/template'
import toast from 'react-hot-toast'

const QUERY_KEY = 'admin-templates'

export function useTemplates(tipo?: TipoTemplate, categoria?: CategoriaTemplate) {
  return useQuery({
    queryKey: [QUERY_KEY, { tipo, categoria }],
    queryFn: () => getTemplates({ tipo, categoria }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useTemplate(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getTemplate(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

export function useCriarTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TemplateBelloryCreate) => criarTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Template criado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar template')
    },
  })
}

export function useAtualizarTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TemplateBelloryUpdate }) => atualizarTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Template atualizado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar template')
    },
  })
}

export function useDesativarTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => desativarTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Template desativado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao desativar template')
    },
  })
}

export function useAtivarTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ativarTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Template ativado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao ativar template')
    },
  })
}

export function useMarcarPadrao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => marcarPadrao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Template marcado como padrão')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao marcar como padrão')
    },
  })
}

export function usePreviewTemplate() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: TemplatePreviewRequest }) => previewTemplate(id, data),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao gerar preview')
    },
  })
}
