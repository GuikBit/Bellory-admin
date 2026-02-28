import { api } from './api'
import type {
  TemplateBellory,
  TemplateBelloryCreate,
  TemplateBelloryUpdate,
  TemplatePreviewRequest,
  TipoTemplate,
  CategoriaTemplate,
} from '../types/template'

interface GetTemplatesParams {
  tipo?: TipoTemplate
  categoria?: CategoriaTemplate
}

export async function getTemplates(params?: GetTemplatesParams): Promise<TemplateBellory[]> {
  const response = await api.get('/admin/templates', { params })
  return response.data.dados
}

export async function getTemplate(id: number): Promise<TemplateBellory> {
  const response = await api.get(`/admin/templates/${id}`)
  return response.data.dados
}

export async function criarTemplate(data: TemplateBelloryCreate): Promise<TemplateBellory> {
  const response = await api.post('/admin/templates', data)
  return response.data.dados
}

export async function atualizarTemplate(id: number, data: TemplateBelloryUpdate): Promise<TemplateBellory> {
  const response = await api.put(`/admin/templates/${id}`, data)
  return response.data.dados
}

export async function desativarTemplate(id: number): Promise<void> {
  await api.delete(`/admin/templates/${id}`)
}

export async function ativarTemplate(id: number): Promise<TemplateBellory> {
  const response = await api.patch(`/admin/templates/${id}/ativar`)
  return response.data.dados
}

export async function marcarPadrao(id: number): Promise<TemplateBellory> {
  const response = await api.patch(`/admin/templates/${id}/padrao`)
  return response.data.dados
}

export async function previewTemplate(id: number, data?: TemplatePreviewRequest): Promise<string> {
  const response = await api.post(`/admin/templates/${id}/preview`, data || {})
  return response.data.dados
}
