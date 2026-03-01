import { api } from './api'
import type { AdminUser, AdminUserCreate, AdminUserUpdate } from '../types/adminUser'

export async function getAdminUsuarios(): Promise<AdminUser[]> {
  const response = await api.get('/admin/usuarios')
  return response.data
}

export async function getAdminUsuario(id: number): Promise<AdminUser> {
  const response = await api.get(`/admin/usuarios/${id}`)
  return response.data
}

export async function criarAdminUsuario(data: AdminUserCreate): Promise<AdminUser> {
  const response = await api.post('/admin/usuarios', data)
  return response.data
}

export async function atualizarAdminUsuario(id: number, data: AdminUserUpdate): Promise<AdminUser> {
  const response = await api.put(`/admin/usuarios/${id}`, data)
  return response.data
}

export async function desativarAdminUsuario(id: number): Promise<void> {
  await api.delete(`/admin/usuarios/${id}`)
}
