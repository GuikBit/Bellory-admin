import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTemplate, useCriarTemplate, useAtualizarTemplate } from '../../queries/useTemplates'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { WhatsAppPreview } from '../../components/templates/WhatsAppPreview'
import { EmailPreview } from '../../components/templates/EmailPreview'
import { VariavelChip } from '../../components/templates/VariavelChip'
import { VariaveisEditor } from '../../components/templates/VariaveisEditor'
import { cn } from '../../utils/cn'
import {
  ArrowLeft,
  Save,
  Eye,
  MessageSquare,
  Mail,
  Bell,
  KeyRound,
  Receipt,
  AlertTriangle,
  FileText,
  Shield,
  Star,
  type LucideIcon,
} from 'lucide-react'
import type {
  TipoTemplate,
  CategoriaTemplate,
  VariavelTemplate,
  TemplateBelloryCreate,
  TemplateBelloryUpdate,
} from '../../types/template'
import {
  TIPO_LABELS,
  CATEGORIA_LABELS,
  VARIAVEIS_SUGESTOES_WHATSAPP,
  VARIAVEIS_SUGESTOES_EMAIL,
} from '../../types/template'

const ICON_OPTIONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: 'MessageSquare', label: 'Mensagem', Icon: MessageSquare },
  { value: 'Bell', label: 'Sino', Icon: Bell },
  { value: 'Mail', label: 'E-mail', Icon: Mail },
  { value: 'KeyRound', label: 'Chave', Icon: KeyRound },
  { value: 'Receipt', label: 'Recibo', Icon: Receipt },
  { value: 'AlertTriangle', label: 'Alerta', Icon: AlertTriangle },
  { value: 'FileText', label: 'Documento', Icon: FileText },
  { value: 'Shield', label: 'Escudo', Icon: Shield },
  { value: 'Star', label: 'Estrela', Icon: Star },
]

const CATEGORIAS: CategoriaTemplate[] = ['CONFIRMACAO', 'LEMBRETE', 'BEM_VINDO', 'RESET_SENHA', 'COBRANCA_AVISO', 'COBRANCA_LEMBRETE']

function substituirVariaveis(conteudo: string, variaveis: VariavelTemplate[], tipo: TipoTemplate): string {
  let result = conteudo
  for (const v of variaveis) {
    if (tipo === 'WHATSAPP') {
      result = result.replace(new RegExp(`\\{\\{${v.nome}\\}\\}`, 'g'), v.exemplo)
    } else {
      result = result.replace(new RegExp(`\\$\\{${v.nome}\\}`, 'g'), v.exemplo)
    }
  }
  return result
}

export function TemplateForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'novo'
  const templateId = isEdit ? Number(id) : 0

  const { data: templateData, isLoading } = useTemplate(templateId)
  const criarTemplate = useCriarTemplate()
  const atualizarTemplate = useAtualizarTemplate()

  const conteudoRef = useRef<HTMLTextAreaElement>(null)

  // Form state
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<TipoTemplate>('WHATSAPP')
  const [categoria, setCategoria] = useState<CategoriaTemplate>('CONFIRMACAO')
  const [assunto, setAssunto] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [icone, setIcone] = useState('MessageSquare')
  const [variaveis, setVariaveis] = useState<VariavelTemplate[]>([])
  const [showPreview, setShowPreview] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (templateData) {
      setCodigo(templateData.codigo)
      setNome(templateData.nome)
      setDescricao(templateData.descricao || '')
      setTipo(templateData.tipo)
      setCategoria(templateData.categoria)
      setAssunto(templateData.assunto || '')
      setConteudo(templateData.conteudo)
      setIcone(templateData.icone || 'MessageSquare')
      setVariaveis(templateData.variaveisDisponiveis || [])
    }
  }, [templateData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!codigo.trim()) newErrors.codigo = 'Código é obrigatório'
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório'
    if (!conteudo.trim()) newErrors.conteudo = 'Conteúdo é obrigatório'
    if (tipo === 'EMAIL' && !assunto.trim()) newErrors.assunto = 'Assunto é obrigatório para e-mail'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const payload = {
      codigo: codigo.trim().toLowerCase(),
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      tipo,
      categoria,
      assunto: tipo === 'EMAIL' ? assunto.trim() : undefined,
      conteudo: conteudo.trim(),
      variaveisDisponiveis: variaveis.length > 0 ? variaveis : undefined,
      icone: icone || undefined,
    }

    if (isEdit) {
      atualizarTemplate.mutate(
        { id: templateId, data: payload as TemplateBelloryUpdate },
        { onSuccess: () => navigate('/templates') }
      )
    } else {
      criarTemplate.mutate(
        payload as TemplateBelloryCreate,
        { onSuccess: () => navigate('/templates') }
      )
    }
  }

  const insertVariable = (placeholder: string) => {
    const textarea = conteudoRef.current
    if (!textarea) {
      setConteudo((prev) => prev + placeholder)
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = conteudo.slice(0, start) + placeholder + conteudo.slice(end)
    setConteudo(newValue)
    // Restore cursor after the inserted placeholder
    requestAnimationFrame(() => {
      textarea.focus()
      const pos = start + placeholder.length
      textarea.setSelectionRange(pos, pos)
    })
  }

  const previewContent = substituirVariaveis(conteudo, variaveis, tipo)
  const sugestoes = tipo === 'WHATSAPP' ? VARIAVEIS_SUGESTOES_WHATSAPP : VARIAVEIS_SUGESTOES_EMAIL
  const isSaving = criarTemplate.isPending || atualizarTemplate.isPending

  if (isEdit && isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/templates')}
            className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
              {isEdit ? 'Editar Template' : 'Novo Template'}
            </h1>
            <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">
              {isEdit ? `Editando "${templateData?.nome || ''}"` : 'Preencha os dados para criar um novo template'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            leftIcon={<Eye size={16} />}
            className="hidden xl:inline-flex"
          >
            {showPreview ? 'Ocultar' : 'Preview'}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/templates')}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSaving}
            leftIcon={<Save size={16} />}
          >
            {isEdit ? 'Salvar' : 'Criar Template'}
          </Button>
        </div>
      </div>

      <div className={cn('grid grid-cols-1 gap-5', showPreview && 'xl:grid-cols-3')}>
        {/* Form */}
        <div className={cn('space-y-5', showPreview ? 'xl:col-span-2' : '')}>
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Informações Básicas</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Código"
                  placeholder="ex: whatsapp-confirmacao-v2"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  error={errors.codigo}
                />
                <Input
                  label="Nome"
                  placeholder="ex: Confirmação de Agendamento V2"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  error={errors.nome}
                />

                <div>
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Tipo</label>
                  <div className="flex gap-2">
                    {(['WHATSAPP', 'EMAIL'] as TipoTemplate[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTipo(t)}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium transition-all duration-200',
                          tipo === t
                            ? t === 'WHATSAPP'
                              ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400'
                              : 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'border-[#d8ccc4] dark:border-[#2D2925] text-[#6b5d57] dark:text-[#B8AEA4] hover:border-[#db6f57]/50 dark:hover:border-[#E07A62]/50'
                        )}
                      >
                        {t === 'WHATSAPP' ? <MessageSquare size={16} /> : <Mail size={16} />}
                        {TIPO_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaTemplate)}
                    className="w-full h-10 px-3 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62]"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>{CATEGORIA_LABELS[cat]}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Descrição interna</label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descrição interna do template (não aparece na mensagem)..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] placeholder:text-[#6b5d57]/50 dark:placeholder:text-[#7A716A] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62] focus:ring-2 focus:ring-[#db6f57]/20 dark:focus:ring-[#E07A62]/20 resize-none transition-colors"
                  />
                </div>

                {/* Icon selector */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-2">Ícone</label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setIcone(opt.value)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-200',
                          icone === opt.value
                            ? 'border-[#db6f57] bg-[#db6f57]/10 text-[#db6f57] dark:border-[#E07A62] dark:bg-[#E07A62]/10 dark:text-[#E07A62]'
                            : 'border-[#d8ccc4] dark:border-[#2D2925] text-[#6b5d57] dark:text-[#B8AEA4] hover:border-[#db6f57]/50 dark:hover:border-[#E07A62]/50'
                        )}
                        title={opt.label}
                      >
                        <opt.Icon size={16} />
                        <span className="hidden sm:inline text-xs">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Conteúdo da Mensagem</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Assunto (email only) */}
                {tipo === 'EMAIL' && (
                  <Input
                    label="Assunto do E-mail"
                    placeholder="ex: Confirmação de agendamento - Bellory"
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                    error={errors.assunto}
                  />
                )}

                {/* Conteúdo */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">
                      {tipo === 'WHATSAPP' ? 'Mensagem WhatsApp' : 'Conteúdo HTML do E-mail'}
                    </label>
                    {tipo === 'WHATSAPP' && (
                      <div className="flex items-center gap-2 text-[10px] text-[#6b5d57] dark:text-[#7A716A]">
                        <span><strong>*bold*</strong></span>
                        <span><em>_italic_</em></span>
                        <span><del>~riscado~</del></span>
                      </div>
                    )}
                  </div>
                  <textarea
                    ref={conteudoRef}
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    placeholder={tipo === 'WHATSAPP'
                      ? 'Olá *{{nome_cliente}}*! 👋\n\nSeu agendamento está confirmado...'
                      : '<html>\n<body>\n  <h1>Olá ${nomeCliente}</h1>\n</body>\n</html>'
                    }
                    rows={tipo === 'EMAIL' ? 14 : 10}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg border bg-white text-sm transition-colors resize-y',
                      'border-[#d8ccc4] dark:border-[#2D2925] dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB]',
                      'placeholder:text-[#6b5d57]/50 dark:placeholder:text-[#7A716A]',
                      'focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62] focus:ring-2 focus:ring-[#db6f57]/20 dark:focus:ring-[#E07A62]/20',
                      tipo === 'EMAIL' && 'font-mono text-xs',
                      errors.conteudo && 'border-red-500 dark:border-red-500'
                    )}
                  />
                  {errors.conteudo && (
                    <p className="mt-1 text-xs text-red-500">{errors.conteudo}</p>
                  )}
                </div>

                {/* Variable chips */}
                {variaveis.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] mb-2">
                      Clique para inserir no conteúdo:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {variaveis.map((v, i) => (
                        <VariavelChip
                          key={i}
                          variavel={v}
                          tipoTemplate={tipo}
                          onClick={insertVariable}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Variáveis */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Variáveis Disponíveis</h2>
            </CardHeader>
            <CardContent>
              <VariaveisEditor
                value={variaveis}
                onChange={setVariaveis}
                sugestoes={sugestoes}
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="xl:sticky xl:top-20 xl:self-start space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#6b5d57] dark:text-[#7A716A]" />
                  <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Preview ao Vivo</h2>
                </div>
              </CardHeader>
              <CardContent>
                {conteudo ? (
                  tipo === 'WHATSAPP' ? (
                    <WhatsAppPreview text={previewContent} />
                  ) : (
                    <EmailPreview html={previewContent} assunto={assunto || undefined} />
                  )
                ) : (
                  <div className="text-center py-12 text-[#6b5d57] dark:text-[#7A716A]">
                    <Eye size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Digite o conteúdo para ver o preview</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info panel (edit mode) */}
            {isEdit && templateData && (
              <Card className="p-4">
                <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider mb-2">Informações</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6b5d57] dark:text-[#7A716A]">Status</span>
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
                      templateData.ativo
                        ? 'bg-[#4f6f64]/15 text-[#4f6f64] dark:bg-[#6B8F82]/15 dark:text-[#6B8F82]'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}>
                      {templateData.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b5d57] dark:text-[#7A716A]">Padrão</span>
                    <span className="text-[#2a2420] dark:text-[#F5F0EB]">{templateData.padrao ? 'Sim' : 'Não'}</span>
                  </div>
                  {templateData.dtCriacao && (
                    <div className="flex justify-between">
                      <span className="text-[#6b5d57] dark:text-[#7A716A]">Criado em</span>
                      <span className="text-[#2a2420] dark:text-[#F5F0EB]">
                        {new Date(templateData.dtCriacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {templateData.dtAtualizacao && (
                    <div className="flex justify-between">
                      <span className="text-[#6b5d57] dark:text-[#7A716A]">Atualizado em</span>
                      <span className="text-[#2a2420] dark:text-[#F5F0EB]">
                        {new Date(templateData.dtAtualizacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
