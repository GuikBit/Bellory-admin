import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import {
  getDashboardSuporte,
  getAtendimentos,
  getAtendimentoDetalhe,
  enviarRespostaHumana,
  resolverAtendimento,
  pollMensagensAdmin,
  getDocumentos,
  registrarDocumento,
  uploadDocumento,
  atualizarDocumentoStatus,
  excluirDocumento,
} from '../services/suporte'
import type { Mensagem } from '../types/suporte'
import toast from 'react-hot-toast'

// ── Dashboard ──────────────────────────────────────────────────────

export function useDashboardSuporte() {
  return useQuery({
    queryKey: ['suporte-dashboard'],
    queryFn: getDashboardSuporte,
    refetchInterval: 60000,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  })
}

// ── Atendimentos ───────────────────────────────────────────────────

export function useAtendimentos(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['suporte-atendimentos', filters],
    queryFn: () => getAtendimentos(filters),
    refetchInterval: 15000,
    staleTime: 5000,
    refetchOnWindowFocus: true,
  })
}

export function useAtendimentoDetalhe(sessionId: string | null) {
  return useQuery({
    queryKey: ['suporte-atendimento', sessionId],
    queryFn: () => getAtendimentoDetalhe(sessionId!),
    enabled: !!sessionId,
    staleTime: 5000,
    refetchOnWindowFocus: true,
  })
}

// ── Polling de mensagens (admin) ──────────────────────────────────

export function usePollingMensagensAdmin(
  sessionId: string | null,
  enabled: boolean
) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [lastTimestamp, setLastTimestamp] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  const poll = useCallback(async () => {
    if (!sessionId || !enabled) return
    try {
      const data = await pollMensagensAdmin(sessionId, lastTimestamp)
      if (data.mensagens && data.mensagens.length > 0) {
        setMensagens(prev => [...prev, ...data.mensagens])
        const ultima = data.mensagens[data.mensagens.length - 1]
        setLastTimestamp(ultima.criado_em)
      }
      if (data.status) setStatus(data.status)
    } catch {
      // silently fail on poll
    }
  }, [sessionId, enabled, lastTimestamp])

  useEffect(() => {
    if (!sessionId || !enabled) return

    const getInterval = () => document.hasFocus() ? 3000 : 10000

    let timer: ReturnType<typeof setTimeout>
    const schedulePoll = () => {
      timer = setTimeout(async () => {
        await poll()
        schedulePoll()
      }, getInterval())
    }

    poll()
    schedulePoll()

    return () => clearTimeout(timer)
  }, [sessionId, enabled, poll])

  const reset = useCallback((initialMensagens?: Mensagem[]) => {
    setMensagens(initialMensagens || [])
    if (initialMensagens && initialMensagens.length > 0) {
      setLastTimestamp(initialMensagens[initialMensagens.length - 1].criado_em)
    } else {
      setLastTimestamp('')
    }
    setStatus('')
  }, [])

  return { mensagens, status, reset }
}

// ── Mutations ─────────────────────────────────────────────────────

export function useEnviarRespostaHumana() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: enviarRespostaHumana,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suporte-atendimento', variables.sessionId] })
    },
    onError: () => {
      toast.error('Erro ao enviar resposta')
    },
  })
}

export function useResolverAtendimento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resolverAtendimento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suporte-atendimentos'] })
      queryClient.invalidateQueries({ queryKey: ['suporte-dashboard'] })
      toast.success('Atendimento resolvido')
    },
    onError: () => {
      toast.error('Erro ao resolver atendimento')
    },
  })
}

// ── Base de Conhecimento ──────────────────────────────────────────

export function useDocumentosSuporte() {
  return useQuery({
    queryKey: ['suporte-documentos'],
    queryFn: getDocumentos,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  })
}

export function useUploadDocumento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const tamanho = formatFileSize(file.size)

      // Step 1: registrar metadata
      await registrarDocumento({
        filename: file.name,
        tipo: ext,
        tamanho,
      })

      // Step 2: upload para n8n processar
      const result = await uploadDocumento(file)

      // Step 3: atualizar status
      await atualizarDocumentoStatus({
        filename: file.name,
        status: 'processado',
        chunks: result.documents_processed || 0,
      })

      return result
    },
    onSuccess: (_data, file) => {
      queryClient.invalidateQueries({ queryKey: ['suporte-documentos'] })
      toast.success(`"${file.name}" processado com sucesso`)
    },
    onError: async (error: unknown, file) => {
      // Tenta marcar como erro se o registro já foi criado
      try {
        await atualizarDocumentoStatus({
          filename: file.name,
          status: 'erro',
        })
      } catch {
        // ignore
      }
      queryClient.invalidateQueries({ queryKey: ['suporte-documentos'] })
      const msg = error instanceof Error ? error.message : 'Erro no upload'
      toast.error(`Erro ao processar "${file.name}": ${msg}`)
    },
  })
}

export function useExcluirDocumento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: excluirDocumento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suporte-documentos'] })
      toast.success('Documento excluído da base de conhecimento')
    },
    onError: () => {
      toast.error('Erro ao excluir documento')
    },
  })
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
