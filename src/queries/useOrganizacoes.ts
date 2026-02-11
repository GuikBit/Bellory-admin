import { useQuery } from '@tanstack/react-query'
import { getOrganizacoes, getOrganizacao } from '../services/organizacoes'

export function useOrganizacoes() {
  return useQuery({
    queryKey: ['admin-organizacoes'],
    queryFn: getOrganizacoes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useOrganizacao(id: number) {
  return useQuery({
    queryKey: ['admin-organizacao', id],
    queryFn: () => getOrganizacao(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}
