import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlano, useCriarPlano, useAtualizarPlano } from '../../queries/usePlanos'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { cn } from '../../utils/cn'
import { formatCurrency } from '../../utils/format'
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Check,
  GripVertical,
  Eye,
  Star,
  Gift,
  Zap,
  Sparkles,
  Crown,
  Rocket,
  Heart,
  Shield,
  Gem,
  CreditCard,
  ChevronUp,
  ChevronDown,
  Infinity,
} from 'lucide-react'
import type { PlanoFeature, PlanoLimites, PlanoBelloryCreate, PlanoBelloryUpdate } from '../../types/plano'

const ICON_OPTIONS = [
  { value: 'Gift', label: 'Presente', Icon: Gift },
  { value: 'Zap', label: 'Raio', Icon: Zap },
  { value: 'Sparkles', label: 'Brilhos', Icon: Sparkles },
  { value: 'Crown', label: 'Coroa', Icon: Crown },
  { value: 'Star', label: 'Estrela', Icon: Star },
  { value: 'Rocket', label: 'Foguete', Icon: Rocket },
  { value: 'Heart', label: 'Coração', Icon: Heart },
  { value: 'Shield', label: 'Escudo', Icon: Shield },
  { value: 'Gem', label: 'Diamante', Icon: Gem },
  { value: 'CreditCard', label: 'Cartão', Icon: CreditCard },
]

const DEFAULT_LIMITES: PlanoLimites = {
  maxAgendamentosMes: null,
  maxUsuarios: null,
  maxClientes: null,
  maxServicos: null,
  maxUnidades: null,
  permiteAgendamentoOnline: false,
  permiteWhatsapp: false,
  permiteSite: false,
  permiteEcommerce: false,
  permiteRelatoriosAvancados: false,
  permiteApi: false,
  permiteIntegracaoPersonalizada: false,
  suportePrioritario: false,
  suporte24x7: false,
}

interface NumericLimitField {
  key: keyof Pick<PlanoLimites, 'maxAgendamentosMes' | 'maxUsuarios' | 'maxClientes' | 'maxServicos' | 'maxUnidades'>
  label: string
}

interface BooleanLimitField {
  key: keyof Omit<PlanoLimites, 'maxAgendamentosMes' | 'maxUsuarios' | 'maxClientes' | 'maxServicos' | 'maxUnidades'>
  label: string
}

const NUMERIC_LIMITS: NumericLimitField[] = [
  { key: 'maxAgendamentosMes', label: 'Agendamentos/mês' },
  { key: 'maxUsuarios', label: 'Usuários' },
  { key: 'maxClientes', label: 'Clientes' },
  { key: 'maxServicos', label: 'Serviços' },
  { key: 'maxUnidades', label: 'Unidades' },
]

const BOOLEAN_LIMITS: BooleanLimitField[] = [
  { key: 'permiteAgendamentoOnline', label: 'Agendamento Online' },
  { key: 'permiteWhatsapp', label: 'WhatsApp' },
  { key: 'permiteSite', label: 'Site Próprio' },
  { key: 'permiteEcommerce', label: 'E-commerce' },
  { key: 'permiteRelatoriosAvancados', label: 'Relatórios Avançados' },
  { key: 'permiteApi', label: 'API' },
  { key: 'permiteIntegracaoPersonalizada', label: 'Integração Personalizada' },
  { key: 'suportePrioritario', label: 'Suporte Prioritário' },
  { key: 'suporte24x7', label: 'Suporte 24/7' },
]

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative w-10 h-[22px] rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#db6f57]/30',
        checked
          ? 'bg-[#4f6f64] dark:bg-[#6B8F82]'
          : 'bg-[#d8ccc4] dark:bg-[#2D2925]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200',
          checked && 'translate-x-[18px]'
        )}
      />
    </button>
  )
}

export function PlanoForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'novo'
  const planoId = isEdit ? Number(id) : 0

  const { data: planoData, isLoading: isLoadingPlano } = usePlano(planoId)
  const criarPlano = useCriarPlano()
  const atualizarPlano = useAtualizarPlano()

  // Form state
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [tagline, setTagline] = useState('')
  const [descricaoCompleta, setDescricaoCompleta] = useState('')
  const [precoMensal, setPrecoMensal] = useState('')
  const [precoAnual, setPrecoAnual] = useState('')
  const [descontoPercentualAnual, setDescontoPercentualAnual] = useState('')
  const [popular, setPopular] = useState(false)
  const [cta, setCta] = useState('')
  const [badgeText, setBadgeText] = useState('')
  const [icone, setIcone] = useState('Gift')
  const [cor, setCor] = useState('#6b7280')
  const [gradiente, setGradiente] = useState('')
  const [ordemExibicao, setOrdemExibicao] = useState('')
  const [features, setFeatures] = useState<PlanoFeature[]>([])
  const [limites, setLimites] = useState<PlanoLimites>({ ...DEFAULT_LIMITES })
  const [showPreview, setShowPreview] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cálculo automático de preços
  const handlePrecoMensalChange = (value: string) => {
    setPrecoMensal(value)
    const mensal = Number(value)
    const desconto = Number(descontoPercentualAnual)
    if (mensal > 0 && desconto > 0) {
      const anualCalculado = mensal * 12 * (1 - desconto / 100)
      setPrecoAnual(anualCalculado.toFixed(2))
    }
  }

  const handlePrecoAnualChange = (value: string) => {
    setPrecoAnual(value)
    const mensal = Number(precoMensal)
    const anual = Number(value)
    if (mensal > 0 && anual >= 0) {
      const totalSemDesconto = mensal * 12
      if (totalSemDesconto > 0) {
        const desconto = ((totalSemDesconto - anual) / totalSemDesconto) * 100
        setDescontoPercentualAnual(desconto > 0 ? desconto.toFixed(1) : '')
      }
    }
  }

  const handleDescontoChange = (value: string) => {
    setDescontoPercentualAnual(value)
    const mensal = Number(precoMensal)
    const desconto = Number(value)
    if (mensal > 0 && desconto >= 0) {
      const anualCalculado = mensal * 12 * (1 - desconto / 100)
      setPrecoAnual(anualCalculado.toFixed(2))
    }
  }

  // Load data in edit mode
  useEffect(() => {
    if (planoData) {
      setCodigo(planoData.codigo)
      setNome(planoData.nome)
      setTagline(planoData.tagline || '')
      setDescricaoCompleta(planoData.descricaoCompleta || '')
      setPrecoMensal(planoData.precoMensal.toString())
      setPrecoAnual(planoData.precoAnual.toString())
      setDescontoPercentualAnual(planoData.descontoPercentualAnual?.toString() || '')
      setPopular(planoData.popular)
      setCta(planoData.cta || '')
      setBadgeText(planoData.badge || '')
      setIcone(planoData.icone || 'Gift')
      setCor(planoData.cor || '#6b7280')
      setGradiente(planoData.gradiente || '')
      setOrdemExibicao(planoData.ordemExibicao?.toString() || '')
      setFeatures(planoData.features || [])
      setLimites(planoData.limites || { ...DEFAULT_LIMITES })
    }
  }, [planoData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!codigo.trim()) newErrors.codigo = 'Código é obrigatório'
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório'
    if (precoMensal === '' || Number(precoMensal) < 0) newErrors.precoMensal = 'Preço mensal inválido'
    if (precoAnual === '' || Number(precoAnual) < 0) newErrors.precoAnual = 'Preço anual inválido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const payload = {
      codigo: codigo.trim().toLowerCase(),
      nome: nome.trim(),
      tagline: tagline.trim() || undefined,
      descricaoCompleta: descricaoCompleta.trim() || undefined,
      popular,
      cta: cta.trim() || undefined,
      badge: badgeText.trim() || undefined,
      icone: icone || undefined,
      cor: cor || undefined,
      gradiente: gradiente.trim() || undefined,
      precoMensal: Number(precoMensal),
      precoAnual: Number(precoAnual),
      descontoPercentualAnual: descontoPercentualAnual ? Math.round(Number(descontoPercentualAnual)) : undefined,
      features: features.length > 0 ? features : undefined,
      ordemExibicao: ordemExibicao ? Number(ordemExibicao) : undefined,
      limites,
    }

    if (isEdit) {
      atualizarPlano.mutate(
        { id: planoId, data: payload as PlanoBelloryUpdate },
        { onSuccess: () => navigate('/planos') }
      )
    } else {
      criarPlano.mutate(
        payload as PlanoBelloryCreate,
        { onSuccess: () => navigate('/planos') }
      )
    }
  }

  // Feature handlers
  const addFeature = () => setFeatures([...features, { text: '', included: true }])
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index))
  const updateFeature = (index: number, field: keyof PlanoFeature, value: string | boolean) => {
    const updated = [...features]
    updated[index] = { ...updated[index], [field]: value }
    setFeatures(updated)
  }
  const moveFeature = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= features.length) return
    const updated = [...features]
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setFeatures(updated)
  }

  // Limites handlers
  const updateNumericLimit = (key: NumericLimitField['key'], value: number | null) => {
    setLimites({ ...limites, [key]: value })
  }
  const updateBooleanLimit = (key: BooleanLimitField['key'], value: boolean) => {
    setLimites({ ...limites, [key]: value })
  }

  const isSaving = criarPlano.isPending || atualizarPlano.isPending

  if (isEdit && isLoadingPlano) {
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

  const SelectedIcon = ICON_OPTIONS.find((o) => o.value === icone)?.Icon || Gift

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/planos')}
            className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
              {isEdit ? 'Editar Plano' : 'Novo Plano'}
            </h1>
            <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">
              {isEdit ? `Editando "${planoData?.nome || ''}"` : 'Preencha os dados para criar um novo plano'}
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
          <Button variant="ghost" onClick={() => navigate('/planos')}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSaving}
            leftIcon={<Save size={16} />}
          >
            {isEdit ? 'Salvar' : 'Criar Plano'}
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
                  placeholder="ex: basico"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  error={errors.codigo}
                />
                <Input
                  label="Nome"
                  placeholder="ex: Básico"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  error={errors.nome}
                />
                <Input
                  label="Tagline"
                  placeholder="ex: Experimente sem compromisso"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
                <Input
                  label="Ordem de Exibição"
                  type="number"
                  placeholder="ex: 1"
                  value={ordemExibicao}
                  onChange={(e) => setOrdemExibicao(e.target.value)}
                />
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Descrição completa</label>
                  <textarea
                    value={descricaoCompleta}
                    onChange={(e) => setDescricaoCompleta(e.target.value)}
                    placeholder="Descrição detalhada do plano..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] placeholder:text-[#6b5d57]/50 dark:placeholder:text-[#7A716A] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62] focus:ring-2 focus:ring-[#db6f57]/20 dark:focus:ring-[#E07A62]/20 resize-none transition-colors"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preços */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Preços</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="Preço Mensal (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={precoMensal}
                  onChange={(e) => handlePrecoMensalChange(e.target.value)}
                  error={errors.precoMensal}
                />
                <Input
                  label="Preço Anual (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={precoAnual}
                  onChange={(e) => handlePrecoAnualChange(e.target.value)}
                  error={errors.precoAnual}
                />
                <Input
                  label="Desconto Anual (%)"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  placeholder="ex: 20"
                  value={descontoPercentualAnual}
                  onChange={(e) => handleDescontoChange(e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Mensal do Anual (R$)</label>
                  <div className="h-10 px-3 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-[#faf8f6] dark:bg-[#0D0B0A] flex items-center">
                    <span className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">
                      {Number(precoAnual) > 0 ? formatCurrency(Number(precoAnual) / 12) : '—'}
                    </span>
                    {Number(precoAnual) > 0 && Number(precoMensal) > 0 && (
                      <span className="ml-1.5 text-xs text-[#4f6f64] dark:text-[#6B8F82]">/mês</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual/UI */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Visual e Aparência</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">Plano Popular</p>
                    <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">Destaca este plano como o mais popular</p>
                  </div>
                  <Toggle checked={popular} onChange={setPopular} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Call-to-Action (CTA)"
                    placeholder="ex: Começar grátis"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                  />
                  <Input
                    label="Badge"
                    placeholder="ex: Mais popular"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                  />
                </div>

                {/* Icon selector */}
                <div>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Cor do Plano</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={cor}
                        onChange={(e) => setCor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] cursor-pointer bg-transparent"
                      />
                      <Input
                        value={cor}
                        onChange={(e) => setCor(e.target.value)}
                        placeholder="#6b7280"
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <Input
                    label="Gradiente (classes Tailwind)"
                    placeholder="ex: from-[#4f6f64] to-[#3d574f]"
                    value={gradiente}
                    onChange={(e) => setGradiente(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
                  Features ({features.length})
                </h2>
                <Button size="sm" variant="outline" onClick={addFeature} leftIcon={<Plus size={14} />}>
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {features.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[#6b5d57] dark:text-[#7A716A] mb-3">Nenhuma feature adicionada</p>
                  <Button size="sm" variant="outline" onClick={addFeature} leftIcon={<Plus size={14} />}>
                    Adicionar primeira feature
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 group"
                    >
                      {/* Reorder buttons */}
                      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveFeature(index, 'up')}
                          disabled={index === 0}
                          className="p-0.5 text-[#6b5d57] dark:text-[#7A716A] disabled:opacity-30"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFeature(index, 'down')}
                          disabled={index === features.length - 1}
                          className="p-0.5 text-[#6b5d57] dark:text-[#7A716A] disabled:opacity-30"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>

                      {/* Toggle included */}
                      <button
                        type="button"
                        onClick={() => updateFeature(index, 'included', !feature.included)}
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors',
                          feature.included
                            ? 'bg-[#4f6f64]/15 text-[#4f6f64] dark:bg-[#6B8F82]/15 dark:text-[#6B8F82]'
                            : 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400'
                        )}
                      >
                        {feature.included ? <Check size={14} /> : <X size={14} />}
                      </button>

                      {/* Feature text */}
                      <input
                        type="text"
                        value={feature.text}
                        onChange={(e) => updateFeature(index, 'text', e.target.value)}
                        placeholder="Descreva a feature..."
                        className="flex-1 h-9 px-3 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm placeholder:text-[#6b5d57]/50 dark:placeholder:text-[#7A716A] focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62] transition-colors"
                      />

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-1.5 rounded-lg text-[#6b5d57] dark:text-[#7A716A] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Limites */}
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Limites do Plano</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Numeric limits */}
                <div>
                  <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider mb-3">Limites numéricos</p>
                  <div className="space-y-3">
                    {NUMERIC_LIMITS.map((field) => {
                      const value = limites[field.key]
                      const isUnlimited = value === null
                      return (
                        <div key={field.key} className="flex items-center gap-3">
                          <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB] w-40 shrink-0">{field.label}</span>
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="number"
                              min="0"
                              value={isUnlimited ? '' : value}
                              onChange={(e) => updateNumericLimit(field.key, e.target.value ? Number(e.target.value) : null)}
                              disabled={isUnlimited}
                              placeholder={isUnlimited ? 'Ilimitado' : '0'}
                              className={cn(
                                'w-28 h-9 px-3 rounded-lg border text-sm transition-colors',
                                'border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB]',
                                'placeholder:text-[#6b5d57]/50 dark:placeholder:text-[#7A716A]',
                                'focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62]',
                                isUnlimited && 'opacity-50'
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => updateNumericLimit(field.key, isUnlimited ? 0 : null)}
                              className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                                isUnlimited
                                  ? 'bg-[#4f6f64]/10 text-[#4f6f64] border-[#4f6f64]/20 dark:bg-[#6B8F82]/10 dark:text-[#6B8F82] dark:border-[#6B8F82]/20'
                                  : 'text-[#6b5d57] border-[#d8ccc4] dark:text-[#7A716A] dark:border-[#2D2925] hover:border-[#4f6f64]/50'
                              )}
                            >
                              <Infinity size={12} />
                              Ilimitado
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Boolean limits */}
                <div>
                  <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider mb-3">Permissões e funcionalidades</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BOOLEAN_LIMITS.map((field) => (
                      <div
                        key={field.key}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-[#d8ccc4]/50 dark:border-[#2D2925]/50"
                      >
                        <span className="text-sm text-[#2a2420] dark:text-[#F5F0EB]">{field.label}</span>
                        <Toggle
                          checked={limites[field.key] as boolean}
                          onChange={(v) => updateBooleanLimit(field.key, v)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                  <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Preview do Card</h2>
                </div>
              </CardHeader>
              <CardContent>
                {/* Plan card preview */}
                <div
                  className={cn(
                    'relative rounded-xl border-2 p-5 transition-all',
                    popular
                      ? 'border-current shadow-lg'
                      : 'border-[#d8ccc4] dark:border-[#2D2925]'
                  )}
                  style={popular ? { borderColor: cor, boxShadow: `0 8px 32px ${cor}20` } : undefined}
                >
                  {/* Badge */}
                  {badgeText && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold text-white whitespace-nowrap"
                      style={{ backgroundColor: cor }}
                    >
                      {badgeText}
                    </div>
                  )}

                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-3 mt-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cor}15`, color: cor }}
                    >
                      <SelectedIcon size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#2a2420] dark:text-[#F5F0EB]">
                        {nome || 'Nome do Plano'}
                      </h3>
                      {tagline && (
                        <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{tagline}</p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">
                        {formatCurrency(Number(precoMensal) || 0)}
                      </span>
                      <span className="text-sm text-[#6b5d57] dark:text-[#7A716A]">/mês</span>
                    </div>
                    {Number(precoAnual) > 0 && (
                      <p className="text-xs text-[#6b5d57] dark:text-[#7A716A] mt-0.5">
                        ou {formatCurrency(Number(precoAnual) || 0)}/ano
                        {descontoPercentualAnual && (
                          <span className="ml-1 text-[#4f6f64] dark:text-[#6B8F82] font-medium">(-{descontoPercentualAnual}%)</span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  {features.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {f.included ? (
                            <Check size={14} className="text-[#4f6f64] dark:text-[#6B8F82] shrink-0" />
                          ) : (
                            <X size={14} className="text-[#d8ccc4] dark:text-[#2D2925] shrink-0" />
                          )}
                          <span className={cn(
                            f.included
                              ? 'text-[#2a2420] dark:text-[#F5F0EB]'
                              : 'text-[#6b5d57]/50 dark:text-[#7A716A]/50 line-through'
                          )}>
                            {f.text || 'Feature...'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                    style={{ backgroundColor: cor }}
                  >
                    {cta || 'Assinar agora'}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Quick info */}
            {isEdit && planoData && (
              <Card className="p-4">
                <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider mb-2">Informações</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6b5d57] dark:text-[#7A716A]">Organizações usando</span>
                    <Badge variant={planoData.totalOrganizacoesUsando > 0 ? 'plan' : 'default'}>
                      {planoData.totalOrganizacoesUsando}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b5d57] dark:text-[#7A716A]">Status</span>
                    <Badge variant={planoData.ativo ? 'success' : 'danger'}>
                      {planoData.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  {planoData.dtCriacao && (
                    <div className="flex justify-between">
                      <span className="text-[#6b5d57] dark:text-[#7A716A]">Criado em</span>
                      <span className="text-[#2a2420] dark:text-[#F5F0EB]">
                        {new Date(planoData.dtCriacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {planoData.dtAtualizacao && (
                    <div className="flex justify-between">
                      <span className="text-[#6b5d57] dark:text-[#7A716A]">Atualizado em</span>
                      <span className="text-[#2a2420] dark:text-[#F5F0EB]">
                        {new Date(planoData.dtAtualizacao).toLocaleDateString('pt-BR')}
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
