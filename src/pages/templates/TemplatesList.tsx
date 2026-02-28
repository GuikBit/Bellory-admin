import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTemplates, useDesativarTemplate, useAtivarTemplate, useMarcarPadrao, usePreviewTemplate } from '../../queries/useTemplates'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { MetricCardSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { WhatsAppPreview } from '../../components/templates/WhatsAppPreview'
import { EmailPreview } from '../../components/templates/EmailPreview'
import { formatDate } from '../../utils/format'
import { cn } from '../../utils/cn'
import {
  Search,
  Plus,
  FileText,
  Pencil,
  Eye,
  Power,
  PowerOff,
  Star,
  AlertTriangle,
  Check,
  X,
  MoreHorizontal,
  MessageSquare,
  Mail,
  Bell,
  KeyRound,
  Receipt,
  Copy,
  Shield,
  type LucideIcon,
} from 'lucide-react'
import type { TemplateBellory, TipoTemplate, CategoriaTemplate } from '../../types/template'
import { TIPO_LABELS, CATEGORIA_LABELS, TIPO_COLORS, SEED_TEMPLATE_CODES } from '../../types/template'

type FilterTipo = 'TODOS' | TipoTemplate
type FilterCategoria = 'TODOS' | CategoriaTemplate

const ICON_MAP: Record<string, LucideIcon> = {
  MessageSquare, Mail, Bell, KeyRound, Receipt, AlertTriangle, FileText, Shield, Star,
}

function TemplateIcon({ iconName, tipo }: { iconName: string | null; tipo: TipoTemplate }) {
  const Icon = iconName ? ICON_MAP[iconName] || FileText : FileText
  const color = tipo === 'WHATSAPP' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
  return <Icon size={20} className={color} />
}

function TipoBadge({ tipo }: { tipo: TipoTemplate }) {
  const colors = TIPO_COLORS[tipo]
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide', colors.bg, colors.darkBg, colors.text, colors.darkText)}>
      {tipo === 'WHATSAPP' ? <MessageSquare size={10} /> : <Mail size={10} />}
      {TIPO_LABELS[tipo]}
    </span>
  )
}

function CategoriaBadge({ categoria }: { categoria: CategoriaTemplate }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#d8ccc4]/30 text-[#6b5d57] dark:bg-[#2D2925] dark:text-[#B8AEA4]">
      {CATEGORIA_LABELS[categoria]}
    </span>
  )
}

export function TemplatesList() {
  const { data, isLoading, error } = useTemplates()
  const desativarTemplate = useDesativarTemplate()
  const ativarTemplate = useAtivarTemplate()
  const marcarPadrao = useMarcarPadrao()
  const previewMutation = usePreviewTemplate()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState<FilterTipo>('TODOS')
  const [filterCategoria, setFilterCategoria] = useState<FilterCategoria>('TODOS')
  const [confirmAction, setConfirmAction] = useState<{ id: number; type: 'desativar' | 'ativar' | 'padrao'; template: TemplateBellory } | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [previewModal, setPreviewModal] = useState<{ template: TemplateBellory; content: string } | null>(null)

  const filtered = useMemo(() => {
    if (!data) return []
    let result = [...data]

    if (search) {
      const term = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.nome.toLowerCase().includes(term) ||
          t.codigo.toLowerCase().includes(term)
      )
    }

    if (filterTipo !== 'TODOS') result = result.filter((t) => t.tipo === filterTipo)
    if (filterCategoria !== 'TODOS') result = result.filter((t) => t.categoria === filterCategoria)

    return result
  }, [data, search, filterTipo, filterCategoria])

  const stats = useMemo(() => {
    if (!data) return { total: 0, whatsapp: 0, email: 0, padrao: 0 }
    return {
      total: data.length,
      whatsapp: data.filter((t) => t.tipo === 'WHATSAPP').length,
      email: data.filter((t) => t.tipo === 'EMAIL').length,
      padrao: data.filter((t) => t.padrao).length,
    }
  }, [data])

  const handleConfirm = () => {
    if (!confirmAction) return
    if (confirmAction.type === 'desativar') desativarTemplate.mutate(confirmAction.id)
    else if (confirmAction.type === 'ativar') ativarTemplate.mutate(confirmAction.id)
    else if (confirmAction.type === 'padrao') marcarPadrao.mutate(confirmAction.id)
    setConfirmAction(null)
  }

  const handlePreview = (template: TemplateBellory) => {
    previewMutation.mutate(
      { id: template.id },
      {
        onSuccess: (content) => setPreviewModal({ template, content }),
      }
    )
  }

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // toast handled by mutation
      })
  }

  const isSeedTemplate = (codigo: string) => SEED_TEMPLATE_CODES.includes(codigo)

  if (error) {
    return (
      <EmptyState
        icon={<FileText size={48} />}
        title="Erro ao carregar"
        description="Não foi possível carregar os templates."
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      {!isLoading && data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4">
            <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-[#2a2420] dark:text-[#F5F0EB] mt-1">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-1.5">
              <MessageSquare size={12} className="text-green-600 dark:text-green-400" />
              <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">WhatsApp</p>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.whatsapp}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-1.5">
              <Mail size={12} className="text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">E-mail</p>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.email}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-1.5">
              <Star size={12} className="text-amber-500" />
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Padrão</p>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.padrao}</p>
          </Card>
        </div>
      )}

      {/* Filters bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <Button variant="primary" onClick={() => navigate('/templates/novo')} leftIcon={<Plus size={16} />}>
            <span className="hidden sm:inline">Novo Template</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        {/* Type tabs + Category filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-1 bg-[#faf8f6] dark:bg-[#0D0B0A] rounded-lg p-1">
            {(['TODOS', 'WHATSAPP', 'EMAIL'] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFilterTipo(tipo)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                  filterTipo === tipo
                    ? 'bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] shadow-sm'
                    : 'text-[#6b5d57] dark:text-[#7A716A] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]'
                )}
              >
                {tipo === 'TODOS' ? 'Todos' : tipo === 'WHATSAPP' ? 'WhatsApp' : 'E-mail'}
              </button>
            ))}
          </div>
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value as FilterCategoria)}
            className="h-9 px-3 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62]"
          >
            <option value="TODOS">Todas categorias</option>
            {(Object.entries(CATEGORIA_LABELS) as [CategoriaTemplate, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <span className="text-sm text-[#6b5d57] dark:text-[#7A716A] ml-auto">
            {isLoading ? 'Carregando...' : `${filtered.length} templates`}
          </span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} />}
          title="Nenhum template"
          description={search ? 'Nenhum resultado para sua busca.' : 'Nenhum template cadastrado ainda.'}
          action={
            <Button onClick={() => navigate('/templates/novo')} leftIcon={<Plus size={16} />}>
              Criar primeiro template
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <Card
              key={template.id}
              hover
              className={cn(
                'relative overflow-hidden cursor-pointer',
                !template.ativo && 'opacity-60'
              )}
              onClick={() => navigate(`/templates/${template.id}`)}
            >
              {/* Seed badge */}
              {isSeedTemplate(template.codigo) && (
                <div className="absolute top-0 right-0">
                  <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg">
                    Seed
                  </div>
                </div>
              )}

              <div className="p-5">
                {/* Icon + Title */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                    template.tipo === 'WHATSAPP'
                      ? 'bg-green-100 dark:bg-green-900/20'
                      : 'bg-blue-100 dark:bg-blue-900/20'
                  )}>
                    <TemplateIcon iconName={template.icone} tipo={template.tipo} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] truncate">{template.nome}</h3>
                      {template.padrao && (
                        <Star size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>
                    <code className="text-[10px] font-mono text-[#6b5d57] dark:text-[#7A716A]">{template.codigo}</code>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <TipoBadge tipo={template.tipo} />
                  <CategoriaBadge categoria={template.categoria} />
                  {template.padrao && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <Star size={9} className="fill-current" />
                      Padrão
                    </span>
                  )}
                </div>

                {/* Subject (email only) */}
                {template.tipo === 'EMAIL' && template.assunto && (
                  <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mb-2 truncate">
                    <span className="font-medium">Assunto:</span> {template.assunto}
                  </p>
                )}

                {/* Content preview */}
                <p className="text-xs text-[#6b5d57] dark:text-[#7A716A] line-clamp-2 leading-relaxed mb-3">
                  {template.conteudo.replace(/\*|_|~|{{|}}/g, '').slice(0, 120)}
                  {template.conteudo.length > 120 ? '...' : ''}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#d8ccc4]/50 dark:border-[#2D2925]/50">
                  <div className="flex items-center gap-3 text-[10px] text-[#6b5d57] dark:text-[#7A716A]">
                    <span>{template.variaveisDisponiveis.length} variáveis</span>
                    <span>{formatDate(template.dtCriacao)}</span>
                  </div>

                  {/* Actions */}
                  <div className="relative flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/templates/${template.id}`)}
                      className="p-1.5 rounded-md text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#db6f57] dark:hover:text-[#E07A62] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handlePreview(template)}
                      className="p-1.5 rounded-md text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#4f6f64] dark:hover:text-[#6B8F82] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
                      title="Preview"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === template.id ? null : template.id)}
                      className="p-1.5 rounded-md text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
                      title="Mais ações"
                    >
                      <MoreHorizontal size={14} />
                    </button>

                    {/* Dropdown menu */}
                    {openMenuId === template.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-[#1A1715] rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] shadow-lg py-1">
                          {!template.padrao && template.ativo && (
                            <button
                              onClick={() => {
                                setOpenMenuId(null)
                                setConfirmAction({ id: template.id, type: 'padrao', template })
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#2a2420] dark:text-[#F5F0EB] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
                            >
                              <Star size={13} />
                              Marcar como Padrão
                            </button>
                          )}
                          <button
                            onClick={() => handleCopyContent(template.conteudo)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#2a2420] dark:text-[#F5F0EB] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
                          >
                            <Copy size={13} />
                            Copiar conteúdo
                          </button>
                          <div className="border-t border-[#d8ccc4] dark:border-[#2D2925] my-1" />
                          <button
                            onClick={() => {
                              setOpenMenuId(null)
                              setConfirmAction({
                                id: template.id,
                                type: template.ativo ? 'desativar' : 'ativar',
                                template,
                              })
                            }}
                            className={cn(
                              'flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors',
                              template.ativo
                                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-[#4f6f64] dark:text-[#6B8F82] hover:bg-[#4f6f64]/10'
                            )}
                          >
                            {template.ativo ? <PowerOff size={13} /> : <Power size={13} />}
                            {template.ativo ? 'Desativar' : 'Ativar'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmAction(null)}>
          <Card className="w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                confirmAction.type === 'desativar' ? 'bg-red-100 dark:bg-red-900/30'
                  : confirmAction.type === 'padrao' ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-[#4f6f64]/15 dark:bg-[#6B8F82]/15'
              )}>
                {confirmAction.type === 'desativar' ? (
                  <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
                ) : confirmAction.type === 'padrao' ? (
                  <Star size={20} className="text-amber-600 dark:text-amber-400" />
                ) : (
                  <Power size={20} className="text-[#4f6f64] dark:text-[#6B8F82]" />
                )}
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
                  {confirmAction.type === 'desativar' ? 'Desativar template'
                    : confirmAction.type === 'padrao' ? 'Marcar como padrão'
                      : 'Ativar template'}
                </h3>
                <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                  {confirmAction.type === 'desativar'
                    ? `"${confirmAction.template.nome}" será desativado.`
                    : confirmAction.type === 'padrao'
                      ? `Isso vai desmarcar o padrão atual para ${TIPO_LABELS[confirmAction.template.tipo]} - ${CATEGORIA_LABELS[confirmAction.template.categoria]}.`
                      : `"${confirmAction.template.nome}" será reativado.`}
                </p>
              </div>
            </div>
            {confirmAction.type === 'desativar' && isSeedTemplate(confirmAction.template.codigo) && (
              <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs">
                <AlertTriangle size={14} />
                Este é um template seed essencial do sistema.
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setConfirmAction(null)}>Cancelar</Button>
              <Button
                variant={confirmAction.type === 'desativar' ? 'danger' : confirmAction.type === 'padrao' ? 'primary' : 'secondary'}
                onClick={handleConfirm}
                leftIcon={confirmAction.type === 'desativar' ? <X size={16} /> : confirmAction.type === 'padrao' ? <Star size={16} /> : <Check size={16} />}
              >
                {confirmAction.type === 'desativar' ? 'Desativar'
                  : confirmAction.type === 'padrao' ? 'Confirmar'
                    : 'Ativar'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreviewModal(null)}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#d8ccc4] dark:border-[#2D2925] shrink-0">
              <div>
                <h3 className="text-base font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Preview</h3>
                <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{previewModal.template.nome}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyContent(previewModal.content)}
                  leftIcon={<Copy size={14} />}
                >
                  Copiar
                </Button>
                <button onClick={() => setPreviewModal(null)} className="p-1.5 rounded-lg text-[#6b5d57] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {previewModal.template.tipo === 'WHATSAPP' ? (
                <WhatsAppPreview text={previewModal.content} />
              ) : (
                <EmailPreview html={previewModal.content} assunto={previewModal.template.assunto || undefined} />
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
