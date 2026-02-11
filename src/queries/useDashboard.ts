import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../services/dashboard'

export function useDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getDashboard,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
