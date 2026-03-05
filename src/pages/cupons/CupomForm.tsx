import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCupom, useCriarCupom, useAtualizarCupom } from '../../queries/useCupom'
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
  X,
  Percent,
  DollarSign,
  Calendar,
  Ticket,
  Users,
  Building2,
  Tag,
  Repeat,
} from 'lucide-react'
import type { TipoDesconto, CicloCobranca, TipoAplicacao, CupomDescontoCreate, CupomDescontoUpdate } from '../../types/cupom'

const PLANOS_DISPONIVEIS = ['basico', 'plus', 'premium']
const SEGMENTOS_DISPONIVEIS = [
  'Barbearia',
  'Salao de Beleza',
  'Clinica de Estetica',
  'Studio de Sobrancelhas',
  'Studio de Cilios',
  'Manicure e Pedicure',
  'Studio de Tatuagem',
  'Outro',
]

export function CupomForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'novo'
  const cupomId = isEdit ? Number(id) : 0

  const { data: cupomData, isLoading: isLoadingCupom } = useCupom(cupomId)
  const criarCupom = useCriarCupom()
  const atualizarCupom = useAtualizarCupom()

  // Form state
  const [codigo, setCodigo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tipoDesconto, setTipoDesconto] = useState<TipoDesconto>('PERCENTUAL')
  const [valorDesconto, setValorDesconto] = useState('')
  const [dtInicio, setDtInicio] = useState('')
  const [dtFim, setDtFim] = useState('')
  const [maxUtilizacoes, setMaxUtilizacoes] = useState('')
  const [maxUtilizacoesPorOrg, setMaxUtilizacoesPorOrg] = useState('')
  const [planosPermitidos, setPlanosPermitidos] = useState<string[]>([])
  const [segmentosPermitidos, setSegmentosPermitidos] = useState<string[]>([])
  const [organizacoesPermitidas, setOrganizacoesPermitidas] = useState('')
  const [cicloCobranca, setCicloCobranca] = useState<CicloCobranca | ''>('')
  const [tipoAplicacao, setTipoAplicacao] = useState<TipoAplicacao>('PRIMEIRA_COBRANCA')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load data in edit mode
  useEffect(() => {
    if (cupomData) {
      setCodigo(cupomData.codigo)
      setDescricao(cupomData.descricao || '')
      setTipoDesconto(cupomData.tipoDesconto)
      setValorDesconto(cupomData.valorDesconto.toString())
      setDtInicio(cupomData.dtInicio ? cupomData.dtInicio.slice(0, 16) : '')
      setDtFim(cupomData.dtFim ? cupomData.dtFim.slice(0, 16) : '')
      setMaxUtilizacoes(cupomData.maxUtilizacoes?.toString() || '')
      setMaxUtilizacoesPorOrg(cupomData.maxUtilizacoesPorOrg?.toString() || '')
      setPlanosPermitidos(cupomData.planosPermitidos || [])
      setSegmentosPermitidos(cupomData.segmentosPermitidos || [])
      setOrganizacoesPermitidas(cupomData.organizacoesPermitidas?.join(', ') || '')
      setCicloCobranca((cupomData.cicloCobranca as CicloCobranca) || '')
      setTipoAplicacao((cupomData.tipoAplicacao as TipoAplicacao) || 'PRIMEIRA_COBRANCA')
    }
  }, [cupomData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!codigo.trim()) newErrors.codigo = 'Codigo e obrigatorio'
    if (codigo.trim().length > 50) newErrors.codigo = 'Maximo 50 caracteres'
    if (!valorDesconto || Number(valorDesconto) <= 0) newErrors.valorDesconto = 'Valor deve ser positivo'
    if (tipoDesconto === 'PERCENTUAL' && Number(valorDesconto) > 100) newErrors.valorDesconto = 'Maximo 100%'
    if (descricao.length > 255) newErrors.descricao = 'Maximo 255 caracteres'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const parseOrgIds = (str: string): number[] | undefined => {
      if (!str.trim()) return undefined
      const ids = str.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n) && n > 0)
      return ids.length > 0 ? ids : undefined
    }

    if (isEdit) {
      const payload: CupomDescontoUpdate = {
        codigo: codigo.trim().toUpperCase(),
        descricao: descricao.trim() || undefined,
        tipoDesconto,
        valorDesconto: Number(valorDesconto),
        dtInicio: dtInicio || undefined,
        dtFim: dtFim || undefined,
        maxUtilizacoes: maxUtilizacoes ? Number(maxUtilizacoes) : undefined,
        maxUtilizacoesPorOrg: maxUtilizacoesPorOrg ? Number(maxUtilizacoesPorOrg) : undefined,
        planosPermitidos: planosPermitidos.length > 0 ? planosPermitidos : undefined,
        segmentosPermitidos: segmentosPermitidos.length > 0 ? segmentosPermitidos : undefined,
        organizacoesPermitidas: parseOrgIds(organizacoesPermitidas),
        cicloCobranca: cicloCobranca ? (cicloCobranca as CicloCobranca) : undefined,
        tipoAplicacao,
      }
      atualizarCupom.mutate(
        { id: cupomId, dto: payload },
        { onSuccess: () => navigate('/cupons') }
      )
    } else {
      const payload: CupomDescontoCreate = {
        codigo: codigo.trim().toUpperCase(),
        descricao: descricao.trim() || undefined,
        tipoDesconto,
        valorDesconto: Number(valorDesconto),
        dtInicio: dtInicio || undefined,
        dtFim: dtFim || undefined,
        maxUtilizacoes: maxUtilizacoes ? Number(maxUtilizacoes) : undefined,
        maxUtilizacoesPorOrg: maxUtilizacoesPorOrg ? Number(maxUtilizacoesPorOrg) : undefined,
        planosPermitidos: planosPermitidos.length > 0 ? planosPermitidos : undefined,
        segmentosPermitidos: segmentosPermitidos.length > 0 ? segmentosPermitidos : undefined,
        organizacoesPermitidas: parseOrgIds(organizacoesPermitidas),
        cicloCobranca: cicloCobranca ? (cicloCobranca as CicloCobranca) : undefined,
        tipoAplicacao,
      }
      criarCupom.mutate(payload, { onSuccess: () => navigate('/cupons') })
    }
  }

  const togglePlano = (plano: string) => {
    setPlanosPermitidos((prev) =>
      prev.includes(plano) ? prev.filter((p) => p !== plano) : [...prev, plano]
    )
  }

  const toggleSegmento = (segmento: string) => {
    setSegmentosPermitidos((prev) =>
      prev.includes(segmento) ? prev.filter((s) => s !== segmento) : [...prev, segmento]
    )
  }

  const isSaving = criarCupom.isPending || atualizarCupom.isPending

  if (isEdit && isLoadingCupom) {
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
            onClick={() => navigate('/cupons')}
            className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
              {isEdit ? 'Editar Cupom' : 'Novo Cupom de Desconto'}
            </h1>
            <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">
              {isEdit ? `Editando "${cupomData?.codigo || ''}"` : 'Preencha os dados para criar um novo cupom'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/cupons')}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSaving}
            leftIcon={<Save size={16} />}
          >
            {isEdit ? 'Salvar' : 'Criar Cupom'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Form */}
        <div className="xl:col-span-2 space-y-5">
          {/* Informacoes Basicas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Ticket size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
                <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Informacoes Basicas</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Codigo *"
                  placeholder="ex: BEMVINDO50"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                  error={errors.codigo}
                  maxLength={50}
                />
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Descricao</label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descricao interna do cupom..."
                    rows={2}
                    maxLength={255}
                    className="w-full px-3 py-2 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] placeholder:text-[#6b5d57]/50 dark:placeholder:text-[#7A716A] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62] focus:ring-2 focus:ring-[#db6f57]/20 dark:focus:ring-[#E07A62]/20 resize-none transition-colors"
                  />
                  {errors.descricao && <p className="mt-1 text-xs text-red-500">{errors.descricao}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Desconto */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[#4f6f64] dark:text-[#6B8F82]" />
                <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Desconto</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Tipo desconto */}
                <div>
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-2">Tipo de desconto *</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoDesconto('PERCENTUAL')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200',
                        tipoDesconto === 'PERCENTUAL'
                          ? 'border-[#db6f57] bg-[#db6f57]/10 text-[#db6f57] dark:border-[#E07A62] dark:bg-[#E07A62]/10 dark:text-[#E07A62]'
                          : 'border-[#d8ccc4] dark:border-[#2D2925] text-[#6b5d57] dark:text-[#B8AEA4] hover:border-[#db6f57]/50 dark:hover:border-[#E07A62]/50'
                      )}
                    >
                      <Percent size={16} />
                      Percentual
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoDesconto('VALOR_FIXO')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200',
                        tipoDesconto === 'VALOR_FIXO'
                          ? 'border-[#db6f57] bg-[#db6f57]/10 text-[#db6f57] dark:border-[#E07A62] dark:bg-[#E07A62]/10 dark:text-[#E07A62]'
                          : 'border-[#d8ccc4] dark:border-[#2D2925] text-[#6b5d57] dark:text-[#B8AEA4] hover:border-[#db6f57]/50 dark:hover:border-[#E07A62]/50'
                      )}
                    >
                      <DollarSign size={16} />
                      Valor Fixo
                    </button>
                  </div>
                </div>

                <Input
                  label={`Valor do desconto * ${tipoDesconto === 'PERCENTUAL' ? '(%)' : '(R$)'}`}
                  type="number"
                  step={tipoDesconto === 'PERCENTUAL' ? '1' : '0.01'}
                  min="0"
                  max={tipoDesconto === 'PERCENTUAL' ? '100' : undefined}
                  placeholder={tipoDesconto === 'PERCENTUAL' ? 'ex: 50' : 'ex: 30.00'}
                  value={valorDesconto}
                  onChange={(e) => setValorDesconto(e.target.value)}
                  error={errors.valorDesconto}
                  rightIcon={
                    tipoDesconto === 'PERCENTUAL'
                      ? <Percent size={16} />
                      : <span className="text-xs font-medium">R$</span>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Vigencia */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#6b5d57] dark:text-[#B8AEA4]" />
                <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Vigencia</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Data Inicio</label>
                  <input
                    type="datetime-local"
                    value={dtInicio}
                    onChange={(e) => setDtInicio(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62] focus:ring-2 focus:ring-[#db6f57]/20 dark:focus:ring-[#E07A62]/20 transition-colors"
                  />
                  <p className="mt-1 text-xs text-[#6b5d57] dark:text-[#7A716A]">Vazio = valido imediatamente</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Data Fim</label>
                  <input
                    type="datetime-local"
                    value={dtFim}
                    onChange={(e) => setDtFim(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62] focus:ring-2 focus:ring-[#db6f57]/20 dark:focus:ring-[#E07A62]/20 transition-colors"
                  />
                  <p className="mt-1 text-xs text-[#6b5d57] dark:text-[#7A716A]">Vazio = sem data limite</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limites */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#6b5d57] dark:text-[#B8AEA4]" />
                <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Limites de Utilizacao</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Max. utilizacoes globais"
                  type="number"
                  min="1"
                  placeholder="Ilimitado"
                  value={maxUtilizacoes}
                  onChange={(e) => setMaxUtilizacoes(e.target.value)}
                />
                <Input
                  label="Max. por organizacao"
                  type="number"
                  min="1"
                  placeholder="Ilimitado"
                  value={maxUtilizacoesPorOrg}
                  onChange={(e) => setMaxUtilizacoesPorOrg(e.target.value)}
                />
              </div>
              <p className="mt-2 text-xs text-[#6b5d57] dark:text-[#7A716A]">
                Deixe vazio para utilizacao ilimitada.
              </p>
            </CardContent>
          </Card>

          {/* Restricoes */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-[#6b5d57] dark:text-[#B8AEA4]" />
                <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Restricoes</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {/* Planos */}
                <div>
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-2">Planos permitidos</label>
                  <div className="flex flex-wrap gap-2">
                    {PLANOS_DISPONIVEIS.map((plano) => (
                      <button
                        key={plano}
                        type="button"
                        onClick={() => togglePlano(plano)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg border text-sm transition-all duration-200 capitalize',
                          planosPermitidos.includes(plano)
                            ? 'border-[#db6f57] bg-[#db6f57]/10 text-[#db6f57] dark:border-[#E07A62] dark:bg-[#E07A62]/10 dark:text-[#E07A62]'
                            : 'border-[#d8ccc4] dark:border-[#2D2925] text-[#6b5d57] dark:text-[#B8AEA4] hover:border-[#db6f57]/50 dark:hover:border-[#E07A62]/50'
                        )}
                      >
                        {plano}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-[#6b5d57] dark:text-[#7A716A]">Nenhum selecionado = todos os planos</p>
                </div>

                {/* Segmentos */}
                <div>
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-2">Segmentos permitidos</label>
                  <div className="flex flex-wrap gap-2">
                    {SEGMENTOS_DISPONIVEIS.map((segmento) => (
                      <button
                        key={segmento}
                        type="button"
                        onClick={() => toggleSegmento(segmento)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg border text-sm transition-all duration-200',
                          segmentosPermitidos.includes(segmento)
                            ? 'border-[#4f6f64] bg-[#4f6f64]/10 text-[#4f6f64] dark:border-[#6B8F82] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]'
                            : 'border-[#d8ccc4] dark:border-[#2D2925] text-[#6b5d57] dark:text-[#B8AEA4] hover:border-[#4f6f64]/50 dark:hover:border-[#6B8F82]/50'
                        )}
                      >
                        {segmento}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-[#6b5d57] dark:text-[#7A716A]">Nenhum selecionado = todos os segmentos</p>
                </div>

                {/* Organizacoes */}
                <Input
                  label="Organizacoes permitidas (IDs)"
                  placeholder="ex: 1, 5, 10"
                  value={organizacoesPermitidas}
                  onChange={(e) => setOrganizacoesPermitidas(e.target.value)}
                />
                <p className="-mt-3 text-xs text-[#6b5d57] dark:text-[#7A716A]">
                  Separe os IDs por virgula. Vazio = todas as organizacoes.
                </p>

                {/* Ciclo de cobranca */}
                <div>
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">Ciclo de cobranca</label>
                  <select
                    value={cicloCobranca}
                    onChange={(e) => setCicloCobranca(e.target.value as CicloCobranca | '')}
                    className="w-full h-10 px-3 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62] focus:ring-2 focus:ring-[#db6f57]/20 dark:focus:ring-[#E07A62]/20 transition-colors"
                  >
                    <option value="">Todos (mensal e anual)</option>
                    <option value="MENSAL">Apenas mensal</option>
                    <option value="ANUAL">Apenas anual</option>
                  </select>
                </div>

                {/* Tipo de aplicacao */}
                <div>
                  <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-2">Aplicacao do desconto</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoAplicacao('PRIMEIRA_COBRANCA')}
                      className={cn(
                        'flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200',
                        tipoAplicacao === 'PRIMEIRA_COBRANCA'
                          ? 'border-[#db6f57] bg-[#db6f57]/10 text-[#db6f57] dark:border-[#E07A62] dark:bg-[#E07A62]/10 dark:text-[#E07A62]'
                          : 'border-[#d8ccc4] dark:border-[#2D2925] text-[#6b5d57] dark:text-[#B8AEA4] hover:border-[#db6f57]/50 dark:hover:border-[#E07A62]/50'
                      )}
                    >
                      <Ticket size={16} />
                      Primeira cobranca
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoAplicacao('RECORRENTE')}
                      className={cn(
                        'flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200',
                        tipoAplicacao === 'RECORRENTE'
                          ? 'border-[#4f6f64] bg-[#4f6f64]/10 text-[#4f6f64] dark:border-[#6B8F82] dark:bg-[#6B8F82]/10 dark:text-[#6B8F82]'
                          : 'border-[#d8ccc4] dark:border-[#2D2925] text-[#6b5d57] dark:text-[#B8AEA4] hover:border-[#4f6f64]/50 dark:hover:border-[#6B8F82]/50'
                      )}
                    >
                      <Repeat size={16} />
                      Todas as cobrancas
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-[#6b5d57] dark:text-[#7A716A]">
                    {tipoAplicacao === 'PRIMEIRA_COBRANCA'
                      ? 'O desconto sera aplicado apenas na primeira cobranca da assinatura.'
                      : 'O desconto sera aplicado em todas as cobrancas enquanto o cupom estiver vigente.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="xl:sticky xl:top-20 xl:self-start space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Ticket size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
                <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Preview do Cupom</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border-2 border-dashed border-[#d8ccc4] dark:border-[#2D2925] p-5 text-center">
                {/* Coupon visual */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#db6f57] to-[#c55f49] dark:from-[#E07A62] dark:to-[#c96a54]">
                  <Ticket size={18} className="text-white" />
                  <span className="text-white font-bold text-lg font-mono tracking-wider">
                    {codigo || 'CODIGO'}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-3xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">
                    {tipoDesconto === 'PERCENTUAL'
                      ? `${valorDesconto || '0'}% OFF`
                      : valorDesconto
                        ? `${formatCurrency(Number(valorDesconto))} OFF`
                        : 'R$ 0,00 OFF'}
                  </p>
                  {descricao && (
                    <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">{descricao}</p>
                  )}
                </div>

                {/* Info badges */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {(dtInicio || dtFim) && (
                    <Badge variant="default">
                      <Calendar size={10} className="mr-1" />
                      {dtInicio ? new Date(dtInicio).toLocaleDateString('pt-BR') : 'Hoje'}
                      {' - '}
                      {dtFim ? new Date(dtFim).toLocaleDateString('pt-BR') : 'Sem fim'}
                    </Badge>
                  )}
                  {maxUtilizacoes && (
                    <Badge variant="info">
                      <Users size={10} className="mr-1" />
                      Max {maxUtilizacoes} usos
                    </Badge>
                  )}
                  {cicloCobranca && (
                    <Badge variant="plan">{cicloCobranca}</Badge>
                  )}
                  <Badge variant={tipoAplicacao === 'RECORRENTE' ? 'success' : 'info'}>
                    {tipoAplicacao === 'RECORRENTE' ? 'Recorrente' : '1a cobranca'}
                  </Badge>
                </div>

                {planosPermitidos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    {planosPermitidos.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#db6f57]/10 text-[#db6f57] dark:bg-[#E07A62]/10 dark:text-[#E07A62] font-medium capitalize"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-3 text-[10px] text-center text-[#6b5d57] dark:text-[#7A716A]">
                {tipoAplicacao === 'RECORRENTE'
                  ? 'Desconto aplicado em todas as cobrancas'
                  : 'Desconto aplicado apenas na primeira cobranca'}
              </p>
            </CardContent>
          </Card>

          {/* Quick info for edit mode */}
          {isEdit && cupomData && (
            <Card className="p-4">
              <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider mb-2">Informacoes</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6b5d57] dark:text-[#7A716A]">Utilizacoes</span>
                  <Badge variant={cupomData.totalUtilizado > 0 ? 'plan' : 'default'}>
                    {cupomData.totalUtilizado}
                    {cupomData.maxUtilizacoes ? `/${cupomData.maxUtilizacoes}` : ''}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b5d57] dark:text-[#7A716A]">Status</span>
                  <Badge variant={cupomData.vigente ? 'success' : cupomData.ativo ? 'warning' : 'danger'}>
                    {cupomData.vigente ? 'Vigente' : cupomData.ativo ? 'Expirado' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b5d57] dark:text-[#7A716A]">Criado em</span>
                  <span className="text-[#2a2420] dark:text-[#F5F0EB]">
                    {new Date(cupomData.dtCriacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {cupomData.dtAtualizacao && (
                  <div className="flex justify-between">
                    <span className="text-[#6b5d57] dark:text-[#7A716A]">Atualizado em</span>
                    <span className="text-[#2a2420] dark:text-[#F5F0EB]">
                      {new Date(cupomData.dtAtualizacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
