import { api } from './api'
import type {
  AnalyticsOverviewDTO,
  AnalyticsTrafficDTO,
  AnalyticsBehaviorDTO,
  AnalyticsConversionsDTO,
  AnalyticsContextDTO,
  AnalyticsRealtimeDTO,
} from '../types/analytics'

const BASE = '/admin/analytics'

export async function getAnalyticsOverview(startDate: string, endDate: string): Promise<AnalyticsOverviewDTO> {
  const response = await api.get(`${BASE}/overview`, { params: { start_date: startDate, end_date: endDate } })
  return response.data
}

export async function getAnalyticsTraffic(startDate: string, endDate: string): Promise<AnalyticsTrafficDTO> {
  const response = await api.get(`${BASE}/traffic`, { params: { start_date: startDate, end_date: endDate } })
  return response.data
}

export async function getAnalyticsBehavior(startDate: string, endDate: string): Promise<AnalyticsBehaviorDTO> {
  const response = await api.get(`${BASE}/behavior`, { params: { start_date: startDate, end_date: endDate } })
  return response.data
}

export async function getAnalyticsConversions(startDate: string, endDate: string): Promise<AnalyticsConversionsDTO> {
  const response = await api.get(`${BASE}/conversions`, { params: { start_date: startDate, end_date: endDate } })
  return response.data
}

export async function getAnalyticsContext(startDate: string, endDate: string): Promise<AnalyticsContextDTO> {
  const response = await api.get(`${BASE}/context`, { params: { start_date: startDate, end_date: endDate } })
  return response.data
}

export async function getAnalyticsRealtime(): Promise<AnalyticsRealtimeDTO> {
  const response = await api.get(`${BASE}/realtime`)
  return response.data
}
