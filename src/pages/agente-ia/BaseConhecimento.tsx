import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { cn } from '../../utils/cn'
import {
  useDocumentosSuporte,
  useUploadDocumento,
  useExcluirDocumento,
  useSuporteImagens,
  useSuportePastas,
  useUploadImagem,
  useDeletarImagem,
  useCriarPasta,
  useDeletarPasta,
} from '../../queries/useSuporte'
import {
  Upload,
  Search,
  FileText,
  File,
  FileSpreadsheet,
  FileJson,
  FileCode,
  Download,
  Trash2,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive,
  Loader2,
  Image,
  FolderPlus,
  Folder,
  FolderOpen,
  Copy,
  ChevronLeft,
  Clipboard,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { DocumentoBase, SuporteImagem } from '../../types/suporte'

const tipoIcones: Record<string, React.ElementType> = {
  pdf: FileText,
  txt: File,
  xlsx: FileSpreadsheet,
  json: FileJson,
  docx: FileText,
  md: FileCode,
}

const tipoColors: Record<string, string> = {
  pdf: 'text-red-500',
  txt: 'text-blue-500',
  xlsx: 'text-green-500',
  json: 'text-amber-500',
  docx: 'text-indigo-500',
  md: 'text-violet-500',
}

export function BaseConhecimento() {
  const { data: documentos = [], isLoading } = useDocumentosSuporte()
  const uploadMutation = useUploadDocumento()
  const excluirMutation = useExcluirDocumento()

  // Imagens
  const [pastaAtual, setPastaAtual] = useState<string | undefined>(undefined)
  const { data: imagensResponse, isLoading: isLoadingImagens } = useSuporteImagens(pastaAtual)
  const { data: pastasResponse, isLoading: isLoadingPastas } = useSuportePastas()
  const uploadImagemMutation = useUploadImagem()
  const deletarImagemMutation = useDeletarImagem()
  const criarPastaMutation = useCriarPasta()
  const deletarPastaMutation = useDeletarPasta()

  const imagens = imagensResponse?.dados || []
  const pastas = pastasResponse?.dados || []

  const [search, setSearch] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState<DocumentoBase | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<DocumentoBase | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Imagens modais
  const [showUploadImagemModal, setShowUploadImagemModal] = useState(false)
  const [showCriarPastaModal, setShowCriarPastaModal] = useState(false)
  const [novaPasta, setNovaPasta] = useState('')
  const [imagemPreview, setImagemPreview] = useState<SuporteImagem | null>(null)
  const [imagemDeletar, setImagemDeletar] = useState<SuporteImagem | null>(null)
  const [pastaDeletar, setPastaDeletar] = useState<string | null>(null)
  const [dragActiveImagem, setDragActiveImagem] = useState(false)
  const [searchImagem, setSearchImagem] = useState('')
  const [arquivosParaUpload, setArquivosParaUpload] = useState<{ file: File; nome: string; previewUrl: string }[]>([])

  // Listener global de paste — só ativo quando modal de upload está aberto
  const uploadModalAbertoRef = useRef(showUploadImagemModal)
  uploadModalAbertoRef.current = showUploadImagemModal

  useEffect(() => {
    function onPaste(e: Event) {
      if (!uploadModalAbertoRef.current) return
      const clipboardEvent = e as ClipboardEvent
      const items = clipboardEvent.clipboardData?.items
      if (!items) return

      const imageFiles: File[] = []
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
            const ext = file.type.split('/')[1] || 'png'
            const renamed = new File([file], `screenshot_${timestamp}.${ext}`, { type: file.type })
            imageFiles.push(renamed)
          }
        }
      }

      if (imageFiles.length > 0) {
        clipboardEvent.preventDefault()
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        const maxSize = 5 * 1024 * 1024
        const validos: { file: File; nome: string; previewUrl: string }[] = []

        imageFiles.forEach(file => {
          if (!allowedTypes.includes(file.type)) return
          if (file.size > maxSize) return
          validos.push({ file, nome: '', previewUrl: URL.createObjectURL(file) })
        })

        if (validos.length > 0) {
          setArquivosParaUpload(prev => [...prev, ...validos])
          toast.success(`${validos.length} imagem(ns) colada(s) do clipboard`)
        }
      }
    }

    window.addEventListener('paste', onPaste, true)
    return () => window.removeEventListener('paste', onPaste, true)
  }, [])

  const filteredDocs = documentos.filter(d =>
    d.filename.toLowerCase().includes(search.toLowerCase())
  )

  const totalChunks = documentos.filter(d => d.status === 'processado').reduce((acc, d) => acc + d.chunks, 0)
  const totalDocs = documentos.filter(d => d.status === 'processado').length

  const handleUpload = (files: FileList | null) => {
    if (!files) return
    const allowedTypes = ['.pdf', '.txt', '.json', '.xlsx', '.docx', '.md']

    Array.from(files).forEach(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!allowedTypes.includes(ext)) {
        toast.error(`Tipo de arquivo não suportado: ${ext}`)
        return
      }
      uploadMutation.mutate(file)
    })

    setShowUploadModal(false)
  }

  const handleDelete = (doc: DocumentoBase) => {
    excluirMutation.mutate(doc.filename, {
      onSuccess: () => setShowDeleteModal(null),
    })
  }

  const handleDownload = (doc: DocumentoBase) => {
    toast.success(`Download de "${doc.filename}" — funcionalidade será implementada via webhook`)
  }

  return (
    <div className="space-y-6">
      {/* Métricas da Base */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">Documentos</p>
                <p className="text-xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">{totalDocs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <HardDrive size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">Chunks Indexados</p>
                <p className="text-xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">{totalChunks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">Processados</p>
                <p className="text-xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">
                  {totalDocs > 0 ? Math.round((totalDocs / documentos.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                placeholder="Buscar documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>
            <Button
              leftIcon={<Upload size={16} />}
              onClick={() => setShowUploadModal(true)}
            >
              Upload de Documento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Documentos da Base</h3>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[#db6f57] dark:text-[#E07A62]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                      <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Documento</th>
                      <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Tipo</th>
                      <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Tamanho</th>
                      <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Data</th>
                      <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Chunks</th>
                      <th className="text-right text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] uppercase tracking-wider px-6 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d8ccc4] dark:divide-[#2D2925]">
                    {filteredDocs.map((doc) => {
                      const IconComp = tipoIcones[doc.tipo] || File
                      return (
                        <tr key={doc.id} className="hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <IconComp size={18} className={tipoColors[doc.tipo] || 'text-gray-500'} />
                              <span className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{doc.filename}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <Badge variant="default">{doc.tipo.toUpperCase()}</Badge>
                          </td>
                          <td className="px-6 py-3 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">{doc.tamanho || '-'}</td>
                          <td className="px-6 py-3 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                            {new Date(doc.criado_em).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-3">
                            {doc.status === 'processado' && (
                              <Badge variant="success">
                                <CheckCircle size={10} className="mr-1" /> Processado
                              </Badge>
                            )}
                            {doc.status === 'processando' && (
                              <Badge variant="info">
                                <Clock size={10} className="mr-1 animate-spin" /> Processando
                              </Badge>
                            )}
                            {doc.status === 'erro' && (
                              <Badge variant="danger">
                                <AlertCircle size={10} className="mr-1" /> Erro
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-3 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">{doc.chunks || '-'}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setShowPreviewModal(doc)}
                                className="p-1.5 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
                                title="Visualizar"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleDownload(doc)}
                                className="p-1.5 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
                                title="Baixar"
                              >
                                <Download size={16} />
                              </button>
                              <button
                                onClick={() => setShowDeleteModal(doc)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {filteredDocs.length === 0 && (
                <div className="text-center py-12">
                  <FileText size={40} className="mx-auto text-[#d8ccc4] dark:text-[#2D2925] mb-3" />
                  <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                    {documentos.length === 0 ? 'Nenhum documento na base de conhecimento' : 'Nenhum documento encontrado'}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white dark:bg-[#1A1715] rounded-2xl border border-[#d8ccc4] dark:border-[#2D2925] w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8ccc4] dark:border-[#2D2925]">
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Upload de Documento</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
                  dragActive
                    ? 'border-[#db6f57] bg-[#db6f57]/5 dark:border-[#E07A62] dark:bg-[#E07A62]/5'
                    : 'border-[#d8ccc4] dark:border-[#2D2925] hover:border-[#db6f57]/50 dark:hover:border-[#E07A62]/50'
                )}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(e.dataTransfer.files) }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload size={32} className="mx-auto text-[#db6f57] dark:text-[#E07A62] mb-3" />
                <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                  Formatos aceitos: PDF, TXT, JSON, XLSX, DOCX, MD
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.txt,.json,.xlsx,.docx,.md"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </div>
              <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mt-4">
                Os arquivos serão enviados para processamento via n8n e indexados na base de conhecimento do agente (PGVector).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPreviewModal(null)}>
          <div className="bg-white dark:bg-[#1A1715] rounded-2xl border border-[#d8ccc4] dark:border-[#2D2925] w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8ccc4] dark:border-[#2D2925]">
              <div className="flex items-center gap-2">
                {(() => { const Icon = tipoIcones[showPreviewModal.tipo] || File; return <Icon size={18} className={tipoColors[showPreviewModal.tipo] || 'text-gray-500'} /> })()}
                <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">{showPreviewModal.filename}</h3>
              </div>
              <button onClick={() => setShowPreviewModal(null)} className="text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Tipo</p>
                  <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{showPreviewModal.tipo.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Tamanho</p>
                  <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{showPreviewModal.tamanho || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Data Upload</p>
                  <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">
                    {new Date(showPreviewModal.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Chunks</p>
                  <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{showPreviewModal.chunks || 'Não processado'}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" leftIcon={<Download size={16} />} onClick={() => handleDownload(showPreviewModal)}>
                  Baixar
                </Button>
                <Button variant="danger" leftIcon={<Trash2 size={16} />} onClick={() => { setShowPreviewModal(null); setShowDeleteModal(showPreviewModal) }}>
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(null)}>
          <div className="bg-white dark:bg-[#1A1715] rounded-2xl border border-[#d8ccc4] dark:border-[#2D2925] w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-2">Excluir Documento</h3>
              <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4] mb-6">
                Tem certeza que deseja excluir <strong>"{showDeleteModal.filename}"</strong> da base de conhecimento?
                Esta ação irá remover o documento e todos os seus chunks indexados no PGVector.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setShowDeleteModal(null)}>Cancelar</Button>
                <Button
                  variant="danger"
                  leftIcon={<Trash2 size={16} />}
                  onClick={() => handleDelete(showDeleteModal)}
                  isLoading={excluirMutation.isPending}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* GALERIA DE IMAGENS                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Toolbar Imagens */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image size={16} className="text-[#db6f57] dark:text-[#E07A62]" />
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Imagens da Base de Conhecimento</h3>
            </div>
            <Badge variant="default">{imagens.length} imagens</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Pastas */}
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setPastaAtual(undefined)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0',
                  pastaAtual === undefined
                    ? 'bg-[#db6f57] text-white dark:bg-[#E07A62]'
                    : 'bg-[#faf8f6] dark:bg-[#2D2925] text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#f0ebe6] dark:hover:bg-[#3D3530]'
                )}
              >
                <FolderOpen size={14} />
                Raiz
              </button>
              {isLoadingPastas ? (
                <Loader2 size={14} className="animate-spin text-[#6b5d57]" />
              ) : (
                pastas.map((p) => (
                  <button
                    key={p.nome}
                    onClick={() => setPastaAtual(p.nome)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 group',
                      pastaAtual === p.nome
                        ? 'bg-[#db6f57] text-white dark:bg-[#E07A62]'
                        : 'bg-[#faf8f6] dark:bg-[#2D2925] text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#f0ebe6] dark:hover:bg-[#3D3530]'
                    )}
                  >
                    <Folder size={14} />
                    {p.nome}
                    <span className="opacity-60">({p.totalImagens})</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPastaDeletar(p.nome) }}
                      className={cn(
                        'ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
                        pastaAtual === p.nome ? 'text-white/70 hover:text-white' : 'text-red-400 hover:text-red-500'
                      )}
                      title="Excluir pasta"
                    >
                      <X size={12} />
                    </button>
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<FolderPlus size={14} />}
                onClick={() => setShowCriarPastaModal(true)}
              >
                Nova Pasta
              </Button>
              <Button
                size="sm"
                leftIcon={<Upload size={14} />}
                onClick={() => setShowUploadImagemModal(true)}
              >
                Upload Imagem
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          {pastaAtual && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
              <button onClick={() => setPastaAtual(undefined)} className="hover:text-[#db6f57] dark:hover:text-[#E07A62] transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPastaAtual(undefined)} className="hover:text-[#db6f57] dark:hover:text-[#E07A62] transition-colors">
                Raiz
              </button>
              <span>/</span>
              <span className="font-medium text-[#2a2420] dark:text-[#F5F0EB]">{pastaAtual}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid de Imagens */}
      <Card>
        <CardContent>
          {/* Busca imagens */}
          <div className="mb-4">
            <Input
              placeholder="Buscar imagem..."
              value={searchImagem}
              onChange={(e) => setSearchImagem(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>

          {isLoadingImagens ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[#db6f57] dark:text-[#E07A62]" />
            </div>
          ) : (() => {
            const imagensFiltradas = imagens.filter(img =>
              img.nome.toLowerCase().includes(searchImagem.toLowerCase())
            )
            return imagensFiltradas.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imagensFiltradas.map((img) => (
                  <div
                    key={img.relativePath}
                    className="group relative rounded-xl border border-[#d8ccc4] dark:border-[#2D2925] overflow-hidden bg-[#faf8f6] dark:bg-[#2D2925] hover:border-[#db6f57]/50 dark:hover:border-[#E07A62]/50 transition-colors"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={img.url}
                        alt={img.nome}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setImagemPreview(img)}
                      />
                      {/* Overlay com ações */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => setImagemPreview(img)}
                          className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                          title="Visualizar"
                        >
                          <Eye size={16} className="text-[#2a2420]" />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(img.url)
                            toast.success('URL copiada!')
                          }}
                          className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                          title="Copiar URL"
                        >
                          <Copy size={16} className="text-[#2a2420]" />
                        </button>
                        <button
                          onClick={() => setImagemDeletar(img)}
                          className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="px-2.5 py-2">
                      <p className="text-xs font-medium text-[#2a2420] dark:text-[#F5F0EB] truncate" title={img.nome}>
                        {img.nome}
                      </p>
                      <p className="text-[10px] text-[#6b5d57] dark:text-[#B8AEA4]">
                        {formatImageSize(img.tamanho)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Image size={40} className="mx-auto text-[#d8ccc4] dark:text-[#2D2925] mb-3" />
                <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                  {searchImagem ? 'Nenhuma imagem encontrada' : `Nenhuma imagem ${pastaAtual ? `na pasta "${pastaAtual}"` : 'na raiz'}`}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  leftIcon={<Upload size={14} />}
                  onClick={() => setShowUploadImagemModal(true)}
                >
                  Enviar primeira imagem
                </Button>
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Modal Upload Imagem */}
      {showUploadImagemModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => { setShowUploadImagemModal(false); setArquivosParaUpload([]) }}
        >
          <div className="bg-white dark:bg-[#1A1715] rounded-2xl border border-[#d8ccc4] dark:border-[#2D2925] w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8ccc4] dark:border-[#2D2925]">
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
                {arquivosParaUpload.length > 0 ? 'Nomear e Enviar' : 'Upload de Imagem'}
              </h3>
              <button onClick={() => { setShowUploadImagemModal(false); setArquivosParaUpload([]) }} className="text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {pastaAtual && (
                <div className="flex items-center gap-1.5 mb-3 text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                  <Folder size={14} />
                  <span>Pasta: <strong className="text-[#2a2420] dark:text-[#F5F0EB]">{pastaAtual}</strong></span>
                </div>
              )}

              {arquivosParaUpload.length === 0 ? (
                /* Passo 1: Selecionar arquivos */
                <div
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
                    dragActiveImagem
                      ? 'border-[#db6f57] bg-[#db6f57]/5 dark:border-[#E07A62] dark:bg-[#E07A62]/5'
                      : 'border-[#d8ccc4] dark:border-[#2D2925] hover:border-[#db6f57]/50 dark:hover:border-[#E07A62]/50'
                  )}
                  onDragOver={(e) => { e.preventDefault(); setDragActiveImagem(true) }}
                  onDragLeave={() => setDragActiveImagem(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragActiveImagem(false)
                    prepararArquivos(e.dataTransfer.files)
                  }}
                  onClick={() => document.getElementById('imagem-upload')?.click()}
                >
                  <Image size={32} className="mx-auto text-[#db6f57] dark:text-[#E07A62] mb-3" />
                  <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1">
                    Arraste, clique para selecionar ou cole (Ctrl+V)
                  </p>
                  <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                    Formatos: JPG, JPEG, PNG, GIF, WEBP · Max 5MB
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-[#b8aea4] dark:text-[#6b5d57]">
                    <Clipboard size={10} />
                    <span>Print screen? Cole aqui com Ctrl+V</span>
                  </div>
                  <input
                    id="imagem-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    multiple
                    className="hidden"
                    onChange={(e) => { prepararArquivos(e.target.files); e.target.value = '' }}
                  />
                </div>
              ) : (
                /* Passo 2: Nomear os arquivos */
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {arquivosParaUpload.map((item, idx) => {
                    const ext = item.file.name.split('.').pop() || ''
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-[#d8ccc4] dark:border-[#2D2925] bg-[#faf8f6] dark:bg-[#2D2925]">
                        <img
                          src={item.previewUrl}
                          alt=""
                          className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[#d8ccc4] dark:border-[#3D3530]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={item.nome}
                              onChange={(e) => {
                                setArquivosParaUpload(prev => prev.map((a, i) =>
                                  i === idx ? { ...a, nome: e.target.value } : a
                                ))
                              }}
                              placeholder={item.file.name.replace(/\.[^.]+$/, '')}
                              className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-[#d8ccc4] dark:border-[#3D3530] bg-white dark:bg-[#1A1715] text-sm text-[#2a2420] dark:text-[#F5F0EB] placeholder:text-[#b8aea4] focus:outline-none focus:ring-2 focus:ring-[#db6f57]/30"
                            />
                            <span className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] shrink-0">.{ext}</span>
                          </div>
                          <p className="text-[10px] text-[#6b5d57] dark:text-[#B8AEA4] mt-1">
                            {formatImageSize(item.file.size)} · Vazio = nome original
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            URL.revokeObjectURL(item.previewUrl)
                            setArquivosParaUpload(prev => prev.filter((_, i) => i !== idx))
                          }}
                          className="p-1 text-red-400 hover:text-red-500 shrink-0"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )
                  })}

                  <div className="flex gap-2 justify-between pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setArquivosParaUpload([])}
                    >
                      Voltar
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<Upload size={14} />}
                      onClick={enviarArquivos}
                      isLoading={uploadImagemMutation.isPending}
                    >
                      Enviar {arquivosParaUpload.length > 1 ? `${arquivosParaUpload.length} imagens` : 'imagem'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Pasta */}
      {showCriarPastaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCriarPastaModal(false)}>
          <div className="bg-white dark:bg-[#1A1715] rounded-2xl border border-[#d8ccc4] dark:border-[#2D2925] w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d8ccc4] dark:border-[#2D2925]">
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Nova Pasta</h3>
              <button onClick={() => setShowCriarPastaModal(false)} className="text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Input
                placeholder="Nome da pasta (ex: fluxos-agendamento)"
                value={novaPasta}
                onChange={(e) => setNovaPasta(e.target.value)}
                leftIcon={<FolderPlus size={16} />}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCriarPasta() }}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCriarPastaModal(false)}>Cancelar</Button>
                <Button
                  onClick={handleCriarPasta}
                  disabled={!novaPasta.trim()}
                  isLoading={criarPastaMutation.isPending}
                >
                  Criar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Imagem */}
      {imagemPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setImagemPreview(null)}>
          <div className="bg-white dark:bg-[#1A1715] rounded-2xl border border-[#d8ccc4] dark:border-[#2D2925] w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#d8ccc4] dark:border-[#2D2925]">
              <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] truncate">{imagemPreview.nome}</p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(imagemPreview.url)
                    toast.success('URL copiada!')
                  }}
                  className="p-1.5 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
                  title="Copiar URL"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => { setImagemPreview(null); setImagemDeletar(imagemPreview) }}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setImagemPreview(null)} className="text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[calc(90vh-120px)]">
              <img src={imagemPreview.url} alt={imagemPreview.nome} className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
            <div className="px-6 py-3 border-t border-[#d8ccc4] dark:border-[#2D2925] flex items-center justify-between">
              <p className="text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                {formatImageSize(imagemPreview.tamanho)} · {imagemPreview.pasta || 'raiz'}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(imagemPreview.url)
                  toast.success('URL copiada!')
                }}
                className="text-xs text-[#db6f57] dark:text-[#E07A62] hover:underline flex items-center gap-1"
              >
                <Copy size={12} /> Copiar URL da imagem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Delete Imagem */}
      {imagemDeletar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setImagemDeletar(null)}>
          <div className="bg-white dark:bg-[#1A1715] rounded-2xl border border-[#d8ccc4] dark:border-[#2D2925] w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto mb-4 border border-[#d8ccc4] dark:border-[#2D2925]">
                <img src={imagemDeletar.url} alt="" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-2">Excluir Imagem</h3>
              <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4] mb-6">
                Excluir <strong>"{imagemDeletar.nome}"</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setImagemDeletar(null)}>Cancelar</Button>
                <Button
                  variant="danger"
                  leftIcon={<Trash2 size={16} />}
                  onClick={() => {
                    deletarImagemMutation.mutate(imagemDeletar.relativePath, {
                      onSuccess: () => setImagemDeletar(null),
                    })
                  }}
                  isLoading={deletarImagemMutation.isPending}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Delete Pasta */}
      {pastaDeletar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPastaDeletar(null)}>
          <div className="bg-white dark:bg-[#1A1715] rounded-2xl border border-[#d8ccc4] dark:border-[#2D2925] w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <Folder size={24} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-2">Excluir Pasta</h3>
              <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4] mb-6">
                Excluir a pasta <strong>"{pastaDeletar}"</strong> e todas as imagens dentro dela?
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setPastaDeletar(null)}>Cancelar</Button>
                <Button
                  variant="danger"
                  leftIcon={<Trash2 size={16} />}
                  onClick={() => {
                    deletarPastaMutation.mutate(pastaDeletar, {
                      onSuccess: () => {
                        if (pastaAtual === pastaDeletar) setPastaAtual(undefined)
                        setPastaDeletar(null)
                      },
                    })
                  }}
                  isLoading={deletarPastaMutation.isPending}
                >
                  Excluir Pasta
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function prepararArquivos(files: FileList | null) {
    if (!files) return
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    const validos: { file: File; nome: string; previewUrl: string }[] = []

    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Formato não suportado: ${file.name}`)
        return
      }
      if (file.size > maxSize) {
        toast.error(`Arquivo muito grande (max 5MB): ${file.name}`)
        return
      }
      validos.push({
        file,
        nome: '',
        previewUrl: URL.createObjectURL(file),
      })
    })

    if (validos.length > 0) {
      setArquivosParaUpload(prev => [...prev, ...validos])
    }
  }

  function enviarArquivos() {
    arquivosParaUpload.forEach(item => {
      const nome = item.nome.trim() || undefined
      uploadImagemMutation.mutate({ file: item.file, pasta: pastaAtual, nome })
      URL.revokeObjectURL(item.previewUrl)
    })
    setArquivosParaUpload([])
    setShowUploadImagemModal(false)
  }

  function handleCriarPasta() {
    const nome = novaPasta.trim()
    if (!nome) return
    criarPastaMutation.mutate(nome, {
      onSuccess: () => {
        setNovaPasta('')
        setShowCriarPastaModal(false)
      },
    })
  }
}

function formatImageSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
