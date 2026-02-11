import { api } from './api'
import type { DashboardData } from '../types/dashboard'

export async function getDashboard(): Promise<DashboardData> {
  const response = await api.get('/admin/dashboard')
  return response.data
}
