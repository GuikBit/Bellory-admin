import { useQuery } from '@tanstack/react-query'
import {
  getAnalyticsOverview,
  getAnalyticsTraffic,
  getAnalyticsBehavior,
  getAnalyticsConversions,
  getAnalyticsContext,
  getAnalyticsRealtime,
} from '../services/analytics'

export function useAnalyticsOverview(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics-overview', startDate, endDate],
    queryFn: () => getAnalyticsOverview(startDate, endDate),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useAnalyticsTraffic(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics-traffic', startDate, endDate],
    queryFn: () => getAnalyticsTraffic(startDate, endDate),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useAnalyticsBehavior(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics-behavior', startDate, endDate],
    queryFn: () => getAnalyticsBehavior(startDate, endDate),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useAnalyticsConversions(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics-conversions', startDate, endDate],
    queryFn: () => getAnalyticsConversions(startDate, endDate),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useAnalyticsContext(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics-context', startDate, endDate],
    queryFn: () => getAnalyticsContext(startDate, endDate),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useAnalyticsRealtime() {
  return useQuery({
    queryKey: ['analytics-realtime'],
    queryFn: getAnalyticsRealtime,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: false,
  })
}
